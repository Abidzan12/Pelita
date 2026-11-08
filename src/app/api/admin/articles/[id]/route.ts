import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { jsonError, rejectCrossOrigin, requireAdmin } from "@/lib/admin-api";
import { articleSchema } from "@/lib/admin-validators";
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

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("Permintaan tidak valid.", 400);
  }

  const parsed = articleSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(parsed.error.issues[0]?.message ?? "Data artikel tidak valid.", 400);
  }

  try {
    const existing = await prisma.article.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!existing) {
      return jsonError("Artikel tidak ditemukan.", 404);
    }

    const article = await prisma.article.update({
      where: { id },
      data: parsed.data,
      select: { id: true, slug: true },
    });
    await writeAuditLog(auth.admin.id, "UPDATE_ARTICLE", article.id);
    return NextResponse.json({ ok: true, data: article });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return jsonError("Slug sudah dipakai artikel lain.", 409);
    }
    return jsonError("Artikel belum bisa disimpan.", 500);
  }
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

  try {
    const existing = await prisma.article.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!existing) {
      return jsonError("Artikel tidak ditemukan.", 404);
    }
    await prisma.article.delete({ where: { id } });
    await writeAuditLog(auth.admin.id, "DELETE_ARTICLE", id);
    return NextResponse.json({ ok: true });
  } catch {
    return jsonError("Artikel belum bisa dihapus.", 500);
  }
}
