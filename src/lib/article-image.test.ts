import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import sharp from "sharp";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  deleteArticleImage,
  detectArticleImageMime,
  readArticleImage,
  saveArticleImage,
} from "./article-image";

let imageDirectory: string;

beforeAll(async () => {
  process.env.DATA_ENCRYPTION_KEY = Buffer.alloc(32, 7).toString("base64");
  imageDirectory = await mkdtemp(path.join(tmpdir(), "pelita-article-image-"));
  process.env.ARTICLE_IMAGE_DIR = imageDirectory;
});

afterAll(async () => {
  await rm(imageDirectory, { recursive: true, force: true });
});

async function makeImage() {
  return sharp({
    create: { width: 8, height: 8, channels: 3, background: { r: 80, g: 110, b: 120 } },
  })
    .jpeg()
    .withExif({ IFD0: { Copyright: "PELITA-TEST" } })
    .toBuffer();
}

describe("article image storage", () => {
  it("validates image signatures and rejects a fake image", async () => {
    expect(detectArticleImageMime(await makeImage())).toBe("image/jpeg");
    expect(detectArticleImageMime(Buffer.from("bukan gambar"))).toBeNull();
  });

  it("keeps processed output within the upload limit", async () => {
    const image = await makeImage();
    const stored = await saveArticleImage(image, "image/jpeg");
    expect(stored.sizeBytes).toBeLessThanOrEqual(5 * 1024 * 1024);
    await deleteArticleImage(stored.storageKey);
  });

  it("encrypts the image and removes metadata before storage", async () => {
    const original = await makeImage();
    const stored = await saveArticleImage(original, "image/jpeg");
    const ciphertext = await readFile(path.join(imageDirectory, stored.storageKey));
    const decrypted = await readArticleImage(
      stored.storageKey,
      stored.iv,
      stored.authTag,
    );

    expect(ciphertext.equals(original)).toBe(false);
    expect((await sharp(decrypted).metadata()).exif).toBeUndefined();
    await deleteArticleImage(stored.storageKey);
    await expect(
      readArticleImage(stored.storageKey, stored.iv, stored.authTag),
    ).rejects.toMatchObject({
      code: "ENOENT",
    });
  });
});
