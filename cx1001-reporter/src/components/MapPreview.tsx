import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export interface Coords {
  lat: number;
  lon: number;
}

interface MapPreviewProps {
  coords: Coords;
  interactive: boolean;
  onPick?: (coords: Coords) => void;
}

/**
 * Small map preview. Uses a vector circleMarker instead of Leaflet's default
 * pin icon so the app never has to ship/import marker PNG assets - keeps the
 * bundle tiny and sidesteps the classic bundler-breaks-default-icon-paths issue.
 */
export function MapPreview({ coords, interactive, onPick }: MapPreviewProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.CircleMarker | null>(null);
  const onPickRef = useRef(onPick);
  onPickRef.current = onPick;

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: [coords.lat, coords.lon],
      zoom: 16,
      zoomControl: false,
      attributionControl: false,
      dragging: interactive,
      scrollWheelZoom: false,
      doubleClickZoom: false,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
    }).addTo(map);

    const marker = L.circleMarker([coords.lat, coords.lon], {
      radius: 10,
      color: '#990011',
      weight: 3,
      fillColor: '#990011',
      fillOpacity: 0.35,
    }).addTo(map);

    if (interactive) {
      map.on('click', (e: L.LeafletMouseEvent) => {
        const next = { lat: e.latlng.lat, lon: e.latlng.lng };
        marker.setLatLng(e.latlng);
        onPickRef.current?.(next);
      });
    }

    mapRef.current = map;
    markerRef.current = marker;

    return () => {
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!mapRef.current || !markerRef.current) return;
    markerRef.current.setLatLng([coords.lat, coords.lon]);
    mapRef.current.setView([coords.lat, coords.lon]);
  }, [coords.lat, coords.lon]);

  return <div ref={containerRef} style={{ width: '100%', height: '100%' }} />;
}
