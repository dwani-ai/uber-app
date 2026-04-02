/**
 * UberApp catalog build: dwani-ai/talk upstream omits this module.
 */
export function base64ToBlob(base64, mimeType = "application/octet-stream") {
  if (!base64) return new Blob([], { type: mimeType });
  const binary = atob(base64);
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new Blob([bytes], { type: mimeType });
}
