import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { ChatbotWidget } from "@/components/ChatbotWidget";
import { QuickExitButton } from "@/components/QuickExitButton";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";

export default function NotFoundPage() {
  return (
    <div className="flex min-h-dvh flex-col">
      <a
        href="#konten"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-[3px] focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-primary-foreground"
      >
        Lewati ke konten
      </a>
      <SiteHeader />
      <main id="konten" className="flex-1">
        <div className="poster-page">
          <section className="poster-masthead">
            <div aria-hidden="true" className="poster-sun" />
            <div className="relative z-[1] mx-auto max-w-4xl px-5 pt-12 pb-20 sm:px-8 sm:pt-14 lg:px-10">
              <h1 className="poster-title max-w-2xl">
                Halaman <span className="hero-highlight">tidak ditemukan</span>
              </h1>
              <p className="poster-lead">
                Tautan yang kamu buka tidak tersedia atau mungkin sudah berpindah. Kamu
                tetap aman di sini dan bisa kembali ke halaman utama kapan saja.
              </p>
            </div>
            <div className="hero-bottom-rule" aria-hidden="true">
              <span />
            </div>
          </section>

          <div className="mx-auto max-w-3xl px-4 pb-16 sm:px-8 sm:pb-20 lg:px-10">
            <div className="poster-sheet">
              <span className="poster-tab" aria-hidden="true">
                Navigasi aman
              </span>
              <div className="p-5 sm:p-7">
                <p className="text-[15px] leading-relaxed text-[#465460]">
                  Pilih tujuan yang kamu butuhkan di bawah ini, atau tekan tombol Keluar
                  cepat di kanan bawah jika perlu meninggalkan situs ini segera.
                </p>
                <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
                  <Link
                    href="/lapor"
                    className="poster-submit inline-flex items-center justify-center gap-2 text-center"
                  >
                    Mulai lapor
                    <ArrowRight aria-hidden="true" className="size-4" />
                  </Link>
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
      </main>
      <SiteFooter />
      <ChatbotWidget />
      <QuickExitButton />
    </div>
  );
}
