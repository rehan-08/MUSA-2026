# CX1001 API — "The Warning Sign Everyone Walked Past"

MUSA CodeX 2026 · Women Safety & Social Impact track · Team Midnight Meows

Anonymous, location-based safety report ingestion, clustering, and real-time
alerting. Reports come in with no identity attached beyond a salted device
hash; the API groups them by place and time and only raises an alert once a
cluster proves it's a *genuine pattern* — not a single spammer, and not a
coordinated brigade trying to fake one into existence.

## Run it

```bash
npm install
npm run seed    # wipes and repopulates the local SQLite db with demo data
npm run dev     # starts the API + websocket on http://localhost:4000
npm test        # runs all tests, including the anti-gaming suite
```

Run just the anti-gaming proof-of-concept in isolation:

```bash
npm test -- anti-gaming
```

No external database or infra is required — data lives in a local SQLite
file at `./data/cx1001.db` (created automatically). CORS is enabled for
`http://localhost:5173` and `http://localhost:5174` so a reporter app and a
dashboard running on Vite's default dev ports can call this API directly.

## How the scoring works, in plain English

Every cluster (one per ~50m location cell) gets a confidence score:

```
C = 0.4·D + 0.4·S + 0.2·V
```

- **D — diversity**: what fraction of reports in the cluster come from
  different devices. `unique devices / total reports`. Low diversity means
  one device (or a handful) is doing all the "reporting" — that's spam, not
  a pattern.
- **S — spread**: how many distinct 2-hour time windows the cluster's
  reports are spread across, out of a target of 3 (`distinct windows / 3`,
  capped at 1). Low spread means everything happened in one short burst —
  that's a coordinated brigade trying to manufacture an alert in one go, not
  an emerging real-world pattern.
- **V — volume**: a log-scaled report count, capped out around 20 reports,
  so a 21st report barely moves the needle. Volume is a *tiebreaker*, not a
  primary signal — it's only worth 20% of the score, and it's the last thing
  computed.

The important part isn't the formula — it's that **D and S are evaluated as
gates, in order, before C is ever computed**:

1. **Diversity gate.** If fewer than 60% of a cluster's reports come from
   distinct devices, the cluster is `noise` and nothing else is even
   calculated. This is what stops one malicious device from flooding a
   single spot and getting flagged.
2. **Spread gate.** If diversity passes but the reports don't touch at least
   3 distinct 2-hour windows, the cluster is `rising_pattern` and stops
   there — it can never reach `escalated_alert` no matter how many devices
   piled on. This is what stops a coordinated brigade: 30 different people
   (or bots) all reporting the same spot in the same 10-minute window looks
   diverse, but it's still just one burst, not a pattern over time.
3. **Only once both gates pass** does the API compute the full confidence
   score. `C >= 0.7` escalates to a real `Alert`; `0.4 <= C < 0.7` stays a
   `rising_pattern`; anything lower falls back to `noise`.

Every new report to a cluster triggers a full recompute from scratch (never
an incremental update), scoped to that cluster's *rolling 7-day* window of
activity — old reports age out of scoring even though they stay in the
database.

## Spoofing & abuse defenses — what's real, what isn't

The diversity + spread gates genuinely stop the two attacks they're built
for, *when reports come through the real reporter app*: one device spamming
a location (killed by the diversity gate, since a real app install only
ever gets one honest `device_hash`), and a coordinated flash-mob burst
(killed by the spread gate, since real reporters can't fake real elapsed
wall-clock time).

Against someone who skips the app and scripts `POST /reports` directly,
those same two signals are self-reported and would otherwise be
unverifiable:

- **`device_hash` is unverifiable by design.** The reporter's salt lives in
  public client JS, so anyone can compute `SHA-256(anything + salt)` and
  mint arbitrarily many "distinct devices" in a loop. There's no
  server-side proof a `device_hash` corresponds to a real, distinct
  install — that's an inherent consequence of not doing any device
  fingerprinting/attestation, which is itself a deliberate privacy choice.
- **A client-supplied `timestamp` used to be trusted outright**, which
  meant an attacker could fabricate reports "spread" across days in a
  single HTTP burst, instantly satisfying the spread gate without waiting
  real time. `clampReportTimestamp()` (`src/services/ingestion.ts`) now
  bounds this at the HTTP boundary: a timestamp within 6 hours of server
  receipt time is trusted as-is (generous enough to cover the reporter
  app's offline-queue-then-sync delay); anything further in the past or
  future is silently reinterpreted as "now" for storage/scoring. The
  report always still succeeds — it just can't buy fake historical spread.
  This is applied only in the route layer, so `scripts/seed-demo-data.ts`
  (which calls the clustering service directly) is unaffected and can
  still backfill realistic historical demo data.
- **Per-IP rate limiting** (20 req/60s, alongside the existing 5 req/60s
  per `device_hash`) blunts a single attacker script rotating through many
  forged `device_hash` values from one machine — the per-device limiter
  alone can't see that, since each forged hash gets its own fresh budget.
  Never logged or persisted — an ephemeral in-memory counter, same
  treatment as the existing device-keyed limiter.

What's still open, deliberately not addressed here: `PATCH /alerts/:id`
has no authentication (anyone reaching the API can mark or reopen any
alert), and CORS restricting browsers to `localhost:5173/5174` does
nothing against a non-browser client like curl — CORS is not an
authorization mechanism. Closing either requires inventing a real
credential story (a login system for authorities, or request signing for
reports), which is a product decision with real UX cost, not a drop-in fix.

## API contract

```
POST /reports
  body: { geohash, timestamp?, category?, note?, device_hash }
  - device_hash must already be a salted SHA-256 hex hash — never a raw device id.
  - note is optional free text, 1–500 chars — a detailed statement, meant to accompany category 'other'
    but not enforced to it. Never required.
  - Rate limited: 429 if the same device_hash posts more than 5 reports in the last 60 seconds.
  - 201 on success: { report_id }.
  - Never logs or persists anything beyond the Report shape — no IP, no raw device id, no user agent.

GET /clusters?state=noise|rising_pattern|escalated_alert   (state optional)
  - Array of clusters (report counts only — no device hashes).

GET /clusters/:id
  - Full cluster detail: report count per category, a timestamp histogram, and a `notes` array of
    { category, timestamp, note } for every report that included free text — never raw device_hash values.

GET /alerts?status=open|reviewed|closed
  - Array of alerts, each joined with a summary of its cluster.

PATCH /alerts/:id  { status }
  - For the dashboard to mark an alert reviewed/closed.

WebSocket at /ws
  - Broadcasts { type: 'cluster_updated', cluster } whenever a cluster's state changes.
  - Broadcasts { type: 'alert_created', alert } when a new alert is created.
  - Dashboard subscribes for live updates with no polling.
```

## Project layout

```
src/
  db/            schema + connection (the one place to swap SQLite for Postgres)
  models/        Report / Cluster / Alert types + SQL repositories
  services/
    ingestion.ts   request validation + per-device rate limiting
    scoring.ts     the pure anti-gaming scoring engine (gates 1-3)
    clustering.ts  geohash bucketing, rolling-window cluster orchestration
    alerts.ts      alert listing/status updates joined with cluster summaries
  routes/        Fastify HTTP handlers
  ws/            websocket broadcast hub
  server.ts      wiring + startup
scripts/
  seed-demo-data.ts   loads the two live-demo scenarios below
test/
  scoring.test.ts       pure scoring-engine unit tests
  clustering.test.ts    end-to-end clustering/alerting behavior
  anti-gaming.test.ts   the three judge-facing proof-of-concept scenarios
```

## Demo data (`npm run seed`)

- **Scenario A — "Station Corridor: Real Pattern."** 10 reports from 8
  distinct devices, spread across 4 time windows over 5 simulated days.
  Ends at `escalated_alert`.
- **Scenario B — "Market Square: Brigade Attempt."** 30 reports from 30
  distinct devices, all inside one 10-minute burst. Diversity clears the
  gate, spread never does — stays at `rising_pattern`, never escalates.

Point a dashboard at `GET /clusters` / `GET /alerts` and the `/ws` socket
after seeding to see both live.
