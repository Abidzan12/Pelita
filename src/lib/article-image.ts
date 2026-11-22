import { randomUUID } from "node:crypto";
import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { decrypt, encrypt } from "./crypto";

export const ARTICLE_IMAGE_MAX_BYTES = 5 * 1024 * 1024;
export const ARTICLE_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
export type ArticleImageMime = (typeof ARTICLE_IMAGE_TYPES)[number];

const STORAGE_KEY_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export type StoredArticleImage = {
  storageKey: string;
  mimeType: ArticleImageMime;
  sizeBytes: number;
  iv: Buffer;
  authTag: Buffer;
};

function imageDirectory(): string {
  return path.resolve(process.env.ARTICLE_IMAGE_DIR ?? "./storage/article-images");
}

export function detectArticleImageMime(buffer: Buffer): ArticleImageMime | null {
  if (
    buffer.length >= 3 &&
    buffer[0] === 0xff &&
    buffer[1] === 0xd8 &&
    buffer[2] === 0xff
  ) {
    return "image/jpeg";
  }
  if (
    buffer.length >= 8 &&
    buffer
      .subarray(0, 8)
      .equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))
  ) {
    return "image/png";
  }
  if (
    buffer.length >= 12 &&
    buffer.toString("ascii", 0, 4) === "RIFF" &&
    buffer.toString("ascii", 8, 12) === "WEBP"
  ) {
    return "image/webp";
  }
  return null;
}

export async function saveArticleImage(
  buffer: Buffer,
  mimeType: ArticleImageMime,
): Promise<StoredArticleImage> {
  const image = sharp(buffer, { limitInputPixels: 25_000_000 }).rotate();
  const cleaned =
    mimeType === "image/png"
      ? await image.png().toBuffer()
      : mimeType === "image/webp"
        ? await image.webp({ quality: 85 }).toBuffer()
        : await image.jpeg({ quality: 85 }).toBuffer();
  if (cleaned.length > ARTICLE_IMAGE_MAX_BYTES) {
    throw new Error("Gambar artikel melebihi batas ukuran setelah diproses.");
  }
  const encrypted = encrypt(cleaned);
  const storageKey = randomUUID();
  const directory = imageDirectory();

  await mkdir(directory, { recursive: true, mode: 0o700 });
  await writeFile(path.join(directory, storageKey), encrypted.ciphertext, {
    mode: 0o600,
  });

  return {
    storageKey,
    mimeType,
    sizeBytes: cleaned.length,
    iv: encrypted.iv,
    authTag: encrypted.tag,
  };
}

export async function readArticleImage(
  storageKey: string,
  iv: Buffer,
  authTag: Buffer,
): Promise<Buffer> {
  if (!STORAGE_KEY_PATTERN.test(storageKey)) {
    throw new Error("Kunci penyimpanan gambar artikel tidak valid.");
  }
  const ciphertext = await readFile(path.join(imageDirectory(), storageKey));
  return decrypt({ ciphertext, iv, tag: authTag });
}

export async function deleteArticleImage(storageKey: string): Promise<void> {
  if (!STORAGE_KEY_PATTERN.test(storageKey)) {
    throw new Error("Kunci penyimpanan gambar artikel tidak valid.");
  }
  try {
    await unlink(path.join(imageDirectory(), storageKey));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
      throw error;
    }
  }
}
