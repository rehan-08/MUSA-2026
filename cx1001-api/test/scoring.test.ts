import { describe, it, expect } from 'vitest';
import { floorToTwoHourWindow, scoreCluster, filterToRollingWindow } from '../src/services/scoring.js';

describe('floorToTwoHourWindow', () => {
  it('floors an odd hour down to the even hour bucket start', () => {
    expect(floorToTwoHourWindow('2026-09-20T15:23:11.000Z')).toBe('2026-09-20T14');
  });

  it('keeps an even hour as its own bucket start', () => {
    expect(floorToTwoHourWindow('2026-09-20T08:00:00.000Z')).toBe('2026-09-20T08');
  });

  it('groups both hours of a 2-hour bucket into the same window string', () => {
    const a = floorToTwoHourWindow('2026-09-20T14:01:00.000Z');
    const b = floorToTwoHourWindow('2026-09-20T15:59:00.000Z');
    expect(a).toBe(b);
  });

  it('is timezone independent (uses UTC)', () => {
    expect(floorToTwoHourWindow('2026-01-01T00:30:00.000Z')).toBe('2026-01-01T00');
  });
});

describe('scoreCluster gates', () => {
  it('gate 1: low diversity stops at noise without computing spread/confidence', () => {
    const reports = Array.from({ length: 10 }, (_, i) => ({
      device_hash: 'same-device',
      timestamp: `2026-09-2${i}T08:00:00.000Z`,
    }));
    const result = scoreCluster(reports);
    expect(result.state).toBe('noise');
    expect(result.diversity_score).toBeLessThan(0.6);
    expect(result.spread_score).toBe(0);
    expect(result.confidence_score).toBe(0);
  });

  it('gate 2: high diversity but single window stops at rising_pattern without computing confidence', () => {
    const reports = Array.from({ length: 10 }, (_, i) => ({
      device_hash: `device-${i}`,
      timestamp: '2026-09-20T08:05:00.000Z',
    }));
    const result = scoreCluster(reports);
    expect(result.diversity_score).toBe(1);
    expect(result.state).toBe('rising_pattern');
    expect(result.spread_score).toBeLessThan(1.0);
    expect(result.confidence_score).toBe(0);
  });

  it('gate 3: high diversity + spread + volume escalates to alert', () => {
    const reports = [
      { device_hash: 'd1', timestamp: '2026-09-01T08:00:00.000Z' },
      { device_hash: 'd2', timestamp: '2026-09-01T09:00:00.000Z' },
      { device_hash: 'd3', timestamp: '2026-09-02T14:00:00.000Z' },
      { device_hash: 'd4', timestamp: '2026-09-02T15:00:00.000Z' },
      { device_hash: 'd5', timestamp: '2026-09-03T20:00:00.000Z' },
      { device_hash: 'd6', timestamp: '2026-09-03T21:00:00.000Z' },
      { device_hash: 'd7', timestamp: '2026-09-04T08:00:00.000Z' },
      { device_hash: 'd8', timestamp: '2026-09-04T09:00:00.000Z' },
      { device_hash: 'd1', timestamp: '2026-09-04T09:15:00.000Z' },
      { device_hash: 'd2', timestamp: '2026-09-04T09:30:00.000Z' },
    ];
    const result = scoreCluster(reports);
    expect(result.diversity_score).toBe(0.8);
    expect(result.spread_score).toBe(1);
    expect(result.confidence_score).toBeGreaterThanOrEqual(0.7);
    expect(result.state).toBe('escalated_alert');
  });

  it('empty report set is noise', () => {
    expect(scoreCluster([]).state).toBe('noise');
  });
});

describe('filterToRollingWindow', () => {
  it('drops reports older than 7 days relative to the most recent report', () => {
    const reports = [
      { timestamp: '2026-01-01T00:00:00.000Z' },
      { timestamp: '2026-01-09T00:00:00.000Z' },
      { timestamp: '2026-01-10T00:00:00.000Z' },
    ];
    const active = filterToRollingWindow(reports);
    expect(active.map((r) => r.timestamp)).toEqual(['2026-01-09T00:00:00.000Z', '2026-01-10T00:00:00.000Z']);
  });
});
