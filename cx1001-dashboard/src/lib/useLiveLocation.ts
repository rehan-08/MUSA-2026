import { useCallback, useEffect, useRef, useState } from 'react';

export interface LiveLocationFix {
  lat: number;
  lon: number;
  accuracy: number;
}

export interface LiveLocationState {
  enabled: boolean;
  position: LiveLocationFix | null;
  error: string | null;
  toggle: () => void;
}

/**
 * Opt-in, continuously-updating browser geolocation for the viewer's own
 * position (not a report - this never leaves the browser or touches the
 * backend). Off by default; toggling on starts `watchPosition` so the dot
 * tracks the viewer as they move, and toggling off immediately clears the
 * watch and drops the last known fix rather than leaving it stale on the map.
 */
export function useLiveLocation(): LiveLocationState {
  const [enabled, setEnabled] = useState(false);
  const [position, setPosition] = useState<LiveLocationFix | null>(null);
  const [error, setError] = useState<string | null>(null);
  const watchIdRef = useRef<number | null>(null);

  useEffect(() => {
    if (!enabled) {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      setPosition(null);
      return;
    }

    if (!('geolocation' in navigator)) {
      setError('Geolocation is not available in this browser.');
      setEnabled(false);
      return;
    }

    setError(null);
    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        setError(null);
        setPosition({ lat: pos.coords.latitude, lon: pos.coords.longitude, accuracy: pos.coords.accuracy });
      },
      (err) => {
        setError(err.code === err.PERMISSION_DENIED ? 'Location permission denied.' : 'Unable to get your location.');
        setEnabled(false);
      },
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 15000 }
    );

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    };
  }, [enabled]);

  const toggle = useCallback(() => setEnabled((v) => !v), []);

  return { enabled, position, error, toggle };
}
