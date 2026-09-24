import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import type { Cluster } from '../types';
import { ClusterMarker } from './ClusterMarker';
import { LiveLocationMarker } from './LiveLocationMarker';
import { decodeGeohash } from '../lib/geohash';
import { useLiveLocation } from '../lib/useLiveLocation';

interface MapViewProps {
  clusters: Cluster[];
  showNoise: boolean;
  selectedId: string | null;
  onSelect: (clusterId: string) => void;
}

// Central Mumbai - only used as a fallback before any real cluster data has
// loaded (or if a deployment genuinely has zero clusters). As soon as
// clusters arrive, FitBoundsOnLoad below pans/zooms to wherever they
// actually are - a backend's reports could be anywhere, not just Mumbai.
const DEFAULT_CENTER: [number, number] = [19.01, 72.86];

/** Fits the map to the cluster set exactly once, the first time it goes from empty to non-empty. */
function FitBoundsOnLoad({ clusters }: { clusters: Cluster[] }) {
  const map = useMap();
  const hasFitted = useRef(false);

  useEffect(() => {
    if (hasFitted.current || clusters.length === 0) return;
    hasFitted.current = true;
    const points = clusters.map((c) => {
      const { lat, lon } = decodeGeohash(c.geohash_bucket);
      return [lat, lon] as [number, number];
    });
    if (points.length === 1) {
      map.setView(points[0], 14);
    } else {
      map.fitBounds(points, { padding: [40, 40], maxZoom: 15 });
    }
  }, [clusters, map]);

  return null;
}

export function MapView({ clusters, showNoise, selectedId, onSelect }: MapViewProps) {
  const visible = clusters.filter((c) => c.state !== 'noise' || showNoise);
  const liveLocation = useLiveLocation();

  return (
    <div className="map-pane">
      <MapContainer center={DEFAULT_CENTER} zoom={12} zoomControl={true} scrollWheelZoom={true}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
        />
        <FitBoundsOnLoad clusters={clusters} />
        {visible.map((cluster) => (
          <ClusterMarker
            key={cluster.cluster_id}
            cluster={cluster}
            selected={cluster.cluster_id === selectedId}
            onSelect={onSelect}
          />
        ))}
        <LiveLocationMarker position={liveLocation.position} />
      </MapContainer>

      <button
        className={`locate-button${liveLocation.enabled ? ' active' : ''}`}
        onClick={liveLocation.toggle}
        aria-pressed={liveLocation.enabled}
        title={liveLocation.enabled ? 'Stop showing my location' : 'Show my live location'}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="3" />
          <path d="M12 2v3M12 19v3M2 12h3M19 12h3" strokeLinecap="round" />
        </svg>
        {liveLocation.enabled ? 'Tracking my location' : 'Show my location'}
      </button>
      {liveLocation.error && <div className="locate-error">{liveLocation.error}</div>}
    </div>
  );
}
