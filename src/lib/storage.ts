import { createHash, randomUUID } from "node:crypto";
import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { decrypt, encrypt } from "./crypto";
import { DEFAULT_MAX_UPLOAD_MB } from "./evidence-limits";

sharp.cache(false);
sharp.concurrency(2);

export class EvidenceTooLargeError extends Error {}
export class InvalidImageError extends Error {}

export const EVIDENCE_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
  "audio/mpeg",
  "audio/mp4",
  "video/mp4",
] as const;

export type EvidenceMime = (typeof EVIDENCE_MIME_TYPES)[number];

const IMAGE_MIMES = new Set<EvidenceMime>(["image/jpeg", "image/png", "image/webp"]);
const VIDEO_BRANDS = new Set([
  "isom",
  "iso2",
  "iso4",
  "iso5",
  "iso6",
  "mp41",
  "mp42",
  "avc1",
  "dash",
  "M4V ",
  "MSNV",
]);
const STORAGE_KEY_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export type StoredEvidence = {
  storageKey: string;
  mimeType: EvidenceMime;
  sizeBytes: number;
  sha256: string;
  iv: Buffer;
  authTag: Buffer;
};

export function getMaxUploadBytes(): number {
  const megabytes = Number(process.env.MAX_UPLOAD_MB ?? DEFAULT_MAX_UPLOAD_MB);
  const safeMegabytes =
    Number.isFinite(megabytes) && megabytes > 0 ? megabytes : DEFAULT_MAX_UPLOAD_MB;
  return Math.floor(safeMegabytes * 1024 * 1024);
}

function evidenceDirectory(): string {
  return path.resolve(process.env.EVIDENCE_DIR ?? "./storage/evidence");
}

export function detectMimeType(buffer: Buffer): EvidenceMime | null {
  if (buffer.length < 3) {
    return null;
  }

  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return "image/jpeg";
  }

  if (
    buffer.length >= 8 &&
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
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

  if (buffer.length >= 5 && buffer.toString("ascii", 0, 5) === "%PDF-") {
    return "application/pdf";
  }

  if (buffer.length >= 12 && buffer.toString("ascii", 4, 8) === "ftyp") {
    const brand = buffer.toString("ascii", 8, 12);
    if (brand.startsWith("M4A") || brand.startsWith("M4B")) {
      return "audio/mp4";
    }
    // HEIC/AVIF juga memakai kotak ftyp. Menyebutnya video berarti metadata
    // GPS-nya lolos tanpa dibersihkan, jadi hanya brand video yang diterima.
    return VIDEO_BRANDS.has(brand) ? "video/mp4" : null;
  }

  if (
    buffer.toString("ascii", 0, 3) === "ID3" ||
    (buffer[0] === 0xff && (buffer[1] & 0xe0) === 0xe0)
  ) {
    return "audio/mpeg";
  }

  return null;
}

async function stripMetadata(
  buffer: Buffer,
  mimeType: EvidenceMime,
): Promise<{ data: Buffer; mimeType: EvidenceMime }> {
  if (!IMAGE_MIMES.has(mimeType)) {
    // PDF/audio/video diterima apa adanya; UI menjelaskan metadata tidak dihapus otomatis.
    return { data: buffer, mimeType };
  }

  try {
    const image = sharp(buffer, { limitInputPixels: 25_000_000 })
      .timeout({ seconds: 10 })
      .rotate();

    if (mimeType === "image/png") {
      return { data: await image.png().toBuffer(), mimeType };
    }
    if (mimeType === "image/webp") {
      return { data: await image.webp({ quality: 90 }).toBuffer(), mimeType };
    }
    return { data: await image.jpeg({ quality: 90 }).toBuffer(), mimeType };
  } catch {
    throw new InvalidImageError(
      "Gambar belum bisa diproses. Pastikan berkas tidak rusak atau terlalu besar dimensinya.",
    );
  }
}

export async function saveEvidence(
  buffer: Buffer,
  mimeType: EvidenceMime,
): Promise<StoredEvidence> {
  const cleaned = await stripMetadata(buffer, mimeType);
  if (cleaned.data.length > getMaxUploadBytes()) {
    throw new EvidenceTooLargeError(
      "Ukuran berkas setelah diproses melebihi batas maksimal.",
    );
  }
  const sha256 = createHash("sha256").update(cleaned.data).digest("hex");
  const encrypted = encrypt(cleaned.data);
  const storageKey = randomUUID();
  const directory = evidenceDirectory();

  await mkdir(directory, { recursive: true, mode: 0o700 });
  await writeFile(path.join(directory, storageKey), encrypted.ciphertext, {
    mode: 0o600,
  });

  return {
    storageKey,
    mimeType: cleaned.mimeType,
    sizeBytes: cleaned.data.length,
    sha256,
    iv: encrypted.iv,
    authTag: encrypted.tag,
  };
}

export async function readEvidence(
  storageKey: string,
  iv: Buffer,
  authTag: Buffer,
): Promise<Buffer> {
  if (!STORAGE_KEY_PATTERN.test(storageKey)) {
    throw new Error("Kunci penyimpanan bukti tidak valid.");
  }
  const ciphertext = await readFile(path.join(evidenceDirectory(), storageKey));
  return decrypt({ ciphertext, iv, tag: authTag });
}

export async function deleteEvidence(storageKey: string): Promise<void> {
  if (!STORAGE_KEY_PATTERN.test(storageKey)) {
    throw new Error("Kunci penyimpanan bukti tidak valid.");
  }
  try {
    await unlink(path.join(evidenceDirectory(), storageKey));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
      throw error;
    }
  }
}
