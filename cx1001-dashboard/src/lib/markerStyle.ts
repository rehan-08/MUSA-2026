import type { ClusterState } from '../types';

/** Pixel diameter for a cluster's marker dot, scaled gently by report volume. */
export function markerSize(state: ClusterState, reportCount: number): number {
  const n = Math.min(reportCount, 30);
  switch (state) {
    case 'noise':
      return 10;
    case 'rising_pattern':
      return Math.round(18 + n * 0.7);
    case 'escalated_alert':
      return Math.round(26 + n * 0.8);
  }
}
