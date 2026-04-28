// Funciones de encriptación/desencriptación usando Web Crypto API

export async function generateKey(password: string): Promise<CryptoKey> {
  const encoder = new TextEncoder()
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    "PBKDF2",
    false,
    ["deriveKey"]
  )

  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: encoder.encode("sav-file-editor-salt"),
      iterations: 100000,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  )
}

export async function encryptData(
  data: ArrayBuffer,
  password: string
): Promise<{ encrypted: ArrayBuffer; iv: Uint8Array }> {
  const key = await generateKey(password)
  const iv = crypto.getRandomValues(new Uint8Array(12))

  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    data
  )

  return { encrypted, iv }
}

export async function decryptData(
  encryptedData: ArrayBuffer,
  iv: Uint8Array,
  password: string
): Promise<ArrayBuffer> {
  const key = await generateKey(password)

  return crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, encryptedData)
}

export function arrayBufferToHex(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join(" ")
}

export function hexToArrayBuffer(hex: string): ArrayBuffer {
  const cleanHex = hex.replace(/\s+/g, "")
  const bytes = new Uint8Array(cleanHex.length / 2)
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(cleanHex.substr(i * 2, 2), 16)
  }
  return bytes.buffer
}

export function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)
  let binary = ""
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary)
}

export function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes.buffer
}
