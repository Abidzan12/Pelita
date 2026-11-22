import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { readArticleImage } from "@/lib/article-image";
import { getCurrentAdmin } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;

  try {
    const article = await prisma.article.findFirst({
      where: { slug, imageStorageKey: { not: null } },
      select: {
        published: true,
        imageStorageKey: true,
        imageMimeType: true,
        imageIv: true,
        imageAuthTag: true,
      },
    });
    if (article && !article.published) {
      const admin = await getCurrentAdmin();
      if (!admin || (admin.role !== "SATGAS" && admin.role !== "SUPER_ADMIN")) {
        return new NextResponse(null, { status: 404 });
      }
    }
    if (
      !article?.imageStorageKey ||
      !article.imageMimeType ||
      !article.imageIv ||
      !article.imageAuthTag
    ) {
      return new NextResponse(null, { status: 404 });
    }

    const image = await readArticleImage(
      article.imageStorageKey,
      Buffer.from(article.imageIv),
      Buffer.from(article.imageAuthTag),
    );
    return new NextResponse(new Uint8Array(image), {
      headers: {
        "Content-Type": article.imageMimeType,
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return new NextResponse(null, { status: 404 });
  }
}
