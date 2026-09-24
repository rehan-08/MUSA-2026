import { useCallback, useEffect, useRef, useState } from 'react';
import { MapPreview, type Coords } from './components/MapPreview';
import { ReportButton } from './components/ReportButton';
import { CategorySheet } from './components/CategorySheet';
import { OtherDetailSheet } from './components/OtherDetailSheet';
import { SettingsMenu } from './components/SettingsMenu';
import { SyncIndicator } from './components/SyncIndicator';
import {
  getOrCreateDeviceId,
  getUnsyncedCount,
  queueReport,
  regenerateDeviceId,
  updateReportCategory,
  updateReportNote,
  type ReportCategory,
} from './lib/db';
import { computeDeviceHash } from './lib/deviceHash';
import { encodeGeohash } from './lib/geohash';
import { startBackgroundSync } from './lib/sync';
import { generateId } from './lib/uuid';

// Fallback center for manual pin-drop when geolocation is denied/unavailable.
const DEFAULT_CENTER: Coords = { lat: 28.6139, lon: 77.209 }; // New Delhi
const GEOLOCATION_TIMEOUT_MS = 8000;

type LocationMode = 'pending' | 'geo' | 'manual';
type SheetStage = 'category' | 'other-detail' | null;

function App() {
  const [coords, setCoords] = useState<Coords | null>(null);
  const [locationMode, setLocationMode] = useState<LocationMode>('pending');
  const [deviceHash, setDeviceHash] = useState<string | null>(null);
  const [unsyncedCount, setUnsyncedCount] = useState(0);
  const [sheetStage, setSheetStage] = useState<SheetStage>(null);
  const pendingLocalId = useRef<string | null>(null);

  const refreshUnsyncedCount = useCallback(() => {
    void getUnsyncedCount().then(setUnsyncedCount);
  }, []);

  // Anonymous device identity, established once on first launch.
  useEffect(() => {
    void getOrCreateDeviceId()
      .then(computeDeviceHash)
      .then(setDeviceHash);
  }, []);

  // Location: live-track via watchPosition (not just a one-time fix) so the
  // spot you'd report from stays accurate as you move, falling back to a
  // manual pin-drop map if geolocation is denied/unavailable/times out.
  // Once manual mode is engaged - by denial, timeout, or the person dropping
  // their own pin - a late/renewed geolocation fix is never allowed to
  // silently override it; manual placement always wins for the rest of the session.
  useEffect(() => {
    if (!('geolocation' in navigator)) {
      setCoords(DEFAULT_CENTER);
      setLocationMode('manual');
      return;
    }

    let gotFirstFix = false;
    let manualLocked = false;

    const timeoutId = window.setTimeout(() => {
      if (gotFirstFix) return;
      manualLocked = true;
      setCoords(DEFAULT_CENTER);
      setLocationMode('manual');
    }, GEOLOCATION_TIMEOUT_MS);

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        if (manualLocked) return;
        gotFirstFix = true;
        window.clearTimeout(timeoutId);
        setCoords({ lat: pos.coords.latitude, lon: pos.coords.longitude });
        setLocationMode('geo');
      },
      () => {
        if (manualLocked || gotFirstFix) return;
        manualLocked = true;
        window.clearTimeout(timeoutId);
        setCoords(DEFAULT_CENTER);
        setLocationMode('manual');
      },
      { enableHighAccuracy: false, timeout: GEOLOCATION_TIMEOUT_MS, maximumAge: 5_000 }
    );

    return () => {
      window.clearTimeout(timeoutId);
      navigator.geolocation.clearWatch(watchId);
    };
  }, []);

  // Background sync: on reconnect + every 30s while the app is open.
  useEffect(() => {
    const stop = startBackgroundSync(refreshUnsyncedCount);
    return stop;
  }, [refreshUnsyncedCount]);

  const handleTap = useCallback(() => {
    if (!coords || !deviceHash) return;

    const localId = generateId();
    pendingLocalId.current = localId;

    void queueReport({
      local_id: localId,
      geohash: encodeGeohash(coords.lat, coords.lon),
      timestamp: new Date().toISOString(),
      device_hash: deviceHash,
      synced: false,
    }).then(refreshUnsyncedCount);

    setSheetStage('category');
  }, [coords, deviceHash, refreshUnsyncedCount]);

  const closeSheet = useCallback(() => {
    setSheetStage(null);
    pendingLocalId.current = null;
  }, []);

  const handlePickCategory = useCallback((category: ReportCategory) => {
    const localId = pendingLocalId.current;
    if (localId) void updateReportCategory(localId, category);

    // "Other" gets one more optional step - a free-text detail - before the
    // report is done being enriched. Every other category closes right away.
    if (category === 'other') {
      setSheetStage('other-detail');
    } else {
      setSheetStage(null);
      pendingLocalId.current = null;
    }
  }, []);

  const handleSubmitNote = useCallback((note: string) => {
    const localId = pendingLocalId.current;
    if (localId) void updateReportNote(localId, note);
    setSheetStage(null);
    pendingLocalId.current = null;
  }, []);

  const handleRegenerateIdentity = useCallback(async () => {
    const newId = await regenerateDeviceId();
    const newHash = await computeDeviceHash(newId);
    setDeviceHash(newHash);
  }, []);

  return (
    <div className="app">
      <header className="topbar">
        <span className="brand">SafeSignal</span>
        <div className="topbar-actions">
          <SyncIndicator unsyncedCount={unsyncedCount} />
          <SettingsMenu onRegenerateIdentity={handleRegenerateIdentity} />
        </div>
      </header>

      <div className="map-wrap">
        {coords && (
          <MapPreview
            coords={coords}
            interactive={locationMode === 'manual'}
            onPick={(next) => setCoords(next)}
          />
        )}
        {locationMode === 'manual' && <div className="map-hint">Tap the map to set your spot</div>}
      </div>

      <main className="tap-area">
        <h1>See something that felt unsafe?</h1>
        <ReportButton disabled={!coords || !deviceHash} onTap={handleTap} />
        <p className="hint-text">No account, no name, nothing traced back to you. Just a tap.</p>
      </main>

      {sheetStage === 'category' && <CategorySheet onPick={handlePickCategory} onSkip={closeSheet} />}
      {sheetStage === 'other-detail' && <OtherDetailSheet onSubmit={handleSubmitNote} onSkip={closeSheet} />}
    </div>
  );
}

export default App;
