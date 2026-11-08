import Link from "next/link";
import { BookOpen, ShieldCheck } from "lucide-react";
import { prisma } from "@/lib/db";
import { ARTICLE_CATEGORY_LABELS } from "@/lib/labels";

const CATEGORIES = ["BYSTANDER", "HUKUM", "PSIKOLOGIS", "UMUM"] as const;

export default async function EducationPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const requested = typeof params.category === "string" ? params.category : undefined;
  const category = CATEGORIES.includes(requested as (typeof CATEGORIES)[number])
    ? requested
    : undefined;

  const articles = await prisma.article.findMany({
    where: { published: true, ...(category ? { category } : {}) },
    orderBy: { createdAt: "desc" },
    select: {
      slug: true,
      title: true,
      summary: true,
      category: true,
      createdAt: true,
    },
  });

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <p className="text-sm font-semibold tracking-wide text-primary uppercase">
        Edukasi
      </p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight">
        Belajar untuk memahami dan membantu
      </h1>
      <p className="mt-3 leading-relaxed text-muted-foreground">
        Bacaan singkat tentang kekerasan seksual, perundungan, cara menjadi saksi yang
        aman, dan langkah merawat diri. Kamu bisa membaca tanpa harus melapor.
      </p>

      <nav aria-label="Filter kategori" className="mt-6 flex flex-wrap gap-2">
        <Link
          href="/edukasi"
          className={`inline-flex min-h-10 items-center rounded-md border px-3 text-sm font-medium ${
            category
              ? "border-border bg-background text-muted-foreground hover:bg-muted"
              : "border-primary bg-secondary text-secondary-foreground"
          }`}
        >
          Semua
        </Link>
        {CATEGORIES.map((item) => (
          <Link
            key={item}
            href={`/edukasi?category=${item}`}
            className={`inline-flex min-h-10 items-center rounded-md border px-3 text-sm font-medium ${
              category === item
                ? "border-primary bg-secondary text-secondary-foreground"
                : "border-border bg-background text-muted-foreground hover:bg-muted"
            }`}
          >
            {ARTICLE_CATEGORY_LABELS[item]}
          </Link>
        ))}
      </nav>

      {articles.length === 0 ? (
        <div className="mt-8 rounded-lg border border-dashed border-border p-8 text-center">
          <BookOpen aria-hidden="true" className="mx-auto size-6 text-muted-foreground" />
          <p className="mt-3 font-medium">Belum ada artikel di kategori ini.</p>
          <Link
            href="/edukasi"
            className="mt-2 inline-flex min-h-11 items-center text-sm font-medium text-primary underline-offset-4 hover:underline"
          >
            Lihat semua artikel
          </Link>
        </div>
      ) : (
        <ul className="mt-6 divide-y divide-border border-y border-border">
          {articles.map((article) => (
            <li key={article.slug} className="py-5">
              <p className="text-xs font-semibold tracking-wide text-primary uppercase">
                {ARTICLE_CATEGORY_LABELS[article.category] ?? article.category}
              </p>
              <h2 className="mt-1 text-xl font-semibold">
                <Link
                  href={`/edukasi/${article.slug}`}
                  className="underline-offset-4 hover:underline focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                >
                  {article.title}
                </Link>
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {article.summary}
              </p>
              <Link
                href={`/edukasi/${article.slug}`}
                className="mt-2 inline-flex min-h-11 items-center text-sm font-medium text-primary underline-offset-4 hover:underline"
              >
                Baca artikel
              </Link>
            </li>
          ))}
        </ul>
      )}

      <p className="mt-8 flex items-start gap-2 text-sm leading-relaxed text-muted-foreground">
        <ShieldCheck aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-primary" />
        Artikel bersifat informasi umum, bukan pengganti bantuan profesional. Jika kamu
        membutuhkan bantuan segera, buka{" "}
        <Link
          href="/darurat"
          className="font-medium text-primary underline-offset-4 hover:underline"
        >
          Kontak Darurat
        </Link>
        .
      </p>
    </div>
  );
}
