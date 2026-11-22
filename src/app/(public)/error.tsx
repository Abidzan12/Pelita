"use client";

import Link from "next/link";
import { ArrowLeft, RotateCcw } from "lucide-react";

export default function PublicErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="poster-page">
      <section className="poster-masthead">
        <div aria-hidden="true" className="poster-sun" />
        <div className="relative z-[1] mx-auto max-w-4xl px-5 pt-12 pb-20 sm:px-8 sm:pt-14 lg:px-10">
          <h1 className="poster-title max-w-2xl">
            Halaman <span className="hero-highlight">sedang terkendala</span>
          </h1>
          <p className="poster-lead">
            Maaf, bagian ini belum bisa dimuat sekarang. Tidak ada data pribadimu yang
            dikirim atau disimpan karena gangguan ini.
          </p>
        </div>
        <div className="hero-bottom-rule" aria-hidden="true">
          <span />
        </div>
      </section>

      <div className="mx-auto max-w-3xl px-4 pb-16 sm:px-8 sm:pb-20 lg:px-10">
        <div className="poster-sheet">
          <span className="poster-tab" aria-hidden="true">
            Pemulihan
          </span>
          <div className="p-5 sm:p-7">
            <p className="text-[15px] leading-relaxed text-[#465460]">
              Coba muat ulang halaman ini. Jika kamu membutuhkan bantuan segera, langsung
              buka halaman Kontak Darurat.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              <button
                type="button"
                onClick={reset}
                className="poster-submit inline-flex items-center justify-center gap-2 text-center"
              >
                <RotateCcw aria-hidden="true" className="size-4" />
                Coba lagi
              </button>
              <Link href="/" className="poster-link px-2">
                <ArrowLeft aria-hidden="true" className="size-4" />
                Kembali ke beranda
              </Link>
              <Link href="/darurat" className="poster-link px-2">
                Kontak darurat
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
