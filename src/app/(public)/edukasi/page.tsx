import Link from "next/link";
import { ArrowRight, BookOpen, ShieldCheck } from "lucide-react";
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
      imageAlt: true,
      imageStorageKey: true,
      createdAt: true,
    },
  });

  return (
    <div className="poster-page">
      <section className="poster-masthead">
        <div aria-hidden="true" className="poster-sun" />
        <div className="relative z-[1] mx-auto max-w-6xl px-5 pt-12 pb-16 sm:px-8 sm:pt-14 lg:px-10">
          <h1 className="poster-title max-w-3xl">
            Belajar untuk <span className="hero-highlight">memahami</span> dan membantu
          </h1>
          <p className="poster-lead">
            Bacaan singkat tentang kekerasan seksual, perundungan, cara menjadi saksi yang
            aman, dan langkah merawat diri. Kamu bisa membaca tanpa harus melapor.
          </p>
        </div>
        <div className="hero-bottom-rule" aria-hidden="true">
          <span />
        </div>
      </section>

      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-8 sm:py-12 lg:px-10">
        <nav aria-label="Filter kategori" className="flex flex-wrap gap-2">
          <Link
            href="/edukasi"
            aria-current={category ? undefined : "page"}
            className="filter-chip"
          >
            Semua
          </Link>
          {CATEGORIES.map((item) => (
            <Link
              key={item}
              href={`/edukasi?category=${item}`}
              aria-current={category === item ? "page" : undefined}
              className="filter-chip"
            >
              {ARTICLE_CATEGORY_LABELS[item]}
            </Link>
          ))}
        </nav>

        {articles.length === 0 ? (
          <div className="reading-empty mt-8">
            <BookOpen aria-hidden="true" className="mx-auto size-6 text-[#b34e3c]" />
            <p className="mt-3 font-bold text-[#183456]">
              Belum ada artikel di kategori ini.
            </p>
            <Link href="/edukasi" className="reading-more mt-1">
              Lihat semua artikel <ArrowRight aria-hidden="true" className="size-4" />
            </Link>
          </div>
        ) : (
          <ul className="reading-list mt-8">
            {articles.map((article) => (
              <li key={article.slug} className="reading-item">
                <div className={article.imageStorageKey ? "reading-item-media" : undefined}>
                  {article.imageStorageKey ? (
                    // eslint-disable-next-line @next/next/no-img-element -- Same-origin route decrypts and serves only published article images.
                    <img
                      src={`/api/articles/${article.slug}/image`}
                      alt={article.imageAlt ?? ""}
                      loading="lazy"
                      className="reading-thumb"
                    />
                  ) : null}
                  <div>
                    <p className="reading-cat">
                      {ARTICLE_CATEGORY_LABELS[article.category] ?? article.category}
                    </p>
                    <h2 className="reading-title mt-2">
                      <Link href={`/edukasi/${article.slug}`}>{article.title}</Link>
                    </h2>
                    <p className="mt-2 max-w-[62ch] text-sm leading-relaxed text-[#465460]">
                      {article.summary}
                    </p>
                    <Link
                      href={`/edukasi/${article.slug}`}
                      className="reading-more mt-1"
                    >
                      Baca artikel <ArrowRight aria-hidden="true" className="size-4" />
                    </Link>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}

        <p className="mt-8 flex items-start gap-2 text-sm leading-relaxed text-[#465460]">
          <ShieldCheck
            aria-hidden="true"
            className="mt-0.5 size-4 shrink-0 text-[#b34e3c]"
          />
          <span>
            Artikel bersifat informasi umum, bukan pengganti bantuan profesional. Jika kamu
            membutuhkan bantuan segera, buka{" "}
            <Link
              href="/darurat"
              className="font-bold text-[#163f59] underline underline-offset-4"
            >
              Kontak Darurat
            </Link>
            .
          </span>
        </p>
      </div>
    </div>
  );
}
