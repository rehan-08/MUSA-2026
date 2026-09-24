import { sha256Hex } from './sha256Fallback';

// Fixed app-level salt mixed into every device hash. It's public (shipped in
// client code) - it doesn't need to be secret, it just needs to be constant,
// so the same raw device id always hashes to the same device_hash, without
// the raw id itself ever being transmitted or displayed.
const APP_SALT = 'cx1001-midnight-meows-v1';

function bufferToHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * SHA-256(device_id + APP_SALT) as lowercase hex - the only device identity
 * ever sent to the backend. Uses the native Web Crypto implementation when
 * available; falls back to a pure-JS SHA-256 (same algorithm, same output
 * format) when `crypto.subtle` is missing because the page is running in a
 * non-secure context - e.g. testing over a plain-HTTP LAN address without a
 * cert. A real deployment always runs under HTTPS, where this fallback is
 * never used.
 */
export async function computeDeviceHash(deviceId: string): Promise<string> {
  const data = new TextEncoder().encode(deviceId + APP_SALT);
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const digest = await crypto.subtle.digest('SHA-256', data);
    return bufferToHex(digest);
  }
  return sha256Hex(data);
}
