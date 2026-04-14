/**
 * End-to-End Encryption Utils using Web Crypto API.
 */

// --- 1. RSA Key Pair Generation ---
export const generateRSAKeyPair = async () => {
  const keyPair = await window.crypto.subtle.generateKey(
    {
      name: 'RSA-OAEP',
      modulusLength: 2048,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: 'SHA-256',
    },
    true, // extractable
    ['encrypt', 'decrypt']
  );

  const publicKeyJwk = await window.crypto.subtle.exportKey('jwk', keyPair.publicKey);
  const privateKeyJwk = await window.crypto.subtle.exportKey('jwk', keyPair.privateKey);

  return { publicKeyJwk, privateKeyJwk, keyPair };
};

// --- 2. Master Key Derivation (PBKDF2) ---
export const deriveMasterKey = async (password: string, saltString: string) => {
  const encoder = new TextEncoder();
  const passwordKey = await window.crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

  const saltByteArray = Uint8Array.from(atob(saltString), c => c.charCodeAt(0));

  const masterKey = await window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: saltByteArray,
      iterations: 100000,
      hash: 'SHA-256',
    },
    passwordKey,
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  );

  return masterKey;
};

// Generate a random salt for KDF
export const generateSalt = () => {
  const array = new Uint8Array(16);
  window.crypto.getRandomValues(array);
  return btoa(String.fromCharCode(...array));
};

// --- 3. Key Escrow (Encrypt / Decrypt Private Key) ---
export const encryptPrivateKey = async (privateKeyJwk: JsonWebKey, masterKey: CryptoKey) => {
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const encoder = new TextEncoder();
  const data = encoder.encode(JSON.stringify(privateKeyJwk));

  const encrypted = await window.crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    masterKey,
    data
  );

  const encryptedArray = new Uint8Array(encrypted);
  const combined = new Uint8Array(iv.length + encryptedArray.length);
  combined.set(iv);
  combined.set(encryptedArray, iv.length);

  return btoa(String.fromCharCode(...combined));
};

export const decryptPrivateKey = async (encryptedPrivateKeyStr: string, masterKey: CryptoKey) => {
  const combined = Uint8Array.from(atob(encryptedPrivateKeyStr), c => c.charCodeAt(0));
  const iv = combined.slice(0, 12);
  const data = combined.slice(12);

  const decrypted = await window.crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    masterKey,
    data
  );

  const decoder = new TextDecoder();
  const privateKeyJwk = JSON.parse(decoder.decode(decrypted)) as JsonWebKey;

  // Import it back into a CryptoKey
  const privateKey = await window.crypto.subtle.importKey(
    'jwk',
    privateKeyJwk,
    { name: 'RSA-OAEP', hash: 'SHA-256' },
    true,
    ['decrypt']
  );

  return { privateKeyJwk, privateKey };
};

// --- 4. Message Encryption (AES-GCM session key encrypted by RSA) ---
export const importPublicKey = async (publicKeyJwkStr: string) => {
  const jwk = JSON.parse(publicKeyJwkStr);
  return await window.crypto.subtle.importKey(
    'jwk',
    jwk,
    { name: 'RSA-OAEP', hash: 'SHA-256' },
    true,
    ['encrypt']
  );
};

export const encryptMessage = async (
  plaintext: string,
  recipientPublicKeyStr: string,
  senderPublicKeyStr: string
) => {
  const encoder = new TextEncoder();
  const data = encoder.encode(plaintext);

  // 1. Generate one-time symmetric session key
  const sessionKey = await window.crypto.subtle.generateKey(
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  );

  // 2. Encrypt the plaintext with the session key
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const encryptedContentBuffer = await window.crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    sessionKey,
    data
  );
  
  // Export session key to raw bytes
  const sessionKeyRaw = await window.crypto.subtle.exportKey('raw', sessionKey);

  // 3. Encrypt session key with Recipient's Public Key
  const recipientPubKey = await importPublicKey(recipientPublicKeyStr);
  const recipientEncryptedKeyBuffer = await window.crypto.subtle.encrypt(
    { name: 'RSA-OAEP' },
    recipientPubKey,
    sessionKeyRaw
  );

  // 4. Encrypt session key with Sender's Public Key (so we can read our own messages later)
  const senderPubKey = await importPublicKey(senderPublicKeyStr);
  const senderEncryptedKeyBuffer = await window.crypto.subtle.encrypt(
    { name: 'RSA-OAEP' },
    senderPubKey,
    sessionKeyRaw
  );

  // Convert to Base64 to store in MongoDB
  return {
    content: btoa(String.fromCharCode(...new Uint8Array(encryptedContentBuffer))),
    iv: btoa(String.fromCharCode(...iv)),
    recipientEncryptedKey: btoa(String.fromCharCode(...new Uint8Array(recipientEncryptedKeyBuffer))),
    senderEncryptedKey: btoa(String.fromCharCode(...new Uint8Array(senderEncryptedKeyBuffer))),
  };
};

export const decryptMessage = async (
  encryptedContentBase64: string,
  encryptedSessionKeyBase64: string,
  ivBase64: string,
  myPrivateKey: CryptoKey
) => {
  // 1. Decrypt the session key using our RSA private key
  const encryptedSessionKeyBuffer = Uint8Array.from(atob(encryptedSessionKeyBase64), c => c.charCodeAt(0));
  
  let sessionKeyRaw;
  try {
    sessionKeyRaw = await window.crypto.subtle.decrypt(
      { name: 'RSA-OAEP' },
      myPrivateKey,
      encryptedSessionKeyBuffer
    );
  } catch (err) {
    console.error('Failed to decrypt session key', err);
    return "[Decryption Failed]";
  }

  const sessionKey = await window.crypto.subtle.importKey(
    'raw',
    sessionKeyRaw,
    { name: 'AES-GCM', length: 256 },
    false,
    ['decrypt']
  );

  // 2. Decrypt the message content using the session key
  const encryptedContentBuffer = Uint8Array.from(atob(encryptedContentBase64), c => c.charCodeAt(0));
  const ivBuffer = Uint8Array.from(atob(ivBase64), c => c.charCodeAt(0));

  try {
    const decryptedContentBuffer = await window.crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: ivBuffer },
      sessionKey,
      encryptedContentBuffer
    );

    const decoder = new TextDecoder();
    return decoder.decode(decryptedContentBuffer);
  } catch (err) {
    console.error('Failed to decrypt content', err);
    return "[Decryption Failed]";
  }
};
