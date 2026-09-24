import { useEffect, useRef } from 'react';
import L from 'leaflet';
import { useMap } from 'react-leaflet';
import type { Cluster } from '../types';
import { decodeGeohash } from '../lib/geohash';
import { markerSize } from '../lib/markerStyle';

interface ClusterMarkerProps {
  cluster: Cluster;
  selected: boolean;
  onSelect: (clusterId: string) => void;
}

/**
 * Renders one cluster as a plain Leaflet marker managed imperatively (not
 * react-leaflet's declarative <Marker>), so that a state change (e.g.
 * rising_pattern -> escalated_alert) updates CSS custom properties and a
 * class name on the SAME DOM node instead of swapping the icon element.
 * That's what lets the color/size change animate smoothly via a CSS
 * transition instead of snapping - swapping icons on every update would
 * replace the node and lose any "from" state to transition out of.
 */
export function ClusterMarker({ cluster, selected, onSelect }: ClusterMarkerProps) {
  const map = useMap();
  const markerRef = useRef<L.Marker | null>(null);
  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;

  useEffect(() => {
    const { lat, lon } = decodeGeohash(cluster.geohash_bucket);
    const icon = L.divIcon({
      className: 'cluster-marker-icon',
      html: `<div class="cluster-marker-dot state-${cluster.state}"><span class="cluster-marker-ring"></span></div>`,
      iconSize: [0, 0],
    });
    const marker = L.marker([lat, lon], { icon, riseOnHover: true }).addTo(map);
    marker.on('click', () => onSelectRef.current(cluster.cluster_id));
    markerRef.current = marker;

    return () => {
      marker.remove();
      markerRef.current = null;
    };
    // Marker is created once for this cluster_id; position/style updates happen in the effect below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, cluster.cluster_id]);

  useEffect(() => {
    const marker = markerRef.current;
    if (!marker) return;
    const { lat, lon } = decodeGeohash(cluster.geohash_bucket);
    marker.setLatLng([lat, lon]);

    const el = marker.getElement();
    const dot = el?.querySelector<HTMLElement>('.cluster-marker-dot');
    if (dot) {
      const size = markerSize(cluster.state, cluster.report_count);
      dot.style.setProperty('--size', `${size}px`);
      dot.className = `cluster-marker-dot state-${cluster.state}${selected ? ' is-selected' : ''}`;
    }
  }, [cluster.geohash_bucket, cluster.state, cluster.report_count, selected]);

  return null;
}
