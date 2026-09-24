import { createHash } from 'node:crypto';
import { createDb } from '../src/db/connection.js';
import { ClusteringService } from '../src/services/clustering.js';
import { noopHub } from '../src/ws/hub.js';

const DB_PATH = process.env.DB_PATH ?? './data/cx1001.db';

function deviceHash(label: string): string {
  return createHash('sha256').update(`cx1001-demo-device-${label}`).digest('hex');
}

function isoAt(daysAgo: number, hour: number, minute = 0): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - daysAgo);
  d.setUTCHours(hour, minute, 0, 0);
  return d.toISOString();
}

function main() {
  const db = createDb(DB_PATH);

  console.log(`Wiping existing demo data at ${DB_PATH} ...`);
  db.exec('DELETE FROM alerts; DELETE FROM reports; DELETE FROM clusters;');

  const clustering = new ClusteringService(db, noopHub);

  // --- Scenario A: "Station Corridor - Real Pattern" ------------------------
  // A genuine slow-build pattern: 8 distinct devices (2 of them report twice,
  // for 10 reports total) spread across 4 distinct 2-hour windows over 5
  // simulated days. Diversity and spread both clear their gates, and with 10
  // reports the volume term pushes confidence over 0.7 -> escalated_alert.
  const stationGeohash = 'tdr1qbrn'; // arbitrary fixed 8-char geohash cell
  const stationReports: { device: string; timestamp: string; category: 'catcalling' | 'loitering' | 'unsafe_lighting' | 'other'; note?: string }[] = [
    { device: 'a', timestamp: isoAt(5, 8), category: 'unsafe_lighting' },
    { device: 'b', timestamp: isoAt(5, 9), category: 'loitering' },
    { device: 'c', timestamp: isoAt(4, 14), category: 'catcalling' },
    { device: 'd', timestamp: isoAt(4, 15), category: 'catcalling' },
    { device: 'e', timestamp: isoAt(2, 20), category: 'loitering' },
    { device: 'f', timestamp: isoAt(2, 21), category: 'unsafe_lighting' },
    { device: 'g', timestamp: isoAt(0, 8), category: 'catcalling' },
    {
      device: 'h',
      timestamp: isoAt(0, 9),
      category: 'other',
      note: 'Same group of men has been hanging around the station exit most evenings this week, blocking the path.',
    },
    { device: 'a', timestamp: isoAt(0, 9, 15), category: 'catcalling' },
    { device: 'b', timestamp: isoAt(0, 9, 30), category: 'loitering' },
  ];

  let lastResult;
  for (const r of stationReports) {
    lastResult = clustering.ingestReport({
      geohash: stationGeohash,
      timestamp: r.timestamp,
      category: r.category,
      note: r.note,
      device_hash: deviceHash(`station-${r.device}`),
    });
  }
  console.log(
    `Scenario A "Station Corridor - Real Pattern": final state = ${lastResult!.cluster.state}, confidence = ${lastResult!.cluster.confidence_score}`
  );

  // --- Scenario B: "Market Square - Brigade Attempt" ------------------------
  // A coordinated burst: 30 distinct devices, all posting within a single
  // 10-minute span (one time window). Diversity clears the gate (30/30 = 1.0)
  // but spread stays at a single window, so it's capped at rising_pattern.
  const marketGeohash = 'tdr1qc4m';
  const burstStart = isoAt(1, 18, 0);
  const burstStartMs = new Date(burstStart).getTime();

  let marketResult;
  for (let i = 0; i < 30; i++) {
    const timestamp = new Date(burstStartMs + i * 20_000).toISOString(); // 20s apart, all inside one 10-min window
    marketResult = clustering.ingestReport({
      geohash: marketGeohash,
      timestamp,
      category: 'loitering',
      device_hash: deviceHash(`market-${i}`),
    });
  }
  console.log(
    `Scenario B "Market Square - Brigade Attempt": final state = ${marketResult!.cluster.state}, confidence = ${marketResult!.cluster.confidence_score}`
  );

  console.log('Seed complete.');
  db.close();
}

main();
