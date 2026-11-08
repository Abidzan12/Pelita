"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { AlertCircle, MessageCircle, Paperclip, ShieldCheck, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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

const statusSteps = ["DITERIMA", "DIVERIFIKASI", "DALAM_PENANGANAN", "SELESAI"];

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

export default function StatusPage() {
  const [ticketInput, setTicketInput] = useState("");
  const [activeTicket, setActiveTicket] = useState<string | null>(null);
  const [data, setData] = useState<LookupData | null>(null);
  const [error, setError] = useState<string | null>(null);
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
        }
        return false;
      }

      setData(payload.data);
      return true;
    } catch {
      if (!silent) {
        setError("Koneksi terputus. Coba lagi saat koneksi stabil.");
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
    setSendError(null);
    setUploadError(null);
    setUploadNotice(null);
  }

  if (!activeTicket) {
    return (
      <div className="mx-auto max-w-xl px-4 py-12">
        <p className="text-sm font-semibold tracking-wide text-primary uppercase">
          Status laporan
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">Buka laporanmu</h1>
        <p className="mt-3 leading-relaxed text-muted-foreground">
          Masukkan tiket yang kamu simpan setelah mengirim laporan. Tiket tidak disimpan
          di browser ini, jadi kamu perlu menempelkannya kembali.
        </p>

        <form onSubmit={handleLookup} className="mt-8 space-y-4">
          <div>
            <Label htmlFor="ticket">Tiket</Label>
            <Input
              id="ticket"
              value={ticketInput}
              onChange={(event) => setTicketInput(event.target.value)}
              placeholder="PLT-XXXX-XXXX-XXXX-XXXX"
              autoComplete="off"
              autoCapitalize="characters"
              spellCheck={false}
              maxLength={64}
              className="mt-2 h-12 bg-card font-mono text-base tracking-wider"
            />
            <p className="mt-2 text-sm text-muted-foreground">
              Tiket hanya disimpan di memori halaman ini, bukan di URL atau cookie.
            </p>
          </div>

          {error ? (
            <div
              role="alert"
              className="flex gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive"
            >
              <AlertCircle aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
              {error}
            </div>
          ) : null}

          <Button
            type="submit"
            disabled={loading}
            className="h-11 w-full px-5 text-base font-semibold sm:w-auto"
          >
            {loading ? "Membuka..." : "Buka laporan"}
          </Button>
        </form>

        <p className="mt-6 flex items-start gap-2 text-sm leading-relaxed text-muted-foreground">
          <ShieldCheck
            aria-hidden="true"
            className="mt-0.5 size-4 shrink-0 text-primary"
          />
          Jika tiket hilang, laporan tidak dapat dipulihkan. Kamu tetap bisa membuat
          laporan baru atau menghubungi kanal resmi.
        </p>
      </div>
    );
  }

  const status = data?.status ?? "DITERIMA";
  const rejected = status === "DITOLAK";
  const currentStep = statusSteps.indexOf(status);
  const evidenceCount = data?.evidenceCount ?? 0;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold tracking-wide text-primary uppercase">
            Laporan aktif
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">Status laporanmu</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {data
              ? `${categoryLabels[data.category] ?? data.category} · dikirim ${formatDate(data.createdAt)}`
              : "Memuat status..."}
          </p>
        </div>
        <button
          type="button"
          onClick={forgetTicket}
          className="inline-flex min-h-11 items-center gap-2 rounded-md px-3 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        >
          <X aria-hidden="true" className="size-4" />
          Hapus tiket dari layar
        </button>
      </div>

      <section
        aria-labelledby="status-heading"
        className="mt-8 rounded-lg border border-border bg-card p-5"
      >
        <h2 id="status-heading" className="text-sm font-medium text-muted-foreground">
          Perkembangan
        </h2>
        <p className="mt-1 text-xl font-semibold">{statusLabels[status] ?? status}</p>

        {rejected ? (
          <p className="mt-3 rounded-md bg-destructive/5 p-3 text-sm text-muted-foreground">
            Laporan ditolak. Kamu bisa bertanya lewat chat di bawah atau menghubungi kanal
            resmi untuk penjelasan lebih lanjut.
          </p>
        ) : (
          <ol className="mt-4 grid gap-2 sm:grid-cols-4">
            {statusSteps.map((step, index) => {
              const isCurrent = index === currentStep;
              const isDone = index < currentStep;
              return (
                <li
                  key={step}
                  aria-current={isCurrent ? "step" : undefined}
                  className={cn(
                    "rounded-md border p-3 text-sm",
                    isDone && "border-primary/25 bg-secondary/50",
                    isCurrent && "border-primary bg-secondary font-semibold",
                    !isDone && !isCurrent && "border-border text-muted-foreground",
                  )}
                >
                  <span className="block text-xs text-muted-foreground">
                    Tahap {index + 1}
                  </span>
                  {statusLabels[step]}
                </li>
              );
            })}
          </ol>
        )}
      </section>

      <section aria-labelledby="chat-heading" className="mt-8">
        <h2 id="chat-heading" className="flex items-center gap-2 text-lg font-semibold">
          <MessageCircle aria-hidden="true" className="size-5 text-primary" />
          Percakapan dengan petugas
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Pesan baru muncul otomatis saat halaman ini terbuka. Jangan menunggu balasan
          untuk situasi darurat.
        </p>

        <div
          aria-live="polite"
          className="mt-4 max-h-96 min-h-40 space-y-3 overflow-y-auto rounded-lg border border-border bg-muted/30 p-4"
        >
          {data && data.messages.length > 0 ? (
            <ul className="space-y-3">
              {data.messages.map((item) => (
                <li
                  key={item.id}
                  className={cn(
                    "max-w-[85%] rounded-lg px-3 py-2 text-sm",
                    item.sender === "PELAPOR"
                      ? "ml-auto bg-primary text-primary-foreground"
                      : "mr-auto border border-border bg-card",
                  )}
                >
                  <p className="break-words whitespace-pre-wrap">{item.body}</p>
                  <p
                    className={cn(
                      "mt-1 text-xs",
                      item.sender === "PELAPOR"
                        ? "text-primary-foreground/70"
                        : "text-muted-foreground",
                    )}
                  >
                    {item.sender === "PELAPOR" ? "Kamu" : "Petugas"} ·{" "}
                    {formatDate(item.createdAt)}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Belum ada pesan. Kamu bisa mulai bertanya kapan saja.
            </p>
          )}
        </div>

        <form onSubmit={sendMessage} className="mt-4">
          <Label htmlFor="message">Tulis pesan</Label>
          <Textarea
            id="message"
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            rows={3}
            maxLength={2000}
            placeholder="Tulis pertanyaan atau informasi tambahan. Jangan mencantumkan identitas jika tidak ingin."
            className="mt-2 bg-card"
          />
          <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs text-muted-foreground">{message.length}/2000</p>
            <Button
              type="submit"
              disabled={sending || !message.trim()}
              className="h-11 px-5"
            >
              {sending ? "Mengirim..." : "Kirim pesan"}
            </Button>
          </div>
          {sendError ? (
            <p role="alert" className="mt-2 text-sm text-destructive">
              {sendError}
            </p>
          ) : null}
        </form>
      </section>

      <section
        aria-labelledby="evidence-heading"
        className="mt-10 border-t border-border pt-8"
      >
        <h2
          id="evidence-heading"
          className="flex items-center gap-2 text-lg font-semibold"
        >
          <Paperclip aria-hidden="true" className="size-5 text-primary" />
          Bukti digital
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {evidenceCount} dari {MAX_EVIDENCE_PER_REPORT} berkas tersimpan. Nama berkas
          asli tidak disimpan dan isinya terenkripsi.
        </p>

        {evidenceCount >= MAX_EVIDENCE_PER_REPORT ? (
          <p className="mt-3 text-sm text-muted-foreground">
            Batas bukti untuk laporan ini sudah tercapai.
          </p>
        ) : (
          <form onSubmit={uploadEvidence} className="mt-4 space-y-3">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,application/pdf,audio/mpeg,audio/mp4,video/mp4"
              onChange={(event) => {
                setFile(event.target.files?.[0] ?? null);
                setUploadError(null);
                setUploadNotice(null);
              }}
              className="block w-full text-sm file:mr-3 file:min-h-9 file:rounded-md file:border-0 file:bg-secondary file:px-3 file:text-sm file:font-medium file:text-secondary-foreground hover:file:bg-accent"
            />
            <p className="text-xs leading-relaxed text-muted-foreground">
              Maksimal {DEFAULT_MAX_UPLOAD_MB} MB. Foto di-re-encode sehingga metadata
              EXIF/GPS dihapus; metadata PDF, audio, dan video tidak dapat dihapus
              otomatis.
            </p>
            <Button
              type="submit"
              disabled={!file || uploading}
              variant="outline"
              className="h-11 px-5"
            >
              {uploading ? "Mengunggah..." : "Unggah bukti"}
            </Button>
          </form>
        )}

        {uploadError ? (
          <p role="alert" className="mt-2 text-sm text-destructive">
            {uploadError}
          </p>
        ) : null}
        {uploadNotice ? (
          <p role="status" className="mt-2 text-sm text-primary">
            {uploadNotice}
          </p>
        ) : null}
      </section>

      <p className="mt-8 text-xs leading-relaxed text-muted-foreground">
        Tiket aktif hanya tersimpan di memori tab ini. Menyegarkan halaman akan
        menghapusnya dari layar; simpan tiketmu untuk kembali lagi.{" "}
        <Link
          href="/darurat"
          className="underline underline-offset-4 hover:text-foreground"
        >
          Butuh bantuan segera?
        </Link>
      </p>
    </div>
  );
}
