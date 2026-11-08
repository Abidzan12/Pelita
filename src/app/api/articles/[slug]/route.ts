import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;

  try {
    const article = await prisma.article.findFirst({
      where: { slug, published: true },
      select: {
        slug: true,
        title: true,
        summary: true,
        bodyMd: true,
        category: true,
        createdAt: true,
      },
    });

    if (!article) {
      return NextResponse.json(
        { ok: false, error: "Artikel tidak ditemukan." },
        { status: 404 },
      );
    }

    return NextResponse.json({ ok: true, data: article });
  } catch {
    return NextResponse.json(
      { ok: false, error: "Artikel belum bisa dimuat." },
      { status: 500 },
    );
  }
}
