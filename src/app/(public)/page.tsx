import Link from "next/link";
import {
  ArrowDownRight,
  ArrowRight,
  BookOpen,
  CalendarDays,
  MapPin,
  MessageCircle,
  ShieldCheck,
} from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const steps = [
  {
    title: "Ceritakan dengan caramu",
    body: "Hanya kronologi yang wajib diisi. Tanggal, lokasi, dan bukti bersifat opsional.",
  },
  {
    title: "Simpan tiketmu",
    body: "Tiket muncul satu kali setelah laporan terkirim. Tiket adalah satu-satunya kunci untuk kembali.",
  },
  {
    title: "Tetap terhubung",
    body: "Pantau status dan balas pesan dari Satgas PPKS tanpa menunjukkan identitasmu.",
  },
];

const accessItems = [
  {
    href: "/status",
    icon: MessageCircle,
    title: "Cek status dan chat",
    body: "Lihat perkembangan laporan dan berbincang dua arah dengan petugas.",
    marker: "01",
  },
  {
    href: "/konseling",
    icon: CalendarDays,
    title: "Konseling ULBK",
    body: "Pesan slot konseling secara anonim dan simpan kode bookingmu.",
    marker: "02",
  },
  {
    href: "/edukasi",
    icon: BookOpen,
    title: "Edukasi dan bystander",
    body: "Pahami bentuk kekerasan dan cara aman mengambil tindakan sebagai saksi.",
    marker: "03",
  },
  {
    href: "/peta",
    icon: MapPin,
    title: "Peta titik rawan",
    body: "Lihat lokasi yang perlu diwaspadai dan usulkan titik baru tanpa data pribadi.",
    marker: "04",
  },
];

function PosterIllustration() {
  return (
    <svg
      viewBox="0 0 560 450"
      role="img"
      aria-labelledby="illustration-title illustration-description"
      className="poster-illustration w-full max-w-[520px]"
    >
      <title id="illustration-title">Ilustrasi pesan dukungan PELITA</title>
      <desc id="illustration-description">
        Selembar poster berwarna biru dan kuning dengan jalur cahaya yang mengarah ke
        ruang aman.
      </desc>
      <circle cx="398" cy="113" r="91" fill="#e9c649" />
      <path
        d="M321 37c34 9 61 29 77 59-24 4-44 17-57 39-11-22-32-38-57-44 5-22 18-41 37-54Z"
        fill="#f5e8ce"
        opacity=".72"
      />
      <path d="M83 89 391 49l53 291-308 56L83 89Z" fill="#16385f" />
      <path d="m117 119 246-32" stroke="#ee8064" strokeWidth="7" strokeLinecap="round" />
      <text
        x="117"
        y="167"
        fill="#f4ead8"
        fontSize="16"
        fontWeight="700"
        letterSpacing="3"
      >
        PELITA · UNY
      </text>
      <text
        x="117"
        y="226"
        fill="#fff8eb"
        fontSize="43"
        fontWeight="800"
        letterSpacing="-2"
      >
        Kamu tidak
      </text>
      <text
        x="117"
        y="273"
        fill="#fff8eb"
        fontSize="43"
        fontWeight="800"
        letterSpacing="-2"
      >
        sendirian.
      </text>
      <path d="M123 305h170" stroke="#f1c957" strokeWidth="5" strokeLinecap="round" />
      <text x="123" y="336" fill="#d8e1dc" fontSize="14" fontWeight="600">
        Ada ruang untuk bercerita.
      </text>
      <path
        d="m289 373 42-57 28 19 48-87"
        fill="none"
        stroke="#e96e54"
        strokeWidth="7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="407" cy="236" r="11" fill="#f1c957" />
      <path
        d="M406 238c36 13 61 41 70 76"
        fill="none"
        stroke="#167e70"
        strokeWidth="6"
        strokeLinecap="round"
        strokeDasharray="2 14"
      />
      <path d="m151 365 162-29" stroke="#f4ead8" strokeWidth="2" opacity=".45" />
      <path d="m167 379 138-25" stroke="#f4ead8" strokeWidth="2" opacity=".25" />
      <path
        d="m114 71 13-15m-4 29 25-4m-47 8-4-23"
        stroke="#df694d"
        strokeWidth="5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function HomePage() {
  return (
    <div className="home-poster overflow-hidden">
      <section className="home-hero relative isolate">
        <div aria-hidden="true" className="poster-sun" />
        <div className="relative z-[1] mx-auto grid max-w-6xl items-center gap-4 px-5 pt-12 pb-10 sm:px-8 sm:pt-16 sm:pb-14 lg:min-h-[590px] lg:grid-cols-[1.03fr_.97fr] lg:gap-8 lg:px-10 lg:pt-12">
          <div className="hero-copy relative z-10 max-w-[610px]">
            <p className="mb-5 flex items-center gap-2 text-xs font-extrabold tracking-[.18em] text-[#ffe08a] uppercase sm:text-sm">
              <span className="h-px w-8 bg-[#ee8064]" />
              Ruang aman kampus
            </p>
            <h1 className="max-w-[590px] text-[clamp(3rem,7vw,5.8rem)] leading-[.96] font-extrabold tracking-[-0.035em] text-[#fff7e9]">
              Kamu tidak <span className="hero-highlight">sendirian.</span>
            </h1>
            <p className="mt-7 max-w-[48ch] text-lg leading-relaxed text-[#e1e8df] sm:text-xl">
              Pelita tempat melaporkan kekerasan seksual dan perundungan di lingkungan UNY
              tanpa akun, tanpa nama, dan tanpa harus menjelaskan lebih dari yang kamu
              siap.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                href="/lapor"
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "home-primary-cta h-12 gap-2 rounded-[3px] px-6 text-base font-bold",
                )}
              >
                Mulai lapor
                <ArrowRight aria-hidden="true" className="size-4" />
              </Link>
              <Link href="/status" className="home-secondary-cta">
                Sudah punya tiket? Cek status
                <ArrowDownRight aria-hidden="true" className="size-4" />
              </Link>
            </div>

            <p className="mt-5 flex max-w-xl items-start gap-2 text-sm leading-relaxed font-semibold text-[#f2ead7]">
              <ShieldCheck
                aria-hidden="true"
                className="mt-0.5 size-4 shrink-0 text-[#f1c957]"
              />
              <span>
                Bisa melapor tanpa akun dan tanpa nama. Simpan tiketmu karena hanya
                ditampilkan sekali.
              </span>
            </p>
          </div>

          <div className="hero-art relative mx-auto w-full max-w-[540px] lg:mx-0 lg:justify-self-end">
            <div aria-hidden="true" className="hero-art-stamp">
              RUANG
              <br />
              UNTUKMU
            </div>
            <PosterIllustration />
            <p className="-mt-2 ml-auto max-w-[255px] text-right text-xs leading-relaxed text-[#d5e1da]">
              Kamu bisa mulai dari hal yang paling mudah diceritakan.
            </p>
          </div>
        </div>
        <div className="hero-bottom-rule" aria-hidden="true">
          <span />
        </div>
      </section>

      <section className="poster-process" aria-labelledby="process-title">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 py-16 sm:px-8 sm:py-20 lg:grid-cols-[.82fr_1.18fr] lg:px-10 lg:py-24">
          <div className="process-intro">
            <p className="section-label">KAMU YANG MENENTUKAN RITMENYA</p>
            <h2 id="process-title" className="section-title mt-4 max-w-md">
              Melapor dengan caramu sendiri.
            </h2>
            <p className="mt-5 max-w-[44ch] text-base leading-relaxed text-[#465460] sm:text-lg">
              Kamu tidak perlu menceritakan semuanya sekaligus. Mulai dari apa yang paling
              mudah kamu tulis.
            </p>
            <Link href="/lapor" className="process-link mt-7">
              Lihat langkah pertama <ArrowRight aria-hidden="true" className="size-4" />
            </Link>
          </div>

          <ol className="process-list">
            {steps.map((step, index) => (
              <li key={step.title} className="process-step">
                <span aria-hidden="true" className="process-step-mark">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div>
                  <h3 className="text-xl font-bold tracking-tight text-[#183456]">
                    {step.title}
                  </h3>
                  <p className="mt-2 max-w-[48ch] text-sm leading-relaxed text-[#53616a] sm:text-base">
                    {step.body}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="poster-support" aria-labelledby="support-title">
        <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-20 lg:px-10 lg:py-24">
          <div className="support-heading">
            <div>
              <p className="section-label section-label-light">JALUR DUKUNGAN</p>
              <h2
                id="support-title"
                className="section-title mt-4 max-w-xl text-[#fff6e7]"
              >
                Ada beberapa cara untuk melangkah.
              </h2>
            </div>
            <p className="max-w-sm text-sm leading-relaxed text-[#d5e0dc] sm:text-base">
              Pilih yang terasa tepat untukmu. Kamu selalu bisa kembali kapan saja.
            </p>
          </div>
          <ul className="support-list mt-10">
            {accessItems.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="support-link">
                  <span className="support-marker">{item.marker}</span>
                  <span className="support-content">
                    <span className="flex items-center gap-3 text-lg font-bold text-[#fff6e7] sm:text-xl">
                      <item.icon aria-hidden="true" className="size-5 text-[#f0cb63]" />
                      {item.title}
                    </span>
                    <span className="mt-2 block max-w-[42ch] text-sm leading-relaxed text-[#d1ddd7]">
                      {item.body}
                    </span>
                  </span>
                  <ArrowRight aria-hidden="true" className="support-arrow size-5" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="poster-privacy" aria-labelledby="privacy-title">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 py-16 sm:px-8 sm:py-20 lg:grid-cols-[.85fr_1.15fr] lg:px-10 lg:py-24">
          <div>
            <p className="section-label">KETERANGAN PENTING</p>
            <h2 id="privacy-title" className="section-title mt-4 max-w-md">
              Privasi bukan tambahan.
            </h2>
            <p className="mt-5 max-w-[48ch] text-base leading-relaxed text-[#465460]">
              Pelita tidak meminta nama atau akun untuk membuat laporan. Isi laporan dan
              bukti dilindungi saat disimpan.
            </p>
          </div>
          <div className="privacy-panel">
            <h3 className="font-bold text-[#203b50]">Yang tidak kami kumpulkan</h3>
            <ul className="mt-3 space-y-3 text-sm font-semibold text-[#203b50] sm:text-base">
              <li className="flex gap-3">
                <span className="privacy-dot" /> Kami tidak meminta nama, email, atau
                nomor telepon untuk laporan.
              </li>
              <li className="flex gap-3">
                <span className="privacy-dot" /> Untuk pelapor, tidak ada cookie pelacak
                atau analytics.
              </li>
              <li className="flex gap-3">
                <span className="privacy-dot" /> Alamat IP tidak disimpan ke database;
                pembatasan percobaan menggunakannya sementara di memori.
              </li>
            </ul>
            <div className="mt-6 border-t border-[#16385f]/15 pt-4">
              <h3 className="font-bold text-[#203b50]">Yang perlu kamu ketahui</h3>
              <p className="mt-2 text-sm leading-relaxed text-[#53616a] sm:text-base">
                Laporan disimpan dalam bentuk terenkripsi di server, tetapi petugas yang
                berwenang tetap dapat membacanya untuk menindaklanjuti laporan. Tiketmu
                hanya ditampilkan sekali; jika hilang, laporan tidak dapat dipulihkan.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="poster-emergency">
        <div className="mx-auto flex max-w-6xl flex-col gap-7 px-5 py-14 sm:px-8 md:flex-row md:items-center md:justify-between lg:px-10">
          <div>
            <p className="section-label section-label-dark">JIKA BUTUH BANTUAN SEGERA</p>
            <h2 className="mt-3 text-2xl font-extrabold tracking-tight text-[#183456] sm:text-3xl">
              Kalau kamu sedang dalam bahaya
            </h2>
            <p className="mt-3 max-w-[62ch] text-sm leading-relaxed text-[#354e5b] sm:text-base">
              Hubungi layanan darurat atau orang yang kamu percaya sekarang. Pelaporan
              lewat Pelita tidak dimaksudkan untuk situasi yang membutuhkan bantuan
              segera.
            </p>
          </div>
          <Link href="/darurat" className="emergency-link">
            Lihat kontak darurat <ArrowRight aria-hidden="true" className="size-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
