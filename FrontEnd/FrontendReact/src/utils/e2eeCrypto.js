// e2eeCrypto.js
// Utility for End-to-End Encryption using Web Crypto API

const ENCRYPTION_ALGORITHM = 'AES-GCM';
const PBKDF2_ITERATIONS = 100000;
const KEY_LENGTH = 256;

/**
 * Derives a shared symmetric key from a Match ID and a shared secret salt.
 * In a real-world scenario, this would use ECDH for true key exchange.
 * For this implementation, we derive a unique key per match.
 */
export const deriveKey = async (matchId) => {
  const enc = new TextEncoder();
  
  // Base passphrase (should ideally be exchanged securely between captains, not hardcoded)
  const passphrase = `SportifyX_Match_${matchId}_SecretKey_2026`;
  const keyMaterial = await window.crypto.subtle.importKey(
    'raw',
    enc.encode(passphrase),
    { name: 'PBKDF2' },
    false,
    ['deriveBits', 'deriveKey']
  );

  const salt = enc.encode(`Match_Salt_${matchId}`);
  
  const key = await window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: PBKDF2_ITERATIONS,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: ENCRYPTION_ALGORITHM, length: KEY_LENGTH },
    false,
    ['encrypt', 'decrypt']
  );

  return key;
};

export const encryptMessage = async (message, key) => {
  const enc = new TextEncoder();
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  
  const encryptedContent = await window.crypto.subtle.encrypt(
    {
      name: ENCRYPTION_ALGORITHM,
      iv: iv
    },
    key,
    enc.encode(message)
  );

  const encryptedBuffer = new Uint8Array(encryptedContent);
  const combined = new Uint8Array(iv.length + encryptedBuffer.length);
  combined.set(iv, 0);
  combined.set(encryptedBuffer, iv.length);

  // Convert to Base64 for easier transmission
  return btoa(String.fromCharCode.apply(null, combined));
};

export const decryptMessage = async (encryptedBase64, key) => {
  try {
    const combinedStr = atob(encryptedBase64);
    const combined = new Uint8Array(combinedStr.length);
    for (let i = 0; i < combinedStr.length; i++) {
      combined[i] = combinedStr.charCodeAt(i);
    }

    const iv = combined.slice(0, 12);
    const data = combined.slice(12);

    const decryptedContent = await window.crypto.subtle.decrypt(
      {
        name: ENCRYPTION_ALGORITHM,
        iv: iv
      },
      key,
      data
    );

    const dec = new TextDecoder();
    return dec.decode(decryptedContent);
  } catch (error) {
    console.error('Decryption failed:', error);
    return '[Tin nhắn không thể giải mã]';
  }
};
