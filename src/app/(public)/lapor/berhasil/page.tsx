"use client";

import Link from "next/link";
import { Check, Copy, Download } from "lucide-react";
import { useState } from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import { useTicketReceipt } from "@/components/TicketReceipt";
import { cn } from "@/lib/utils";

export default function ReportSuccessPage() {
  const { ticket } = useTicketReceipt();
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);

  async function copyTicket() {
    if (!ticket) {
      return;
    }
    try {
      await navigator.clipboard.writeText(ticket);
      setCopied(true);
      setCopyError(false);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopyError(true);
    }
  }

  function downloadTicket() {
    if (!ticket) {
      return;
    }
    const content = [
      "TIKET PELITA",
      "",
      ticket,
      "",
      "Simpan tiket ini di tempat aman. Tiket hanya ditampilkan sekali dan tidak dapat",
      "dipulihkan jika hilang. Gunakan tiket untuk membuka /status dan membaca pesan",
      "dari petugas.",
      "",
      "Jangan bagikan tiket kepada orang yang tidak kamu percaya.",
    ].join("\n");
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "tiket-pelita.txt";
    link.click();
    URL.revokeObjectURL(url);
  }

  if (!ticket) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12">
        <h1 className="text-3xl font-semibold tracking-tight">Tiket tidak tersedia</h1>
        <p className="mt-4 leading-relaxed text-muted-foreground">
          Tiket hanya ditampilkan sekali, tepat setelah laporan dikirim. Karena halaman
          ini dimuat ulang atau dibuka langsung, tiket tidak lagi ditampilkan di sini.
        </p>
        <p className="mt-3 leading-relaxed text-muted-foreground">
          Jika kamu sudah menyimpan tiket, buka halaman cek status untuk melanjutkan. Jika
          tiket hilang, laporan tidak dapat dipulihkan.
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Link href="/status" className={cn(buttonVariants(), "h-11 px-5 text-base")}>
            Buka cek status
          </Link>
          <Link
            href="/lapor"
            className="inline-flex min-h-11 items-center text-sm font-medium text-primary underline-offset-4 hover:underline"
          >
            Buat laporan baru
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <p className="text-sm font-semibold tracking-wide text-primary uppercase">
        Laporan terkirim
      </p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight">
        Simpan tiket ini sekarang
      </h1>
      <p className="mt-3 leading-relaxed text-muted-foreground">
        Tiket adalah satu-satunya cara untuk membuka laporanmu, membaca pesan petugas, dan
        menambahkan bukti. Kami tidak menyimpan cara lain untuk menemukan laporanmu.
      </p>

      <div className="mt-8 rounded-lg border border-primary/30 bg-card p-6">
        <p className="text-sm font-medium text-muted-foreground">Tiket kamu</p>
        <p className="mt-2 font-mono text-2xl font-semibold tracking-wider break-all text-foreground sm:text-3xl">
          {ticket}
        </p>
        <div className="mt-5 flex flex-col gap-2 sm:flex-row">
          <Button type="button" onClick={copyTicket} className="h-11 gap-2 px-4">
            {copied ? (
              <Check aria-hidden="true" className="size-4" />
            ) : (
              <Copy aria-hidden="true" className="size-4" />
            )}
            {copied ? "Tersalin" : "Salin tiket"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={downloadTicket}
            className="h-11 gap-2 px-4"
          >
            <Download aria-hidden="true" className="size-4" />
            Unduh .txt
          </Button>
        </div>
        {copyError ? (
          <p role="alert" className="mt-3 text-sm text-destructive">
            Tidak bisa menyalin otomatis. Pilih teks tiket di atas lalu salin secara
            manual.
          </p>
        ) : null}
      </div>

      <div className="mt-6 rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm leading-relaxed">
        <p className="font-semibold text-foreground">Tiket tidak dapat dipulihkan</p>
        <p className="mt-1 text-muted-foreground">
          Halaman ini tidak menyimpan tiket di URL, cookie, atau penyimpanan browser. Jika
          kamu menutup halaman sebelum menyimpannya, tiket akan hilang. Simpan di tempat
          aman, bukan di perangkat yang dipakai bersama.
        </p>
      </div>

      <div className="mt-8 flex flex-col gap-3 border-t border-border pt-6 sm:flex-row">
        <Link href="/status" className={cn(buttonVariants(), "h-11 px-5 text-base")}>
          Cek status dan chat
        </Link>
        <Link
          href="/konseling"
          className="inline-flex min-h-11 items-center text-sm font-medium text-primary underline-offset-4 hover:underline"
        >
          Lihat jadwal konseling
        </Link>
      </div>
    </div>
  );
}
