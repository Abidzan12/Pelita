import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { jsonError, rejectCrossOrigin, requireAdmin } from "@/lib/admin-api";
import { deleteArticleImage, ARTICLE_IMAGE_MAX_BYTES } from "@/lib/article-image";
import { parseArticleForm } from "@/lib/article-upload";
import { readFormData, RequestTooLargeError } from "@/lib/request-body";
import { writeAuditLog } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const crossOrigin = rejectCrossOrigin(request);
  if (crossOrigin) {
    return crossOrigin;
  }

  const auth = await requireAdmin(["SATGAS", "SUPER_ADMIN"]);
  if ("response" in auth) {
    return auth.response;
  }

  const { id } = await params;

  let existing: { id: string; imageStorageKey: string | null } | null;
  try {
    existing = await prisma.article.findUnique({
      where: { id },
      select: { id: true, imageStorageKey: true },
    });
  } catch {
    return jsonError("Artikel belum bisa disimpan.", 500);
  }
  if (!existing) {
    return jsonError("Artikel tidak ditemukan.", 404);
  }

  let form: FormData;
  try {
    form = await readFormData(request, ARTICLE_IMAGE_MAX_BYTES + 1024 * 1024);
  } catch (error) {
    return error instanceof RequestTooLargeError
      ? jsonError("Berkas yang dikirim terlalu besar.", 413)
      : jsonError("Permintaan tidak valid.", 400);
  }

  let parsed: Awaited<ReturnType<typeof parseArticleForm>>;
  try {
    parsed = await parseArticleForm(form);
  } catch {
    return jsonError("Gambar belum bisa diproses. Coba berkas gambar lain.", 400);
  }
  if (!parsed.ok) {
    return jsonError(parsed.error, 400);
  }

  const { image, removeImage, data } = parsed.value;
  if (existing.imageStorageKey && !image && !removeImage && !data.imageAlt) {
    return jsonError("Tambahkan deskripsi singkat untuk gambar.", 400);
  }
  let article: { id: string; slug: string };
  try {
    article = await prisma.article.update({
      where: { id },
      data: {
        ...data,
        ...(image
          ? {
              imageStorageKey: image.storageKey,
              imageMimeType: image.mimeType,
              imageSizeBytes: image.sizeBytes,
              imageIv: Uint8Array.from(image.iv),
              imageAuthTag: Uint8Array.from(image.authTag),
            }
          : removeImage
            ? {
                imageStorageKey: null,
                imageMimeType: null,
                imageSizeBytes: null,
                imageIv: null,
                imageAuthTag: null,
              }
            : {}),
      },
      select: { id: true, slug: true },
    });
  } catch (error) {
    if (image) await deleteArticleImage(image.storageKey);
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return jsonError("Slug sudah dipakai artikel lain.", 409);
    }
    return jsonError("Artikel belum bisa disimpan.", 500);
  }

  await writeAuditLog(auth.admin.id, "UPDATE_ARTICLE", article.id);
  if ((image || removeImage) && existing.imageStorageKey) {
    await deleteArticleImage(existing.imageStorageKey);
  }
  return NextResponse.json({ ok: true, data: article });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const crossOrigin = rejectCrossOrigin(request);
  if (crossOrigin) {
    return crossOrigin;
  }

  const auth = await requireAdmin(["SATGAS", "SUPER_ADMIN"]);
  if ("response" in auth) {
    return auth.response;
  }

  const { id } = await params;

  let existing: { id: string; imageStorageKey: string | null } | null;
  try {
    existing = await prisma.article.findUnique({
      where: { id },
      select: { id: true, imageStorageKey: true },
    });
    if (!existing) {
      return jsonError("Artikel tidak ditemukan.", 404);
    }
    await prisma.article.delete({ where: { id } });
  } catch {
    return jsonError("Artikel belum bisa dihapus.", 500);
  }
  await writeAuditLog(auth.admin.id, "DELETE_ARTICLE", id);
  if (existing.imageStorageKey) {
    await deleteArticleImage(existing.imageStorageKey);
  }
  return NextResponse.json({ ok: true });
}
