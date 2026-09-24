import ngeohash from 'ngeohash';

export interface LatLng {
  lat: number;
  lon: number;
}

/** Decodes a geohash bucket to its cell's center lat/lng, for map placement. */
export function decodeGeohash(bucket: string): LatLng {
  const { latitude, longitude } = ngeohash.decode(bucket);
  return { lat: latitude, lon: longitude };
}
