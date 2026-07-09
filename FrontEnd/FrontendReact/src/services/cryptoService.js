// Web Crypto API Service for RSA-OAEP End-to-End Encryption

export const cryptoService = {
  /**
   * Sinh cặp khóa RSA-OAEP
   */
  generateKeyPair: async () => {
    return await window.crypto.subtle.generateKey(
      {
        name: "RSA-OAEP",
        modulusLength: 2048,
        publicExponent: new Uint8Array([1, 0, 1]),
        hash: "SHA-256",
      },
      true,
      ["encrypt", "decrypt"]
    );
  },

  /**
   * Export Public Key ra định dạng Base64 (SPKI)
   */
  exportPublicKey: async (publicKey) => {
    const exported = await window.crypto.subtle.exportKey("spki", publicKey);
    return btoa(String.fromCharCode(...new Uint8Array(exported)));
  },

  /**
   * Export Private Key ra định dạng Base64 (PKCS8)
   */
  exportPrivateKey: async (privateKey) => {
    const exported = await window.crypto.subtle.exportKey("pkcs8", privateKey);
    return btoa(String.fromCharCode(...new Uint8Array(exported)));
  },

  /**
   * Import Public Key từ chuỗi Base64
   */
  importPublicKey: async (base64Key) => {
    const binaryDerString = atob(base64Key);
    const binaryDer = new Uint8Array(binaryDerString.length);
    for (let i = 0; i < binaryDerString.length; i++) {
      binaryDer[i] = binaryDerString.charCodeAt(i);
    }
    return await window.crypto.subtle.importKey(
      "spki",
      binaryDer.buffer,
      {
        name: "RSA-OAEP",
        hash: "SHA-256",
      },
      true,
      ["encrypt"]
    );
  },

  /**
   * Import Private Key từ chuỗi Base64
   */
  importPrivateKey: async (base64Key) => {
    const binaryDerString = atob(base64Key);
    const binaryDer = new Uint8Array(binaryDerString.length);
    for (let i = 0; i < binaryDerString.length; i++) {
      binaryDer[i] = binaryDerString.charCodeAt(i);
    }
    return await window.crypto.subtle.importKey(
      "pkcs8",
      binaryDer.buffer,
      {
        name: "RSA-OAEP",
        hash: "SHA-256",
      },
      true,
      ["decrypt"]
    );
  },

  /**
   * Mã hóa văn bản với Public Key
   * Trả về chuỗi Base64
   */
  encryptMessage: async (publicKeyBase64, plaintext) => {
    if (!publicKeyBase64 || !plaintext) return null;
    try {
      const publicKey = await cryptoService.importPublicKey(publicKeyBase64);
      const encoder = new TextEncoder();
      const encoded = encoder.encode(plaintext);
      
      const ciphertext = await window.crypto.subtle.encrypt(
        {
          name: "RSA-OAEP",
        },
        publicKey,
        encoded
      );
      
      return btoa(String.fromCharCode(...new Uint8Array(ciphertext)));
    } catch (err) {
      console.error("Encryption error:", err);
      return null;
    }
  },

  /**
   * Giải mã văn bản với Private Key
   * Trả về văn bản gốc
   */
  decryptMessage: async (privateKeyBase64, ciphertextBase64) => {
    if (!privateKeyBase64 || !ciphertextBase64) return null;
    try {
      const privateKey = await cryptoService.importPrivateKey(privateKeyBase64);
      const binaryString = atob(ciphertextBase64);
      const binaryDer = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        binaryDer[i] = binaryString.charCodeAt(i);
      }
      
      const decrypted = await window.crypto.subtle.decrypt(
        {
          name: "RSA-OAEP",
        },
        privateKey,
        binaryDer.buffer
      );
      
      const decoder = new TextDecoder();
      return decoder.decode(decrypted);
    } catch (err) {
      // Báo lỗi im lặng nếu giải mã thất bại (có thể do lỗi dữ liệu cũ)
      console.warn("Decryption failed, message might be plaintext or keys mismatched.");
      return null;
    }
  }
};
