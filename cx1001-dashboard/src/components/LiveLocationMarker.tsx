import { useEffect, useRef } from 'react';
import L from 'leaflet';
import { useMap } from 'react-leaflet';
import type { LiveLocationFix } from '../lib/useLiveLocation';

interface LiveLocationMarkerProps {
  position: LiveLocationFix | null;
}

/**
 * "You are here" dot + accuracy ring for the viewer's own live position -
 * visually distinct (navy, softer pulse) from cluster markers (cherry/amber)
 * so it's never mistaken for a report cluster. Recenters the map once, the
 * first time a fix arrives after being enabled, then leaves the viewer free
 * to pan/zoom on their own while the dot keeps tracking in the background.
 */
export function LiveLocationMarker({ position }: LiveLocationMarkerProps) {
  const map = useMap();
  const markerRef = useRef<L.Marker | null>(null);
  const circleRef = useRef<L.Circle | null>(null);
  const firedFirstFix = useRef(false);

  useEffect(() => {
    if (!position) {
      markerRef.current?.remove();
      markerRef.current = null;
      circleRef.current?.remove();
      circleRef.current = null;
      firedFirstFix.current = false;
      return;
    }

    const latLng: [number, number] = [position.lat, position.lon];

    if (!markerRef.current) {
      const icon = L.divIcon({
        className: 'my-location-icon',
        html: '<div class="my-location-dot"><span class="my-location-ring"></span></div>',
        iconSize: [0, 0],
      });
      markerRef.current = L.marker(latLng, { icon, zIndexOffset: 1000, interactive: false, keyboard: false }).addTo(map);
      circleRef.current = L.circle(latLng, {
        radius: position.accuracy,
        color: '#2f3c7e',
        weight: 1,
        fillColor: '#2f3c7e',
        fillOpacity: 0.08,
        interactive: false,
      }).addTo(map);
    } else {
      markerRef.current.setLatLng(latLng);
      circleRef.current?.setLatLng(latLng);
      circleRef.current?.setRadius(position.accuracy);
    }

    if (!firedFirstFix.current) {
      firedFirstFix.current = true;
      map.setView(latLng, Math.max(map.getZoom(), 15));
    }
  }, [position, map]);

  useEffect(
    () => () => {
      markerRef.current?.remove();
      circleRef.current?.remove();
    },
    []
  );

  return null;
}
