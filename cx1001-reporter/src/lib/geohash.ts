import ngeohash from 'ngeohash';

/** Length-8 geohash (~50m precision), matching the backend's expected bucket precision. */
export function encodeGeohash(lat: number, lon: number): string {
  return ngeohash.encode(lat, lon, 8);
}
