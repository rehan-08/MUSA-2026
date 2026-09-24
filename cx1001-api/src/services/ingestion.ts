import { z } from 'zod';

/** device_hash must look like a salted SHA-256 hex digest, never a raw device id. */
export const reportBodySchema = z.object({
  geohash: z
    .string()
    .min(4, 'geohash must be at least 4 characters')
    .max(12, 'geohash must be at most 12 characters')
    .regex(/^[0-9b-hjkmnp-z]+$/i, 'geohash must be a valid base32 geohash string'),
  timestamp: z.string().datetime().optional(),
  category: z.enum(['catcalling', 'loitering', 'unsafe_lighting', 'other']).optional(),
  // Optional free-text detail. Capped well short of an essay - this is a
  // quick anonymous flag, not a report form, and a hard cap also blunts it
  // as an abuse/storage vector.
  note: z.string().trim().min(1).max(500).optional(),
  device_hash: z
    .string()
    .regex(/^[a-f0-9]{64}$/i, 'device_hash must be a 64-character hex SHA-256 hash, not a raw device id'),
});

export type ReportBody = z.infer<typeof reportBodySchema>;

const DEFAULT_RATE_LIMIT_MAX = 5;
const DEFAULT_RATE_LIMIT_WINDOW_MS = 60_000;

/**
 * Blunt ingestion-layer defense against hammering the endpoint: tracks
 * wall-clock receipt times (not the client-supplied report timestamp, which
 * can't be trusted) per key in memory, and rejects once a key exceeds its
 * limit in a trailing window. Never persisted or logged - just an ephemeral
 * in-memory counter, the same treatment already given to device_hash timing.
 *
 * Used twice, with different keys and thresholds: once per device_hash (5
 * req/60s - catches one device hammering the endpoint) and once per source
 * IP (looser, since one IP can legitimately be many real reporters on
 * shared wifi/NAT - catches a single attacker script rotating through many
 * forged device_hash values from one machine, which the device-keyed limiter
 * alone can't see). This is independent of - and much cruder than - the
 * diversity-gate defense in the scoring engine, which is what actually
 * prevents a flood from ever escalating into an alert.
 */
export class RateLimiter {
  private readonly hits = new Map<string, number[]>();

  constructor(
    private readonly maxRequests: number = DEFAULT_RATE_LIMIT_MAX,
    private readonly windowMs: number = DEFAULT_RATE_LIMIT_WINDOW_MS
  ) {}

  /** Returns true if this request is allowed; records it as a hit either way is NOT done - only allowed hits are recorded. */
  allow(key: string, now: number = Date.now()): boolean {
    const cutoff = now - this.windowMs;
    const existing = (this.hits.get(key) ?? []).filter((t) => t >= cutoff);

    if (existing.length >= this.maxRequests) {
      this.hits.set(key, existing);
      return false;
    }

    existing.push(now);
    this.hits.set(key, existing);
    return true;
  }
}

const MAX_TRUSTED_PAST_MS = 6 * 60 * 60 * 1000; // 6 hours
const CLOCK_SKEW_TOLERANCE_MS = 2 * 60 * 1000; // 2 minutes, for minor client clock drift

/**
 * Bounds a client-claimed report timestamp against server wall-clock time at
 * the HTTP ingestion boundary - never inside the scoring engine itself,
 * which needs to stay free to backfill real historical data (the seed
 * script calls it directly, bypassing this entirely).
 *
 * This deliberately does NOT reject implausible timestamps outright: the
 * reporter app's offline queue means a genuinely legitimate report can sync
 * hours after it was tapped, and the sync client silently retries forever on
 * any non-201 response - a hard rejection would mean that report never syncs
 * and the person never finds out why. Instead, a timestamp more than 6 hours
 * in the past (a generous allowance for real offline gaps) is silently
 * reinterpreted as "now" for storage/scoring/windowing purposes. The report
 * always succeeds; it just can no longer buy fake spread-gate credit by
 * claiming to be days old. A small future tolerance absorbs ordinary clock
 * drift; anything further in the future also clamps to now, since there's
 * no legitimate reason a report would claim to be from later than it arrived.
 */
export function clampReportTimestamp(claimed: string | undefined, now: number = Date.now()): string {
  if (!claimed) return new Date(now).toISOString();
  const claimedMs = Date.parse(claimed);
  if (Number.isNaN(claimedMs)) return new Date(now).toISOString();

  const min = now - MAX_TRUSTED_PAST_MS;
  const max = now + CLOCK_SKEW_TOLERANCE_MS;
  if (claimedMs < min || claimedMs > max) return new Date(now).toISOString();
  return claimed;
}
