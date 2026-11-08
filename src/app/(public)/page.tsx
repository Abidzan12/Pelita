import Link from "next/link";
import {
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
  },
  {
    href: "/konseling",
    icon: CalendarDays,
    title: "Konseling ULBK",
    body: "Pesan slot konseling secara anonim dan simpan kode bookingmu.",
  },
  {
    href: "/edukasi",
    icon: BookOpen,
    title: "Edukasi dan bystander",
    body: "Pahami bentuk kekerasan dan cara aman mengambil tindakan sebagai saksi.",
  },
  {
    href: "/peta",
    icon: MapPin,
    title: "Peta titik rawan",
    body: "Lihat lokasi yang perlu diwaspadai dan usulkan titik baru tanpa data pribadi.",
  },
];

export default function HomePage() {
  return (
    <div className="mx-auto max-w-5xl px-4">
      <section className="border-b border-border py-14 sm:py-20">
        <p className="text-sm font-semibold tracking-wide text-primary uppercase">
          Ruang aman kampus
        </p>
        <h1 className="mt-5 max-w-2xl text-4xl leading-[1.1] font-semibold tracking-tight sm:text-5xl">
          Kamu tidak sendirian.
        </h1>
        <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
          Pelita tempat melaporkan kekerasan seksual dan perundungan di lingkungan UNY
          tanpa akun, tanpa nama, dan tanpa harus menjelaskan lebih dari yang kamu siap.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
          <Link
            href="/lapor"
            className={cn(
              buttonVariants({ size: "lg" }),
              "h-11 gap-2 px-5 text-base font-semibold",
            )}
          >
            Mulai lapor
            <ArrowRight aria-hidden="true" className="size-4" />
          </Link>
          <Link
            href="/status"
            className="inline-flex min-h-11 items-center rounded-md px-1 text-base font-medium text-primary underline-offset-4 hover:underline focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          >
            Sudah punya tiket? Cek status
          </Link>
        </div>

        <p className="mt-8 flex max-w-xl items-start gap-2 text-sm leading-relaxed text-muted-foreground">
          <ShieldCheck
            aria-hidden="true"
            className="mt-0.5 size-4 shrink-0 text-primary"
          />
          Tidak ada akun, tidak ada nama, dan tidak ada cookie pelacak. Kamu bisa berhenti
          mengisi kapan saja.
        </p>
      </section>

      <section className="grid gap-10 border-b border-border py-14 md:grid-cols-[1fr_1.3fr]">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">
            Melapor dengan ritmemu sendiri
          </h2>
          <p className="mt-4 text-muted-foreground">
            Kamu tidak perlu menceritakan semuanya sekaligus. Mulai dari apa yang paling
            mudah kamu tulis.
          </p>
        </div>

        <ol className="divide-y divide-border border-y border-border">
          {steps.map((step, index) => (
            <li key={step.title} className="flex gap-4 py-5">
              <span
                aria-hidden="true"
                className="flex size-8 shrink-0 items-center justify-center rounded-full bg-secondary text-sm font-semibold text-secondary-foreground"
              >
                {index + 1}
              </span>
              <div>
                <h3 className="font-semibold">{step.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  {step.body}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="grid gap-10 border-b border-border py-14 md:grid-cols-[1.3fr_1fr]">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Yang bisa kamu akses</h2>
          <ul className="mt-6 grid gap-x-8 gap-y-6 sm:grid-cols-2">
            {accessItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="group flex min-h-11 flex-col gap-2 rounded-md focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                >
                  <span className="flex items-center gap-2 font-semibold group-hover:text-primary">
                    <item.icon aria-hidden="true" className="size-4 text-primary" />
                    {item.title}
                  </span>
                  <span className="text-sm leading-relaxed text-muted-foreground">
                    {item.body}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-lg border border-border bg-card p-6">
          <h2 className="text-lg font-semibold">Privasi bukan tambahan</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Isi laporan, pesan, dan bukti dienkripsi sebelum disimpan. Tiket disimpan
            sebagai hash, bukan teks asli.
          </p>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            <li>Tanpa IP, user-agent, atau analytics.</li>
            <li>Tanpa cookie untuk pelapor.</li>
            <li>Tombol keluar cepat tersedia di setiap halaman.</li>
          </ul>
          <p className="mt-5 border-t border-border pt-4 text-xs leading-relaxed text-muted-foreground">
            Enkripsi pada prototipe ini terjadi di server. Petugas berwenang tetap dapat
            membaca laporan yang kamu kirim.
          </p>
        </div>
      </section>

      <section className="py-14">
        <div className="rounded-lg border border-primary/25 bg-secondary/60 p-6 sm:flex sm:items-center sm:justify-between sm:gap-8">
          <div>
            <h2 className="text-xl font-semibold">Kalau kamu sedang dalam bahaya</h2>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
              Hubungi layanan darurat atau orang yang kamu percaya sekarang. Pelaporan
              lewat Pelita tidak dimaksudkan untuk situasi yang membutuhkan bantuan
              segera.
            </p>
          </div>
          <Link
            href="/darurat"
            className="mt-4 inline-flex min-h-11 shrink-0 items-center gap-2 rounded-md border border-primary/30 bg-background px-4 text-sm font-semibold text-primary hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none sm:mt-0"
          >
            Lihat kontak darurat
            <ArrowRight aria-hidden="true" className="size-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
