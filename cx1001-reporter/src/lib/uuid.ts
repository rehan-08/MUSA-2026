/**
 * crypto.randomUUID() is spec-gated to secure contexts (HTTPS, or
 * localhost) - same restriction as SubtleCrypto. Testing over a plain LAN
 * address (http://192.168.x.x) is exactly the case where it's unavailable,
 * and without a fallback the app fails silently at the very first step:
 * device identity creation, which cascades into every write ever working.
 *
 * The Math.random() fallback is fine for this purpose - these ids only
 * need practical uniqueness (a local queue key, or a device id that gets
 * salted+hashed before it ever means anything), never cryptographic
 * unpredictability.
 */
export function generateId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
