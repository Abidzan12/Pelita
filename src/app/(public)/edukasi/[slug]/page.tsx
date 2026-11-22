import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import rehypeSanitize from "rehype-sanitize";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/db";
import { ARTICLE_CATEGORY_LABELS } from "@/lib/labels";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = await prisma.article.findFirst({
    where: { slug, published: true },
    select: { title: true, summary: true },
  });
  if (!article) {
    return { title: "Artikel tidak ditemukan" };
  }
  return { title: article.title, description: article.summary };
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = await prisma.article.findFirst({
    where: { slug, published: true },
    select: {
      title: true,
      summary: true,
      bodyMd: true,
      category: true,
      createdAt: true,
      imageAlt: true,
      imageStorageKey: true,
    },
  });

  if (!article) {
    notFound();
  }

  return (
    <div className="poster-page">
      <section className="poster-masthead">
        <div aria-hidden="true" className="poster-sun" />
        <div className="relative z-[1] mx-auto max-w-4xl px-5 pt-8 pb-24 sm:px-8 sm:pt-10 lg:px-10">
          <Link
            href="/edukasi"
            className="inline-flex min-h-11 items-center gap-2 text-sm font-bold text-[#f1c957] underline-offset-4 hover:underline"
          >
            <ArrowLeft aria-hidden="true" className="size-4" />
            Semua artikel
          </Link>
          <h1 className="poster-title mt-3 max-w-3xl">{article.title}</h1>
          <p className="poster-lead">{article.summary}</p>
        </div>
        <div className="hero-bottom-rule" aria-hidden="true">
          <span />
        </div>
      </section>

      <div className="mx-auto max-w-4xl px-4 pb-16 sm:px-8 sm:pb-20 lg:px-10 lg:pb-24">
        <div className="poster-sheet">
          <span className="poster-tab" aria-hidden="true">
            Bacaan · {ARTICLE_CATEGORY_LABELS[article.category] ?? article.category}
          </span>

          <div className="p-5 pt-8 sm:p-8 sm:pt-9 lg:p-10 lg:pt-10">
            {article.imageStorageKey ? (
              <div className="relative mb-6 aspect-[16/9] overflow-hidden rounded-[3px] border border-[#c7c9ba] bg-[#e6ede5]">
                <Image
                  src={`/api/articles/${slug}/image`}
                  alt={article.imageAlt ?? ""}
                  fill
                  sizes="(max-width: 768px) 100vw, 768px"
                  className="object-cover"
                />
              </div>
            ) : null}

            <div className="article-prose">
              <ReactMarkdown rehypePlugins={[rehypeSanitize]}>
                {article.bodyMd}
              </ReactMarkdown>
            </div>
          </div>

          <div className="poster-step-foot">
            <div className="max-w-[46ch]">
              <p className="font-extrabold text-[#183456]">
                Butuh bicara dengan seseorang?
              </p>
              <p className="poster-note mt-1">
                Kamu bisa memesan slot konseling anonim atau melihat kanal bantuan resmi.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/konseling"
                className="poster-submit inline-flex items-center px-5 text-sm"
              >
                Lihat jadwal konseling
              </Link>
              <Link href="/darurat" className="poster-action">
                Kontak darurat
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
