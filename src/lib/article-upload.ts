import { articleSchema } from "./admin-validators";
import {
  ARTICLE_IMAGE_MAX_BYTES,
  detectArticleImageMime,
  saveArticleImage,
  type StoredArticleImage,
} from "./article-image";

export type ParsedArticleForm = {
  data: ReturnType<typeof articleSchema.parse>;
  image: StoredArticleImage | null;
  removeImage: boolean;
};

export async function parseArticleForm(
  form: FormData,
): Promise<{ ok: true; value: ParsedArticleForm } | { ok: false; error: string }> {
  const fields = {
    slug: form.get("slug"),
    title: form.get("title"),
    summary: form.get("summary"),
    bodyMd: form.get("bodyMd"),
    category: form.get("category"),
    published: form.get("published") === "true",
    imageAlt: form.get("imageAlt") || undefined,
  };
  const parsed = articleSchema.safeParse(fields);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Data artikel tidak valid.",
    };
  }

  const removeImage = form.get("removeImage") === "true";
  const file = form.get("image");
  if (!(file instanceof File) || file.size === 0) {
    return { ok: true, value: { data: parsed.data, image: null, removeImage } };
  }
  if (!parsed.data.imageAlt) {
    return { ok: false, error: "Tambahkan deskripsi singkat untuk gambar." };
  }
  if (file.size > ARTICLE_IMAGE_MAX_BYTES) {
    return { ok: false, error: "Ukuran gambar maksimal 5 MB." };
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const mimeType = detectArticleImageMime(buffer);
  if (!mimeType) {
    return { ok: false, error: "Gunakan gambar JPG, PNG, atau WebP yang valid." };
  }

  try {
    const image = await saveArticleImage(buffer, mimeType);
    return { ok: true, value: { data: parsed.data, image, removeImage } };
  } catch {
    return { ok: false, error: "Gambar belum bisa diproses. Coba berkas gambar lain." };
  }
}
