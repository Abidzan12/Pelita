import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";

const ALGORITHM = "aes-256-gcm";
const IV_BYTES = 12;
const KEY_BYTES = 32;
const TAG_BYTES = 16;

export type EncryptedData = {
  ciphertext: Buffer;
  iv: Buffer;
  tag: Buffer;
};

function decodeKey(name: string): Buffer {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} belum diatur.`);
  }
  const key = Buffer.from(value, "base64");
  if (key.length !== KEY_BYTES) {
    throw new Error(`${name} harus berupa 32 byte base64.`);
  }
  return key;
}

export function encrypt(plaintext: string | Buffer): EncryptedData {
  const key = decodeKey("DATA_ENCRYPTION_KEY");
  const iv = randomBytes(IV_BYTES);
  const cipher = createCipheriv(ALGORITHM, key, iv);
  const input =
    typeof plaintext === "string" ? Buffer.from(plaintext, "utf8") : plaintext;
  const ciphertext = Buffer.concat([cipher.update(input), cipher.final()]);
  return { ciphertext, iv, tag: cipher.getAuthTag() };
}

export function decrypt(data: EncryptedData): Buffer {
  const key = decodeKey("DATA_ENCRYPTION_KEY");
  if (data.iv.length !== IV_BYTES) {
    throw new Error("IV tidak valid.");
  }
  if (data.tag.length !== TAG_BYTES) {
    throw new Error("Tag autentikasi tidak valid.");
  }
  const decipher = createDecipheriv(ALGORITHM, key, data.iv);
  decipher.setAuthTag(data.tag);
  return Buffer.concat([decipher.update(data.ciphertext), decipher.final()]);
}

export function decryptToString(data: EncryptedData): string {
  return decrypt(data).toString("utf8");
}
