# CX1001 — "The Warning Sign Everyone Walked Past"

MUSA CodeX 2026 · Women Safety & Social Impact track · Team Midnight Meows

Anonymous, location-based safety reporting with an anti-gaming scoring engine
that tells a genuine pattern apart from spam or a coordinated flood —
automatically, before it ever reaches a human.

## The problem

Make a safety-reporting tool too open, and it gets flooded with fake alerts.
Make it too strict, and real warning signs get dismissed as noise. CX1001's
scoring engine runs two sequential gates — are reports coming from genuinely
different people, and are they spread across real time — before it ever
calculates a confidence score. Only a report that clears both can ever
become a real alert.

## Three pieces, one system

| | | |
|---|---|---|
| [`cx1001-api/`](cx1001-api) | **Backend** | Fastify + SQLite API: ingestion, geohash clustering, the anti-gaming scoring engine, and a WebSocket hub for live updates. |
| [`cx1001-reporter/`](cx1001-reporter) | **Reporter app** | An installable PWA ("SafeSignal") — tap to report anonymously in under 5 seconds, no login, ever. Works offline. |
| [`cx1001-dashboard/`](cx1001-dashboard) | **Authority dashboard** | A live map of report clusters, color-coded by confidence, with a fully standalone mock mode for demos. |

Each has its own README with exact run instructions, API/data contracts, and
the design reasoning behind it. The short version, to run all three together
against a real backend:

```bash
# terminal 1
cd cx1001-api && npm install && npm run seed && npm run dev

# terminal 2
cd cx1001-reporter && npm install && npm run dev

# terminal 3
cd cx1001-dashboard && npm install && npm run dev:live
```

Then open the reporter at `http://localhost:5173` and the dashboard at
`http://localhost:5174`. Tap a report on the reporter app and watch it land
on the dashboard live, with no page refresh.

## The core idea, in one picture

A cluster's confidence score is `C = 0.4·D + 0.4·S + 0.2·V` — diversity,
spread, and volume — but it's never computed as a single weighted pass.
Diversity has to clear 0.6 first (kills one device flooding a location);
spread has to fully clear next (kills a coordinated burst that fakes
diversity but can't fake elapsed real time). Only once both gates pass does
a confidence score exist at all. `cx1001-api/README.md` has the full
explanation and the automated tests that prove it holds.

## Privacy

No login, no name, no phone number, anywhere in the system. A device is
identified only by a salted hash it computes locally — the raw ID never
leaves the device, the backend never logs an IP, and neither app persists
anything beyond what's documented in each README.
