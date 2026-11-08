import { createHash } from "node:crypto";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import sharp from "sharp";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  detectMimeType,
  getMaxUploadBytes,
  readEvidence,
  saveEvidence,
  deleteEvidence,
} from "./storage";

let evidenceDirectory: string;

beforeAll(async () => {
  process.env.DATA_ENCRYPTION_KEY = Buffer.alloc(32, 9).toString("base64");
  evidenceDirectory = await mkdtemp(path.join(tmpdir(), "pelita-evidence-"));
  process.env.EVIDENCE_DIR = evidenceDirectory;
});

afterAll(async () => {
  await rm(evidenceDirectory, { recursive: true, force: true });
});

async function makePng(): Promise<Buffer> {
  return sharp({
    create: { width: 4, height: 4, channels: 3, background: { r: 10, g: 20, b: 30 } },
  })
    .png()
    .toBuffer();
}

describe("detectMimeType", () => {
  it("mengenali gambar dari magic bytes", async () => {
    expect(detectMimeType(await makePng())).toBe("image/png");
  });

  it("menolak berkas dengan ekstensi palsu", () => {
    expect(detectMimeType(Buffer.from("ini bukan gambar"))).toBeNull();
    expect(detectMimeType(Buffer.from("%PDF-1.7"))).toBe("application/pdf");
    expect(detectMimeType(Buffer.from([0x49, 0x44, 0x33, 0x04]))).toBe("audio/mpeg");
  });
});

describe("saveEvidence", () => {
  it("menyimpan file terenkripsi dan dapat didekripsi kembali", async () => {
    const png = await makePng();
    const stored = await saveEvidence(png, "image/png");

    const onDisk = await readFile(path.join(evidenceDirectory, stored.storageKey));
    expect(onDisk.equals(png)).toBe(false);
    expect(onDisk.includes(Buffer.from("PNG"))).toBe(false);

    const decrypted = await readEvidence(stored.storageKey, stored.iv, stored.authTag);
    expect(createHash("sha256").update(decrypted).digest("hex")).toBe(stored.sha256);
    expect((await sharp(decrypted).metadata()).format).toBe("png");
  });

  it("menghapus metadata EXIF gambar", async () => {
    const withExif = await sharp({
      create: { width: 4, height: 4, channels: 3, background: { r: 200, g: 100, b: 50 } },
    })
      .jpeg()
      .withExif({ IFD0: { Copyright: "PELITA-TEST" } })
      .toBuffer();

    expect((await sharp(withExif).metadata()).exif).toBeTruthy();

    const stored = await saveEvidence(withExif, "image/jpeg");
    const decrypted = await readEvidence(stored.storageKey, stored.iv, stored.authTag);
    expect((await sharp(decrypted).metadata()).exif).toBeUndefined();
  });

  it("bisa menghapus file bukti", async () => {
    const stored = await saveEvidence(await makePng(), "image/png");
    await deleteEvidence(stored.storageKey);
    await expect(
      readEvidence(stored.storageKey, stored.iv, stored.authTag),
    ).rejects.toMatchObject({ code: "ENOENT" });
  });
});

describe("getMaxUploadBytes", () => {
  it("memakai batas default 10 MB", () => {
    const saved = process.env.MAX_UPLOAD_MB;
    delete process.env.MAX_UPLOAD_MB;
    expect(getMaxUploadBytes()).toBe(10 * 1024 * 1024);
    process.env.MAX_UPLOAD_MB = saved;
  });
});
