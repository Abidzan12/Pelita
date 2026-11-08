import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const category = url.searchParams.get("category");

  try {
    const articles = await prisma.article.findMany({
      where: {
        published: true,
        ...(category ? { category } : {}),
      },
      orderBy: { createdAt: "desc" },
      select: {
        slug: true,
        title: true,
        summary: true,
        category: true,
        createdAt: true,
      },
    });
    return NextResponse.json({ ok: true, data: articles });
  } catch {
    return NextResponse.json(
      { ok: false, error: "Artikel belum bisa dimuat." },
      { status: 500 },
    );
  }
}
