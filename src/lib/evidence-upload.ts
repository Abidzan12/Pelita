import { MAX_EVIDENCE_PER_REPORT } from "./evidence-limits";
import {
  deleteEvidence,
  detectMimeType,
  getMaxUploadBytes,
  saveEvidence,
  type StoredEvidence,
} from "./storage";

export type CollectedEvidence =
  { ok: true; stored: StoredEvidence[] } | { ok: false; error: string };

async function discard(stored: StoredEvidence[]): Promise<void> {
  await Promise.allSettled(stored.map((item) => deleteEvidence(item.storageKey)));
}

export async function collectEvidence(
  form: FormData,
  remainingSlots: number,
): Promise<CollectedEvidence> {
  const files = form
    .getAll("evidence")
    .filter((value): value is File => value instanceof File && value.size > 0);

  if (files.length === 0) {
    return { ok: true, stored: [] };
  }

  if (files.length > remainingSlots) {
    return {
      ok: false,
      error: `Maksimal ${MAX_EVIDENCE_PER_REPORT} bukti per laporan.`,
    };
  }

  const maxBytes = getMaxUploadBytes();
  for (const file of files) {
    if (file.size > maxBytes) {
      return {
        ok: false,
        error: `Ukuran setiap berkas maksimal ${Math.floor(maxBytes / (1024 * 1024))} MB.`,
      };
    }
  }

  const stored: StoredEvidence[] = [];
  try {
    for (const file of files) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const mimeType = detectMimeType(buffer);
      if (!mimeType) {
        await discard(stored);
        return {
          ok: false,
          error:
            "Jenis berkas tidak didukung. Gunakan gambar JPG/PNG/WebP, PDF, MP3, atau MP4.",
        };
      }
      stored.push(await saveEvidence(buffer, mimeType));
    }
    return { ok: true, stored };
  } catch (error) {
    await discard(stored);
    throw error;
  }
}

export async function discardEvidence(stored: StoredEvidence[]): Promise<void> {
  await discard(stored);
}
