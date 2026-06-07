import { Buffer } from 'buffer';

globalThis.global = globalThis;
globalThis.Buffer = Buffer;

if (typeof window !== 'undefined') {
  window.Buffer = Buffer;
}

await import('./wallet-auth-poc-app.js');
