import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import rehypeSanitize from "rehype-sanitize";
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
    },
  });

  if (!article) {
    notFound();
  }

  return (
    <article className="mx-auto max-w-3xl px-4 py-10">
      <Link
        href="/edukasi"
        className="inline-flex min-h-11 items-center text-sm font-medium text-primary underline-offset-4 hover:underline"
      >
        ← Semua artikel
      </Link>

      <p className="mt-2 text-xs font-semibold tracking-wide text-primary uppercase">
        {ARTICLE_CATEGORY_LABELS[article.category] ?? article.category}
      </p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight">{article.title}</h1>
      <p className="mt-3 text-lg leading-relaxed text-muted-foreground">
        {article.summary}
      </p>

      <div className="mt-6 border-t border-border pt-6">
        <div className="text-[15px] leading-relaxed text-foreground [&_a]:text-primary [&_a]:underline [&_a]:underline-offset-4 [&_blockquote]:border-l-2 [&_blockquote]:border-primary/30 [&_blockquote]:pl-4 [&_blockquote]:text-muted-foreground [&_code]:rounded [&_code]:bg-muted [&_code]:px-1 [&_h2]:mt-8 [&_h2]:mb-3 [&_h2]:text-2xl [&_h2]:font-semibold [&_h3]:mt-6 [&_h3]:mb-2 [&_h3]:text-xl [&_h3]:font-semibold [&_li]:my-1 [&_ol]:my-4 [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:my-4 [&_strong]:font-semibold [&_ul]:my-4 [&_ul]:list-disc [&_ul]:pl-5">
          <ReactMarkdown rehypePlugins={[rehypeSanitize]}>{article.bodyMd}</ReactMarkdown>
        </div>
      </div>

      <div className="mt-10 rounded-lg border border-primary/25 bg-secondary/50 p-4 text-sm leading-relaxed">
        <p className="font-semibold">Butuh bicara dengan seseorang?</p>
        <p className="mt-1 text-muted-foreground">
          Kamu bisa memesan slot konseling anonim atau melihat kanal bantuan resmi.
        </p>
        <div className="mt-3 flex flex-wrap gap-3">
          <Link
            href="/konseling"
            className="inline-flex min-h-11 items-center rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
          >
            Lihat jadwal konseling
          </Link>
          <Link
            href="/darurat"
            className="inline-flex min-h-11 items-center rounded-md border border-border bg-background px-4 text-sm font-semibold hover:bg-muted"
          >
            Kontak darurat
          </Link>
        </div>
      </div>
    </article>
  );
}
