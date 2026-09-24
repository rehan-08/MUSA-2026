import { describe, it, expect } from 'vitest';
import { clampReportTimestamp, RateLimiter } from '../src/services/ingestion.js';

describe('clampReportTimestamp', () => {
  const now = Date.parse('2026-09-23T12:00:00.000Z');

  it('passes through a recent, plausible timestamp unchanged', () => {
    const claimed = '2026-09-23T10:00:00.000Z'; // 2 hours ago
    expect(clampReportTimestamp(claimed, now)).toBe(claimed);
  });

  it('defaults to now when no timestamp is given', () => {
    expect(clampReportTimestamp(undefined, now)).toBe(new Date(now).toISOString());
  });

  it('clamps a timestamp more than 6 hours in the past to now - closing the fake-spread exploit', () => {
    const claimed = '2026-09-18T00:00:00.000Z'; // 5 days ago, exactly the kind of forged history a scripted attacker would send
    expect(clampReportTimestamp(claimed, now)).toBe(new Date(now).toISOString());
  });

  it('still allows a report claimed a few hours old, covering a real offline gap', () => {
    const claimed = '2026-09-23T07:00:00.000Z'; // 5 hours ago - within the 6h allowance
    expect(clampReportTimestamp(claimed, now)).toBe(claimed);
  });

  it('clamps a future timestamp beyond clock-skew tolerance to now', () => {
    const claimed = '2026-09-23T13:00:00.000Z'; // 1 hour in the future
    expect(clampReportTimestamp(claimed, now)).toBe(new Date(now).toISOString());
  });

  it('tolerates a couple of minutes of future clock drift', () => {
    const claimed = new Date(now + 60_000).toISOString(); // 1 minute in the future
    expect(clampReportTimestamp(claimed, now)).toBe(claimed);
  });

  it('falls back to now for an unparseable timestamp', () => {
    expect(clampReportTimestamp('not-a-date', now)).toBe(new Date(now).toISOString());
  });
});

describe('RateLimiter', () => {
  it('allows requests up to the configured max, then blocks within the window', () => {
    const limiter = new RateLimiter(3, 60_000);
    const now = 1_000_000;
    expect(limiter.allow('key', now)).toBe(true);
    expect(limiter.allow('key', now)).toBe(true);
    expect(limiter.allow('key', now)).toBe(true);
    expect(limiter.allow('key', now)).toBe(false);
  });

  it('tracks different keys independently, so one forged identity cannot exhaust another key\'s budget', () => {
    const limiter = new RateLimiter(1, 60_000);
    const now = 1_000_000;
    expect(limiter.allow('device-a', now)).toBe(true);
    expect(limiter.allow('device-b', now)).toBe(true); // different key, fresh budget
    expect(limiter.allow('device-a', now)).toBe(false);
  });

  it('allows requests again once the window has passed', () => {
    const limiter = new RateLimiter(1, 60_000);
    expect(limiter.allow('key', 1_000_000)).toBe(true);
    expect(limiter.allow('key', 1_000_000 + 60_001)).toBe(true);
  });
});
