# CX1001 authority dashboard

MUSA CodeX 2026 · Women Safety & Social Impact track · Team Midnight Meows

A live map for local authorities showing anonymous safety-report clusters,
color-coded by how confident the anti-gaming scoring engine is that a
genuine pattern — not spam, not a coordinated flood — is forming at that
location.

## Run it

```bash
npm install
npm run dev        # http://localhost:5174, mock mode (no backend needed)
npm run dev:live    # same port, talks to a real backend at localhost:4000
npm run build        # production build
```

`npm run dev` is fully standalone-demoable: it loads six sample clusters
around central Mumbai and simulates live websocket updates every ~8
seconds, so it works with zero backend connectivity. `npm run dev:live`
points at `VITE_API_URL` / `VITE_WS_URL` (default `http://localhost:4000`
and `ws://localhost:4000/ws`) instead — see `.env`.

## Marker color & state logic, in plain English

Every cluster is in one of three states, and the map only shows the two an
authority actually needs to act on:

- **Escalated alert (cherry red, `#990011`)** — the anti-gaming engine is
  confident this is a real pattern: reports came from enough different
  anonymous devices (not one person spamming) *and* spread out over enough
  distinct time windows (not a single coordinated burst). These get the
  largest markers, the most pronounced pulsing ring, and a **NEW** badge in
  the sidebar for their first 30 seconds on screen — that pulse is the
  moment an authority should actually notice.
- **Rising pattern (amber, `#AA1B2B`)** — partway there. Usually this means
  diversity is fine but the reports are still bunched into too few time
  windows to prove it's not just one coordinated moment; occasionally it
  means diversity itself hasn't cleared the bar yet. Shown with a smaller,
  gentler pulse.
- **Noise** — doesn't clear the diversity bar at all (one device, or a
  couple, doing most of the "reporting"). Hidden from the map and sidebar
  by default; a "Show noise clusters (debug)" toggle reveals them as small
  grey dots, purely for transparency into what the system is filtering out.

When a cluster's state changes — the actual "aha" moment of a demo — the
marker doesn't just snap to its new color and size. It's the same marker
element the whole time; only its color and size update, and a CSS
transition animates that change smoothly instead of jump-cutting.

Every websocket message (`cluster_updated` / `alert_created`) patches only
the one cluster or alert it refers to — the dashboard never re-fetches or
re-renders the whole map/list on a single update, which is what keeps the
map usable with dozens of clusters live at once.

## Live location

A "Show my location" button on the map (top-right) opts into continuously
tracking the viewer's own position via `watchPosition` — never sent
anywhere, purely local to the browser. It's a small navy pulsing dot with
an accuracy-radius circle, deliberately styled to never be confused with a
cherry/amber cluster marker. The map recenters once on the first fix, then
leaves the viewer free to pan around while the dot keeps tracking. Toggling
off immediately clears the watch and removes the marker.

## Detailed statements

When someone picks "Other" in the reporter app, they can optionally add a
short free-text statement (max 500 characters). The cluster detail panel's
"Detailed statements" section lists every one attached to that cluster,
each tagged with its category and timestamp — never alongside a device
hash, consistent with the rest of the system's anonymity guarantees.

## Notes on a couple of implementation choices

- **Marker rendering**: cluster markers are plain Leaflet markers managed
  imperatively (not react-leaflet's declarative `<Marker>`), specifically so
  a state change updates the *same* DOM node's CSS custom properties instead
  of swapping in a new icon element — swapping would lose the "from" state a
  CSS transition needs to animate smoothly.
- **Mock/live contract bridge**: this dashboard's contract names the detail
  fields `category_breakdown` and a `{date,count}[]` `timestamp_histogram`.
  The real CX1001 backend's actual response uses `category_counts` and a
  histogram keyed by 2-hour window strings instead. `src/lib/normalize.ts`
  accepts either shape (aggregating windows into daily counts), so
  `npm run dev:live` works against the real API as-is.
- **Mock simulator honesty**: rather than inventing a smooth confidence
  ramp, the mock simulator reuses the real `C = 0.4D + 0.4S + 0.2V` formula
  and the same sequential-gate logic as the backend. In practice that means
  a rising cluster's *spread* score visibly climbs each tick while
  confidence stays at 0 (exactly how the real engine reports it pre-gate),
  then jumps past 0.7 the moment spread clears 1.0 — a faithful
  reproduction of the real system's behavior, not a simplified animation.
