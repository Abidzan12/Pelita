import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { jsonError, rejectCrossOrigin, requireAdmin } from "@/lib/admin-api";
import { writeAuditLog } from "@/lib/auth";
import { deleteArticleImage, ARTICLE_IMAGE_MAX_BYTES } from "@/lib/article-image";
import { parseArticleForm } from "@/lib/article-upload";
import { readFormData, RequestTooLargeError } from "@/lib/request-body";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";

export async function GET() {
  const auth = await requireAdmin(["SATGAS", "SUPER_ADMIN"]);
  if ("response" in auth) {
    return auth.response;
  }

  try {
    const articles = await prisma.article.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        slug: true,
        title: true,
        summary: true,
        category: true,
        published: true,
        createdAt: true,
      },
    });
    return NextResponse.json({ ok: true, data: articles });
  } catch {
    return jsonError("Artikel belum bisa dimuat.", 500);
  }
}

export async function POST(request: Request) {
  const crossOrigin = rejectCrossOrigin(request);
  if (crossOrigin) {
    return crossOrigin;
  }

  const auth = await requireAdmin(["SATGAS", "SUPER_ADMIN"]);
  if ("response" in auth) {
    return auth.response;
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

  const { image, data } = parsed.value;
  let article: { id: string; slug: string };
  try {
    article = await prisma.article.create({
      data: {
        ...data,
        imageStorageKey: image?.storageKey,
        imageMimeType: image?.mimeType,
        imageSizeBytes: image?.sizeBytes,
        imageIv: image ? Uint8Array.from(image.iv) : undefined,
        imageAuthTag: image ? Uint8Array.from(image.authTag) : undefined,
      },
      select: { id: true, slug: true },
    });
  } catch (error) {
    if (image) {
      await deleteArticleImage(image.storageKey);
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return jsonError("Slug sudah dipakai artikel lain.", 409);
    }
    return jsonError("Artikel belum bisa disimpan.", 500);
  }
  await writeAuditLog(auth.admin.id, "CREATE_ARTICLE", article.id);
  return NextResponse.json({ ok: true, data: article }, { status: 201 });
}
