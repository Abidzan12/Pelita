import { beforeAll, describe, expect, it } from "vitest";
import { decrypt, decryptToString, encrypt } from "./crypto";

beforeAll(() => {
  process.env.DATA_ENCRYPTION_KEY = Buffer.alloc(32, 7).toString("base64");
});

describe("encrypt / decrypt", () => {
  it("mengembalikan teks yang sama setelah round-trip", () => {
    const plaintext = "Kronologi kejadian yang bersifat rahasia.";
    const result = encrypt(plaintext);
    expect(decryptToString(result)).toBe(plaintext);
  });

  it("mendukung data biner", () => {
    const plaintext = Buffer.from([0, 1, 2, 255, 254, 128]);
    const result = encrypt(plaintext);
    expect(decrypt(result).equals(plaintext)).toBe(true);
  });

  it("memakai IV berbeda pada setiap enkripsi", () => {
    const first = encrypt("sama");
    const second = encrypt("sama");
    expect(first.iv.equals(second.iv)).toBe(false);
    expect(first.ciphertext.equals(second.ciphertext)).toBe(false);
  });

  it("menolak ciphertext yang diubah", () => {
    const result = encrypt("data penting");
    result.ciphertext[0] ^= 0xff;
    expect(() => decrypt(result)).toThrow();
  });

  it("menolak tag autentikasi yang diubah", () => {
    const result = encrypt("data penting");
    result.tag[0] ^= 0xff;
    expect(() => decrypt(result)).toThrow();
  });

  it("menolak kunci yang salah", () => {
    const result = encrypt("data penting");
    process.env.DATA_ENCRYPTION_KEY = Buffer.alloc(32, 8).toString("base64");
    expect(() => decrypt(result)).toThrow();
    process.env.DATA_ENCRYPTION_KEY = Buffer.alloc(32, 7).toString("base64");
  });

  it("gagal jika kunci tidak diatur", () => {
    const saved = process.env.DATA_ENCRYPTION_KEY;
    delete process.env.DATA_ENCRYPTION_KEY;
    expect(() => encrypt("apa pun")).toThrow("DATA_ENCRYPTION_KEY belum diatur.");
    process.env.DATA_ENCRYPTION_KEY = saved;
  });
});
