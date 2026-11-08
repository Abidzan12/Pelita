// Prisma Bytes meminta Uint8Array yang dialokasikan di ArrayBuffer biasa.
// Buffer Node memakai ArrayBufferLike, jadi salin ke Uint8Array baru di batas DB.
export function toBytes(value: Buffer): Uint8Array<ArrayBuffer> {
  return new Uint8Array(value);
}
