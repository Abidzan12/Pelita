"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { Check, Clock, Paperclip, ShieldCheck, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import statusEstimates from "@/data/status-estimates.json";
import { MAX_EVIDENCE_PER_REPORT, DEFAULT_MAX_UPLOAD_MB } from "@/lib/evidence-limits";
import { cn } from "@/lib/utils";

const MAX_FILE_BYTES = DEFAULT_MAX_UPLOAD_MB * 1024 * 1024;
const POLL_INTERVAL_MS = 8000;

const statusLabels: Record<string, string> = {
  DITERIMA: "Diterima",
  DIVERIFIKASI: "Diverifikasi",
  DALAM_PENANGANAN: "Dalam penanganan",
  SELESAI: "Selesai",
  DITOLAK: "Ditolak",
};

const statusSteps = ["DITERIMA", "DIVERIFIKASI", "DALAM_PENANGANAN", "SELESAI"] as const;

type EstimateStepKey = (typeof statusSteps)[number];

const categoryLabels: Record<string, string> = {
  KEKERASAN_SEKSUAL: "Kekerasan seksual",
  PERUNDUNGAN: "Perundungan",
  KEKERASAN_FISIK: "Kekerasan fisik",
  LAINNYA: "Lainnya",
};

type ChatMessage = {
  id: string;
  sender: "PELAPOR" | "ADMIN";
  body: string;
  readAt: string | null;
  createdAt: string;
};

type LookupData = {
  status: string;
  category: string;
  createdAt: string;
  updatedAt: string;
  evidenceCount: number;
  messages: ChatMessage[];
};

type LookupResponse = {
  ok: boolean;
  data?: LookupData;
  error?: string;
};

type MessageResponse = {
  ok: boolean;
  error?: string;
};

type EvidenceResponse = {
  ok: boolean;
  data?: { added: number; evidenceCount: number };
  error?: string;
};

const dateFormatter = new Intl.DateTimeFormat("id-ID", {
  dateStyle: "medium",
  timeStyle: "short",
});

function formatDate(value: string): string {
  return dateFormatter.format(new Date(value));
}

function TicketArt() {
  return (
    <svg viewBox="0 0 420 300" aria-hidden="true" className="w-full max-w-[390px]">
      <circle cx="312" cy="82" r="70" fill="#e9c649" />
      <g transform="rotate(-5 180 160)">
        <rect
          x="42"
          y="56"
          width="280"
          height="180"
          fill="#fff7e9"
          stroke="#c7c9ba"
          strokeWidth="1.5"
        />
        <rect x="42" y="56" width="280" height="30" fill="#122744" />
        <text
          x="60"
          y="76"
          fill="#f1c957"
          fontSize="10"
          fontWeight="800"
          letterSpacing="2.2"
        >
          TIKET LAPORAN
        </text>
        <text
          x="60"
          y="128"
          fill="#183456"
          fontSize="22"
          fontWeight="800"
          letterSpacing="1.5"
        >
          PLT-XXXX-XXXX
        </text>
        <text x="60" y="152" fill="#5c6660" fontSize="11">
          Simpan sekali, buka kapan saja.
        </text>
        <path
          d="M42 186h280"
          stroke="#c7c9ba"
          strokeWidth="2"
          strokeDasharray="6 6"
        />
        <rect x="60" y="202" width="74" height="12" fill="#ee8064" />
        <rect x="146" y="202" width="46" height="12" fill="#e6dcc4" />
      </g>
      <g transform="rotate(9 344 226)">
        <circle cx="344" cy="226" r="42" fill="none" stroke="#ee8064" strokeWidth="1.5" />
        <text
          x="344"
          y="222"
          fill="#ee8064"
          fontSize="11"
          fontWeight="800"
          letterSpacing="1.4"
          textAnchor="middle"
        >
          ANONIM
        </text>
        <text
          x="344"
          y="238"
          fill="#ee8064"
          fontSize="8"
          fontWeight="700"
          letterSpacing="1.4"
          textAnchor="middle"
        >
          TANPA AKUN
        </text>
      </g>
    </svg>
  );
}

export default function StatusPage() {
  const [ticketInput, setTicketInput] = useState("");
  const [activeTicket, setActiveTicket] = useState<string | null>(null);
  const [data, setData] = useState<LookupData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pollWarning, setPollWarning] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);

  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadNotice, setUploadNotice] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const inFlight = useRef(false);

  const lookup = useCallback(async (ticket: string, silent = false): Promise<boolean> => {
    if (inFlight.current) {
      return false;
    }
    inFlight.current = true;
    try {
      const response = await fetch("/api/tickets/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticket }),
      });
      const payload = (await response.json().catch(() => null)) as LookupResponse | null;

      if (!response.ok || !payload?.ok || !payload.data) {
        if (!silent) {
          setError(payload?.error ?? "Tiket tidak ditemukan. Periksa kembali tiketmu.");
          setData(null);
          setActiveTicket(null);
        } else if (response.status === 429) {
          setPollWarning(
            "Pembaruan otomatis terjeda sementara karena terlalu banyak permintaan. Tunggu sebentar lalu muat ulang.",
          );
        } else if (response.status >= 500) {
          setPollWarning("Pembaruan otomatis sedang terkendala. Coba lagi sebentar lagi.");
        }
        return false;
      }

      setPollWarning(null);
      setData(payload.data);
      return true;
    } catch {
      if (!silent) {
        setError("Koneksi terputus. Coba lagi saat koneksi stabil.");
      } else {
        setPollWarning("Koneksi terputus. Pembaruan otomatis menunggu koneksi stabil.");
      }
      return false;
    } finally {
      inFlight.current = false;
    }
  }, []);

  useEffect(() => {
    if (!activeTicket) {
      return;
    }

    const refresh = () => {
      if (document.visibilityState === "visible") {
        void lookup(activeTicket, true);
      }
    };

    const interval = window.setInterval(refresh, POLL_INTERVAL_MS);
    document.addEventListener("visibilitychange", refresh);
    return () => {
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, [activeTicket, lookup]);

  async function handleLookup(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const ticket = ticketInput.trim();
    if (!ticket) {
      setError("Masukkan tiket yang kamu simpan.");
      return;
    }

    setLoading(true);
    const found = await lookup(ticket);
    if (found) {
      setActiveTicket(ticket);
      setTicketInput("");
    }
    setLoading(false);
  }

  async function sendMessage(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!activeTicket || !message.trim() || sending) {
      return;
    }

    setSending(true);
    setSendError(null);
    try {
      const response = await fetch("/api/tickets/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticket: activeTicket, body: message.trim() }),
      });
      const payload = (await response.json().catch(() => null)) as MessageResponse | null;

      if (!response.ok || !payload?.ok) {
        setSendError(payload?.error ?? "Pesan belum terkirim. Coba lagi.");
        return;
      }

      setMessage("");
      await lookup(activeTicket, true);
    } catch {
      setSendError("Koneksi terputus. Pesan belum terkirim.");
    } finally {
      setSending(false);
    }
  }

  async function uploadEvidence(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!activeTicket || !file || uploading) {
      return;
    }
    if (file.size > MAX_FILE_BYTES) {
      setUploadError(`Ukuran berkas maksimal ${DEFAULT_MAX_UPLOAD_MB} MB.`);
      return;
    }

    setUploading(true);
    setUploadError(null);
    setUploadNotice(null);
    try {
      const formData = new FormData();
      formData.set("ticket", activeTicket);
      formData.append("evidence", file);

      const response = await fetch("/api/tickets/evidence", {
        method: "POST",
        body: formData,
      });
      const payload = (await response
        .json()
        .catch(() => null)) as EvidenceResponse | null;

      if (!response.ok || !payload?.ok || !payload.data) {
        setUploadError(payload?.error ?? "Bukti belum terunggah. Coba lagi.");
        return;
      }

      setFile(null);
      setUploadNotice("Bukti terunggah dan tersimpan terenkripsi.");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      await lookup(activeTicket, true);
    } catch {
      setUploadError("Koneksi terputus. Bukti belum terunggah.");
    } finally {
      setUploading(false);
    }
  }

  function forgetTicket() {
    setActiveTicket(null);
    setData(null);
    setTicketInput("");
    setMessage("");
    setFile(null);
    setError(null);
    setPollWarning(null);
    setSendError(null);
    setUploadError(null);
    setUploadNotice(null);
  }

  if (!activeTicket) {
    return (
      <div className="poster-page">
        <section className="poster-masthead">
          <div aria-hidden="true" className="poster-sun" />
          <div className="relative z-[1] mx-auto grid max-w-6xl gap-8 px-5 pt-12 pb-24 sm:px-8 sm:pt-14 lg:grid-cols-[1.08fr_.92fr] lg:items-center lg:gap-10 lg:px-10">
            <div>
              <h1 className="poster-title">
                Buka <span className="hero-highlight">laporanmu</span>
              </h1>
              <p className="poster-lead">
                Masukkan tiket yang kamu simpan setelah mengirim laporan. Tiket tidak
                disimpan di browser ini, jadi kamu perlu menempelkannya kembali.
              </p>
              <p className="report-alert-line">
                Belum punya tiket?{" "}
                <Link href="/lapor" className="report-alert-link">
                  Mulai lapor
                </Link>
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

        <div className="mx-auto max-w-4xl px-4 pb-16 sm:px-8 sm:pb-20 lg:px-10 lg:pb-24">
          <div className="poster-sheet">
            <span className="poster-tab" aria-hidden="true">
              Akses laporan · tanpa akun
            </span>

            <section className="poster-step" aria-labelledby="tiket-heading">
              <div className="poster-step-head">
                <h2 id="tiket-heading" className="poster-step-title">
                  Buka dengan tiketmu
                </h2>
                <p className="poster-step-note">
                  Tiket berawalan PLT- dan hanya ditampilkan sekali saat laporan dikirim.
                </p>
              </div>
              <div className="poster-step-body">
                <form onSubmit={handleLookup}>
                  <label htmlFor="ticket" className="poster-label">
                    Tiket
                  </label>
                  <input
                    id="ticket"
                    value={ticketInput}
                    onChange={(event) => setTicketInput(event.target.value)}
                    placeholder="PLT-XXXX-XXXX-XXXX-XXXX"
                    autoComplete="off"
                    autoCapitalize="characters"
                    spellCheck={false}
                    maxLength={64}
                    className="poster-input font-mono tracking-wider"
                  />
                  <div className="poster-hint-row">
                    <p>
                      Tiket hanya disimpan di memori halaman ini, bukan di URL atau cookie.
                    </p>
                  </div>

                  {error ? (
                    <p role="alert" className="poster-error mt-4">
                      {error}
                    </p>
                  ) : null}

                  <Button
                    type="submit"
                    disabled={loading}
                    className="poster-submit mt-5 w-full sm:w-auto"
                  >
                    {loading ? "Membuka..." : "Buka laporan"}
                  </Button>
                </form>
              </div>
            </section>

            <div className="poster-step-foot">
              <p className="poster-note mt-0 flex max-w-[52ch] items-start gap-2">
                <ShieldCheck
                  aria-hidden="true"
                  className="mt-0.5 size-4 shrink-0 text-[#b34e3c]"
                />
                Jika tiket hilang, laporan tidak dapat dipulihkan. Kamu tetap bisa membuat
                laporan baru atau menghubungi kanal resmi.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const status = data?.status ?? "DITERIMA";
  const rejected = status === "DITOLAK";
  const currentStep = statusSteps.indexOf(status as EstimateStepKey);
  const currentEstimate =
    currentStep >= 0 ? statusEstimates.steps[statusSteps[currentStep]] : null;
  const nextStepKey: EstimateStepKey | null =
    currentStep >= 0 && currentStep < statusSteps.length - 1
      ? statusSteps[currentStep + 1]
      : null;
  const nextEstimate = nextStepKey ? statusEstimates.steps[nextStepKey] : null;
  const evidenceCount = data?.evidenceCount ?? 0;

  return (
    <div className="poster-page">
      <section className="poster-masthead">
        <div aria-hidden="true" className="poster-sun" />
        <div className="relative z-[1] mx-auto max-w-6xl px-5 pt-10 pb-24 sm:px-8 sm:pt-12 lg:px-10">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="poster-title">Status laporanmu</h1>
              <p className="mt-4 text-sm leading-relaxed text-[#d5e0dc]">
                {data
                  ? `${categoryLabels[data.category] ?? data.category} · dikirim ${formatDate(data.createdAt)}`
                  : "Memuat status..."}
              </p>
            </div>
            <button type="button" onClick={forgetTicket} className="poster-ghost">
              <X aria-hidden="true" className="size-4" />
              Hapus tiket dari layar
            </button>
          </div>
        </div>
        <div className="hero-bottom-rule" aria-hidden="true">
          <span />
        </div>
      </section>

      <div className="mx-auto max-w-4xl px-4 pb-16 sm:px-8 sm:pb-20 lg:px-10 lg:pb-24">
        <div className="poster-sheet">
          <span className="poster-tab" aria-hidden="true">
            Perkembangan laporan
          </span>

          <section className="poster-step" aria-labelledby="status-heading">
            <div className="poster-step-head">
              <span aria-hidden="true" className="poster-step-num">
                Tahap
              </span>
              <h2 id="status-heading" className="poster-step-title">
                {statusLabels[status] ?? status}
              </h2>
              <p className="poster-step-note">
                Status diperbarui petugas. Halaman ini memuat ulang otomatis saat dibuka.
              </p>
            </div>
            <div className="poster-step-body">
              {rejected ? (
                <p className="poster-panel text-sm leading-relaxed text-[#465460]">
                  Laporan ditolak. Kamu bisa bertanya lewat chat di bawah atau menghubungi
                  kanal resmi untuk penjelasan lebih lanjut.
                </p>
              ) : (
                <>
                  <ol className="status-rail">
                    {statusSteps.map((step, index) => {
                      const isCurrent = index === currentStep;
                      const isDone = index < currentStep;
                      const stepInfo = statusEstimates.steps[step];
                      return (
                        <li
                          key={step}
                          aria-current={isCurrent ? "step" : undefined}
                          data-state={isCurrent ? "current" : isDone ? "done" : "next"}
                          className="status-step"
                        >
                          <span aria-hidden="true" className="status-dot">
                            {isDone ? <Check className="size-3.5" /> : index + 1}
                          </span>
                          <span>
                            <span className="status-label block">{statusLabels[step]}</span>
                            <span className="status-caption block">
                              {isDone
                                ? "Sudah lewat"
                                : isCurrent
                                  ? "Sedang di sini"
                                  : "Menunggu"}
                            </span>
                            <span className="mt-1 block text-xs font-medium text-[#465460]">
                              {stepInfo.estimate}
                            </span>
                          </span>
                        </li>
                      );
                    })}
                  </ol>

                  {currentEstimate ? (
                    <div className="poster-panel mt-5 space-y-1.5 text-sm leading-relaxed text-[#465460]">
                      <p className="flex items-center gap-2 font-bold text-[#183456]">
                        <Clock aria-hidden="true" className="size-4 shrink-0 text-[#b34e3c]" />
                        {nextEstimate
                          ? `Tahap berikutnya (${statusLabels[nextStepKey!]}): ${nextEstimate.estimate}`
                          : `Tahap ${statusLabels[status]}: ${currentEstimate.estimate}`}
                      </p>
                      <p>{nextEstimate ? nextEstimate.detail : currentEstimate.detail}</p>
                      <p className="text-xs text-[#5c6660]">{statusEstimates.disclaimer}</p>
                    </div>
                  ) : null}
                </>
              )}
            </div>
          </section>

          <section className="poster-step" aria-labelledby="chat-heading">
            <div className="poster-step-head">
              <h2 id="chat-heading" className="poster-step-title">
                Percakapan dengan petugas
              </h2>
              <p className="poster-step-note">
                Pesan baru muncul otomatis. Jangan menunggu balasan untuk situasi darurat.
              </p>
            </div>
            <div className="poster-step-body">
              {pollWarning ? (
                <p role="status" className="poster-panel mb-4 text-sm text-[#b34e3c]">
                  {pollWarning}
                </p>
              ) : null}
              <div
                aria-live="polite"
                className="chat-log max-h-96 min-h-40 space-y-3 overflow-y-auto p-4"
              >
                {data && data.messages.length > 0 ? (
                  <ul className="space-y-3">
                    {data.messages.map((item) => (
                      <li
                        key={item.id}
                        className={cn(
                          "max-w-[85%] px-3 py-2 text-sm",
                          item.sender === "PELAPOR"
                            ? "chat-out ml-auto"
                            : "chat-in mr-auto",
                        )}
                      >
                        <p className="break-words whitespace-pre-wrap">{item.body}</p>
                        <p
                          className={cn(
                            "mt-1 text-xs",
                            item.sender === "PELAPOR"
                              ? "text-white/70"
                              : "text-[#5c6660]",
                          )}
                        >
                          {item.sender === "PELAPOR" ? "Kamu" : "Petugas"} ·{" "}
                          {formatDate(item.createdAt)}
                        </p>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="py-8 text-center text-sm text-[#5c6660]">
                    Belum ada pesan. Kamu bisa mulai bertanya kapan saja.
                  </p>
                )}
              </div>

              <form onSubmit={sendMessage}>
                <label htmlFor="message" className="poster-label">
                  Tulis pesan
                </label>
                <textarea
                  id="message"
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  rows={3}
                  maxLength={2000}
                  placeholder="Tulis pertanyaan atau informasi tambahan. Jangan mencantumkan identitas jika tidak ingin."
                  className="poster-textarea poster-textarea--short"
                />
                <div className="poster-hint-row items-center">
                  <p aria-hidden="true">{message.length}/2000</p>
                  <button
                    type="submit"
                    disabled={sending || !message.trim()}
                    className="poster-action"
                  >
                    {sending ? "Mengirim..." : "Kirim pesan"}
                  </button>
                </div>
                {sendError ? (
                  <p role="alert" className="poster-error-text">
                    {sendError}
                  </p>
                ) : null}
              </form>
            </div>
          </section>

          <section className="poster-step" aria-labelledby="evidence-heading">
            <div className="poster-step-head">
              <h2 id="evidence-heading" className="poster-step-title">
                Bukti digital
              </h2>
              <p className="poster-step-note">
                {evidenceCount} dari {MAX_EVIDENCE_PER_REPORT} berkas tersimpan.
              </p>
            </div>
            <div className="poster-step-body">
              <p className="text-sm leading-relaxed text-[#465460]">
                Nama berkas asli tidak disimpan dan isinya terenkripsi.
              </p>

              {evidenceCount >= MAX_EVIDENCE_PER_REPORT ? (
                <p className="poster-panel text-sm text-[#465460]">
                  Batas bukti untuk laporan ini sudah tercapai.
                </p>
              ) : (
                <form onSubmit={uploadEvidence}>
                  <label htmlFor="evidence" className="poster-label">
                    Berkas pendukung
                  </label>
                  <input
                    ref={fileInputRef}
                    id="evidence"
                    type="file"
                    accept="image/jpeg,image/png,image/webp,application/pdf,audio/mpeg,audio/mp4,video/mp4"
                    onChange={(event) => {
                      setFile(event.target.files?.[0] ?? null);
                      setUploadError(null);
                      setUploadNotice(null);
                    }}
                    className="poster-file"
                  />
                  <p className="poster-note">
                    Maksimal {DEFAULT_MAX_UPLOAD_MB} MB. Foto di-re-encode sehingga
                    metadata EXIF/GPS dihapus; metadata PDF, audio, dan video tidak dapat
                    dihapus otomatis.
                  </p>
                  <button
                    type="submit"
                    disabled={!file || uploading}
                    className="poster-action mt-3"
                  >
                    <Paperclip aria-hidden="true" className="size-4" />
                    {uploading ? "Mengunggah..." : "Unggah bukti"}
                  </button>
                </form>
              )}

              {uploadError ? (
                <p role="alert" className="poster-error-text">
                  {uploadError}
                </p>
              ) : null}
              {uploadNotice ? (
                <p role="status" className="text-sm font-semibold text-[#163456]">
                  {uploadNotice}
                </p>
              ) : null}
            </div>
          </section>
        </div>

        <p className="mt-6 flex items-start gap-2 text-sm leading-relaxed text-[#465460]">
          <ShieldCheck
            aria-hidden="true"
            className="mt-0.5 size-4 shrink-0 text-[#b34e3c]"
          />
          <span>
            Tiket aktif hanya tersimpan di memori tab ini. Menyegarkan halaman akan
            menghapusnya dari layar; simpan tiketmu untuk kembali lagi.{" "}
            <Link
              href="/darurat"
              className="font-bold text-[#163f59] underline underline-offset-4"
            >
              Butuh bantuan segera?
            </Link>
          </span>
        </p>
      </div>
    </div>
  );
}
