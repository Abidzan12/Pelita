"use client";

import Link from "next/link";
import { AlertTriangle, Check, Clock, Copy, Download } from "lucide-react";
import { useState } from "react";
import { useTicketReceipt } from "@/components/TicketReceipt";
import statusEstimates from "@/data/status-estimates.json";

function TicketArt() {
  return (
    <svg viewBox="0 0 440 340" aria-hidden="true" className="report-art">
      <g transform="rotate(-6 220 176)">
        <rect x="52" y="74" width="336" height="204" fill="#e6dcc4" />
      </g>
      <g transform="rotate(3 220 170)">
        <rect
          x="46"
          y="58"
          width="348"
          height="212"
          fill="#fff7e9"
          stroke="#c7c9ba"
          strokeWidth="1.5"
        />
        <rect x="46" y="58" width="348" height="30" fill="#f1c957" />
        <rect x="46" y="88" width="348" height="5" fill="#ee8064" />
        <text
          x="66"
          y="79"
          fill="#122744"
          fontSize="12"
          fontWeight="800"
          letterSpacing="2"
        >
          TIKET PELITA
        </text>
        <text
          x="374"
          y="79"
          fill="#122744"
          fontSize="12"
          fontWeight="800"
          letterSpacing="2"
          textAnchor="end"
        >
          SEKALI
        </text>
        <path
          d="M70 128h196M70 154h150"
          stroke="#cfc9b6"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path d="M70 190h122" stroke="#ee8064" strokeWidth="10" strokeLinecap="butt" />
        <path d="M306 118v104" stroke="#c7c9ba" strokeWidth="2" strokeDasharray="6 6" />
        <text
          x="348"
          y="156"
          fill="#b34e3c"
          fontSize="11"
          fontWeight="800"
          letterSpacing="1.4"
          textAnchor="middle"
        >
          SIMPAN
        </text>
        <text
          x="348"
          y="174"
          fill="#b34e3c"
          fontSize="11"
          fontWeight="800"
          letterSpacing="1.4"
          textAnchor="middle"
        >
          TIKETMU
        </text>
        <circle cx="348" cy="206" r="18" fill="none" stroke="#f1c957" strokeWidth="1.5" />
        <path
          d="M340 206l6 6 11-12"
          fill="none"
          stroke="#f1c957"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
      <g transform="rotate(-14 96 292)">
        <rect x="60" y="276" width="72" height="30" fill="#ee8064" />
        <text
          x="96"
          y="296"
          fill="#fff7e9"
          fontSize="11"
          fontWeight="800"
          letterSpacing="1.6"
          textAnchor="middle"
        >
          AMAN
        </text>
      </g>
    </svg>
  );
}

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
      <div className="poster-page">
        <section className="poster-masthead">
          <div aria-hidden="true" className="poster-sun" />
          <div className="relative z-[1] mx-auto max-w-6xl px-5 pt-12 pb-24 sm:px-8 sm:pt-14 lg:px-10 lg:pt-16 lg:pb-28">
            <h1 className="poster-title">
              Tiket
              <br />
              <span className="hero-highlight">tidak tersedia</span>
            </h1>
            <p className="poster-lead">
              Tiket hanya ditampilkan sekali, tepat setelah laporan dikirim. Karena
              halaman ini dimuat ulang atau dibuka langsung, tiket tidak lagi ditampilkan
              di sini.
            </p>
          </div>
          <div className="hero-bottom-rule" aria-hidden="true">
            <span />
          </div>
        </section>

        <div className="mx-auto max-w-3xl px-4 pb-16 sm:px-8 sm:pb-20 lg:px-10 lg:pb-24">
          <div className="poster-sheet">
            <span className="poster-tab" aria-hidden="true">
              Tiket laporanmu
            </span>
            <div className="p-5 sm:p-7">
              <p className="text-[15px] leading-relaxed text-[#465460]">
                Jika kamu sudah menyimpan tiket, buka halaman cek status untuk
                melanjutkan. Jika tiket hilang, laporan tidak dapat dipulihkan.
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
                <Link
                  href="/status"
                  className="poster-submit inline-flex items-center justify-center text-center"
                >
                  Buka cek status
                </Link>
                <Link href="/lapor" className="poster-link px-2">
                  Buat laporan baru
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="poster-page">
      <section className="poster-masthead">
        <div aria-hidden="true" className="poster-sun" />
        <div className="relative z-[1] mx-auto grid max-w-6xl gap-8 px-5 pt-12 pb-24 sm:px-8 sm:pt-14 lg:grid-cols-[1.08fr_.92fr] lg:items-center lg:gap-10 lg:px-10 lg:pt-16 lg:pb-28">
          <div>
            <h1 className="poster-title">
              Simpan
              <br />
              <span className="hero-highlight">tiket ini</span> sekarang
            </h1>
            <p className="poster-lead">
              Tiket adalah satu-satunya cara untuk membuka laporanmu, membaca pesan
              petugas, dan menambahkan bukti. Kami tidak menyimpan cara lain untuk
              menemukan laporanmu.
            </p>
            <p className="report-alert-line">
              Jangan bagikan tiket kepada orang yang tidak kamu percaya.
            </p>
          </div>
          <div className="hidden lg:block">
            <TicketArt />
          </div>
        </div>
        <div className="hero-bottom-rule" aria-hidden="true">
          <span />
        </div>
      </section>

      <div className="mx-auto max-w-3xl px-4 pb-16 sm:px-8 sm:pb-20 lg:px-10 lg:pb-24">
        <div className="poster-sheet">
          <span className="poster-tab" aria-hidden="true">
            Tiket laporan · tanpa nama
          </span>

          <div className="p-5 sm:p-7">
            <div className="ticket">
              <div className="ticket-head">
                <span>Laporan terkirim</span>
                <span>Hanya tampil sekali</span>
              </div>
              <div className="ticket-body">
                <p className="ticket-code">{ticket}</p>
                <p className="mt-3 text-sm leading-relaxed text-[#465460]">
                  Salin atau unduh sekarang, lalu simpan di tempat aman — bukan di
                  perangkat yang dipakai bersama.
                </p>
              </div>
              <div className="ticket-perf" />
              <div className="ticket-foot flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={copyTicket}
                  className="poster-submit gap-2 px-5 text-sm"
                >
                  {copied ? (
                    <Check aria-hidden="true" className="size-4" />
                  ) : (
                    <Copy aria-hidden="true" className="size-4" />
                  )}
                  {copied ? "Tersalin" : "Salin tiket"}
                </button>
                <button
                  type="button"
                  onClick={downloadTicket}
                  className="inline-flex min-h-[52px] items-center gap-2 border border-[#122744] bg-[#f5f4e9] px-4 text-sm font-extrabold text-[#183456] transition-colors hover:bg-[#e6ede5] focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#122744]"
                >
                  <Download aria-hidden="true" className="size-4" />
                  Unduh .txt
                </button>
              </div>
            </div>

            {copyError ? (
              <p role="alert" className="poster-error mt-4">
                Tidak bisa menyalin otomatis. Pilih teks tiket di atas lalu salin secara
                manual.
              </p>
            ) : null}

            <div className="poster-panel mt-6">
              <p className="flex items-center gap-2 text-sm font-extrabold text-[#b34e3c]">
                <AlertTriangle aria-hidden="true" className="size-4 shrink-0" />
                Tiket tidak dapat dipulihkan
              </p>
              <p className="mt-2 text-sm leading-relaxed text-[#465460]">
                Halaman ini tidak menyimpan tiket di URL, cookie, atau penyimpanan
                browser. Jika kamu menutup halaman sebelum menyimpannya, tiket akan
                hilang. Simpan di tempat aman, bukan di perangkat yang dipakai bersama.
              </p>
            </div>

            <div className="poster-panel mt-4">
              <p className="flex items-center gap-2 text-sm font-extrabold text-[#183456]">
                <Clock aria-hidden="true" className="size-4 shrink-0 text-[#b34e3c]" />
                Perkiraan proses laporan
              </p>
              <ul className="mt-2 space-y-1.5 text-sm leading-relaxed text-[#465460]">
                <li>
                  <strong className="text-[#183456]">Verifikasi awal:</strong>{" "}
                  {statusEstimates.steps.DIVERIFIKASI.estimate} —{" "}
                  {statusEstimates.steps.DIVERIFIKASI.detail}
                </li>
                <li>
                  <strong className="text-[#183456]">Pemrosesan laporan:</strong>{" "}
                  {statusEstimates.steps.DALAM_PENANGANAN.estimate} —{" "}
                  {statusEstimates.steps.DALAM_PENANGANAN.detail}
                </li>
              </ul>
              <p className="mt-2 text-xs leading-relaxed text-[#5c6660]">
                {statusEstimates.disclaimer}
              </p>
            </div>

            <div className="mt-8 flex flex-col gap-3 border-t border-[#c7c9ba] pt-6 sm:flex-row sm:items-center">
              <Link
                href="/status"
                className="poster-submit inline-flex items-center justify-center text-center"
              >
                Cek status dan chat
              </Link>
              <Link href="/konseling" className="poster-link px-2">
                Lihat jadwal konseling
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
