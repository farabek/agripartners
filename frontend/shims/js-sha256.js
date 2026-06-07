import { sha256 as nobleSha256 } from '@noble/hashes/sha256';

function toBytes(value) {
  if (typeof value === 'string') {
    return new TextEncoder().encode(value);
  }
  if (value instanceof Uint8Array) {
    return value;
  }
  if (value instanceof ArrayBuffer) {
    return new Uint8Array(value);
  }
  if (ArrayBuffer.isView(value)) {
    return new Uint8Array(value.buffer, value.byteOffset, value.byteLength);
  }
  if (Array.isArray(value)) {
    return Uint8Array.from(value);
  }
  throw new Error('input is invalid type');
}

function toHex(bytes) {
  return Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('');
}

function digest(value) {
  return Array.from(nobleSha256(toBytes(value)));
}

function sha256(value) {
  return toHex(nobleSha256(toBytes(value)));
}

sha256.array = digest;
sha256.digest = digest;
sha256.arrayBuffer = value => nobleSha256(toBytes(value)).buffer.slice(0);
sha256.hex = sha256;

export { sha256 };
export default sha256;
