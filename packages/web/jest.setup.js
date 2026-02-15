import '@testing-library/jest-dom'
import { TextEncoder, TextDecoder } from 'util'
import crypto from 'crypto'

global.TextEncoder = TextEncoder
global.TextDecoder = TextDecoder

// Polyfill Web Crypto API
// @ts-ignore
global.crypto = crypto.webcrypto

// Polyfill Blob.arrayBuffer for JSDOM
if (!Blob.prototype.arrayBuffer) {
  Blob.prototype.arrayBuffer = function() {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.readAsArrayBuffer(this);
    });
  };
}
