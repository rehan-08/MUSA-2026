# SafeSignal — CX1001 reporter app

MUSA CodeX 2026 · Women Safety & Social Impact track · Team Midnight Meows

A mobile-first, installable PWA that lets anyone anonymously flag an unsafe
moment at their current location in one tap. No login, no name, no phone
number — anywhere in the app. Works offline: taps are queued locally and
sync automatically once connectivity returns.

> "SafeSignal" is a placeholder name, easy to swap — see `manifest.name` in
> [`vite.config.ts`](vite.config.ts) and the `<title>`/`brand` text if you
> want something else before the pitch.

## Run it

```bash
npm install
npm run dev     # http://localhost:5173
npm run build   # installable production PWA build (dist/)
```

By default the app talks to a backend at `http://localhost:4000`. Point it
elsewhere by copying `.env.example` to `.env` and setting `VITE_API_URL`.
The app is fully usable even if no backend is running at all — reports just
stay queued locally until one is reachable.

## Offline queue + anonymous identity, in plain English

Every tap on the big button writes a report straight to IndexedDB — not
localStorage, so it survives app restarts and isn't limited to a few KB —
before anything is sent over the network. That queue entry *is* the
submission: the optional category sheet that follows only enriches the
already-queued record, and dismissing it (even by tapping outside) doesn't
undo anything. A background loop retries any unsynced reports on the
browser's `online` event and every 30 seconds the app is open, and it never
deletes a queued report on failure — a network error, an offline browser, or
a 429 rate-limit from the backend are all treated identically: leave it
queued, try again later. The result is a report that's durably captured the
instant you tap, whether or not the phone has signal right then.

Identity is handled the same way: on first launch the app generates a random
UUID with `crypto.randomUUID()` and stores it in IndexedDB — that raw id
never leaves the device and is never shown in the UI. Before any report is
sent, the app computes `SHA-256(device_id + a fixed app salt)` with the Web
Crypto API and sends only that hash. The backend can tell "these five
reports came from the same anonymous device" without ever learning who that
device belongs to. A low-key gear icon lets a user regenerate that id at
any time, which changes the hash for every future report and effectively
severs it from their past activity as far as the backend can tell.

## "Other" detail statements

Picking "Other" in the category sheet opens one more optional step: a short
free-text box (max 500 characters) for a detailed statement, with a visible
warning not to include your own name, phone number, or anyone else's
identifying details — the point is to describe what happened, not who was
involved or who's reporting it. Like category, this only enriches a report
that was already queued the moment the main button was tapped; skipping
(including tapping outside the box) leaves the report exactly as it was.
The backend stores this text and surfaces it to authorities in the
dashboard's cluster detail panel, alongside its category and timestamp —
never alongside a device hash.

## Notes on a couple of implementation choices

- **Map marker**: uses a Leaflet `circleMarker` (vector) instead of the
  default pin icon, so the app never needs to ship/import Leaflet's default
  marker PNGs — one less asset, one less classic bundler-breaks-the-marker-
  path headache.
- **Live location tracking**: uses `watchPosition`, not a one-time
  `getCurrentPosition` fix, so the spot you'd report from stays accurate if
  you're moving between opening the app and tapping the button. If
  geolocation is denied, unavailable, or takes more than 8 seconds, the map
  falls back to an interactive manual pin-drop mode instead — and once that
  fallback engages, a late/renewed geolocation fix is never allowed to
  silently override your manually-placed pin for the rest of the session.
- **Icons**: `public/icons/icon-source.svg` is the source of truth;
  `icon-192.png` / `icon-512.png` were rasterized from it once and committed
  — no build-time image tooling is required to run the app.
- **Insecure-context fallbacks**: `crypto.randomUUID()` and
  `crypto.subtle` are both spec-gated to secure contexts (HTTPS, or
  `localhost`) — testing over a plain-HTTP LAN address (e.g. from a phone
  on the same Wi-Fi) is exactly the case where they're unavailable, and
  without a fallback the app fails silently at the very first step: device
  identity creation, which cascades into the report button staying
  permanently disabled with no visible error. `src/lib/uuid.ts` and
  `src/lib/sha256Fallback.ts` (a from-scratch, test-vector-verified pure-JS
  SHA-256) provide equivalent fallbacks, used only when the native APIs
  are missing — a real HTTPS deployment always uses the native ones.
