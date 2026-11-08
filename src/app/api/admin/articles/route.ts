import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { jsonError, rejectCrossOrigin, requireAdmin } from "@/lib/admin-api";
import { articleSchema } from "@/lib/admin-validators";
import { writeAuditLog } from "@/lib/auth";
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
    const article = await prisma.article.create({
      data: parsed.data,
      select: { id: true, slug: true },
    });
    await writeAuditLog(auth.admin.id, "CREATE_ARTICLE", article.id);
    return NextResponse.json({ ok: true, data: article }, { status: 201 });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return jsonError("Slug sudah dipakai artikel lain.", 409);
    }
    return jsonError("Artikel belum bisa disimpan.", 500);
  }
}
