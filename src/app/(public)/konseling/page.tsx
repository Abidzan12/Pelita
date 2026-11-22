"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Check, Copy, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

type Slot = {
  id: string;
  startsAt: string;
  endsAt: string;
  mode: string;
};

type BookingResult = {
  bookingCode: string;
  slot: { startsAt: string; endsAt: string; mode: string };
};

type LookupResult = {
  aliasName: string | null;
  status: string;
  startsAt: string;
  endsAt: string;
  mode: string;
};

const modeLabels: Record<string, string> = {
  ONLINE: "Online",
  OFFLINE: "Tatap muka",
};

const statusLabels: Record<string, string> = {
  DIJADWALKAN: "Dijadwalkan",
  SELESAI: "Selesai",
  DIBATALKAN: "Dibatalkan",
};

const dateFormatter = new Intl.DateTimeFormat("id-ID", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
});

const timeFormatter = new Intl.DateTimeFormat("id-ID", {
  hour: "2-digit",
  minute: "2-digit",
});

const dayFormatter = new Intl.DateTimeFormat("id-ID", { day: "numeric" });
const monthFormatter = new Intl.DateTimeFormat("id-ID", { month: "short" });
const weekdayFormatter = new Intl.DateTimeFormat("id-ID", { weekday: "long" });

function formatRange(startsAt: string, endsAt: string): string {
  return `${dateFormatter.format(new Date(startsAt))} · ${timeFormatter.format(
    new Date(startsAt),
  )}–${timeFormatter.format(new Date(endsAt))}`;
}

function formatTimeRange(startsAt: string, endsAt: string): string {
  return `${timeFormatter.format(new Date(startsAt))}–${timeFormatter.format(
    new Date(endsAt),
  )}`;
}

function ScheduleArt() {
  const rows = [
    { day: "12", month: "OKT", time: "10.00–11.00", label: "Tatap muka" },
    { day: "14", month: "OKT", time: "13.30–14.30", label: "Online" },
    { day: "19", month: "OKT", time: "09.00–10.00", label: "Online" },
  ];

  return (
    <svg viewBox="0 0 420 330" aria-hidden="true" className="w-full max-w-[400px]">
      <circle cx="322" cy="86" r="74" fill="#e9c649" />
      <g transform="rotate(-3 170 170)">
        <rect
          x="48"
          y="46"
          width="272"
          height="238"
          fill="#fff7e9"
          stroke="#c7c9ba"
          strokeWidth="1.5"
        />
        <rect x="48" y="46" width="272" height="30" fill="#122744" />
        <text
          x="66"
          y="66"
          fill="#f1c957"
          fontSize="10"
          fontWeight="800"
          letterSpacing="2.2"
        >
          JADWAL KONSELING
        </text>
        {rows.map((row, index) => (
          <g key={row.day + row.time} transform={`translate(0 ${index * 58})`}>
            <rect
              x="66"
              y="96"
              width="48"
              height="44"
              fill="#fffcf3"
              stroke="#d3543d"
              strokeWidth="1.2"
            />
            <text
              x="90"
              y="116"
              fill="#b34e3c"
              fontSize="17"
              fontWeight="800"
              textAnchor="middle"
            >
              {row.day}
            </text>
            <text
              x="90"
              y="131"
              fill="#b34e3c"
              fontSize="8"
              fontWeight="800"
              letterSpacing="1.4"
              textAnchor="middle"
            >
              {row.month}
            </text>
            <text x="128" y="115" fill="#183456" fontSize="13" fontWeight="700">
              {row.time}
            </text>
            <text x="128" y="132" fill="#5c6660" fontSize="10">
              {row.label}
            </text>
            <path d="M66 156h236" stroke="#ddd7c6" />
          </g>
        ))}
      </g>
      <g transform="rotate(-10 338 252)">
        <circle cx="338" cy="252" r="46" fill="none" stroke="#ee8064" strokeWidth="1.5" />
        <text
          x="338"
          y="247"
          fill="#ee8064"
          fontSize="13"
          fontWeight="800"
          letterSpacing="1.6"
          textAnchor="middle"
        >
          ULBK
        </text>
        <text
          x="338"
          y="264"
          fill="#ee8064"
          fontSize="8"
          fontWeight="700"
          letterSpacing="1.6"
          textAnchor="middle"
        >
          PELITA
        </text>
      </g>
    </svg>
  );
}

export default function CounselingPage() {
  const [slots, setSlots] = useState<Slot[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState("");
  const [aliasName, setAliasName] = useState("");
  const [contact, setContact] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [booking, setBooking] = useState<BookingResult | null>(null);
  const [copied, setCopied] = useState(false);

  const [lookupCode, setLookupCode] = useState("");
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupError, setLookupError] = useState<string | null>(null);
  const [lookupResult, setLookupResult] = useState<LookupResult | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const response = await fetch("/api/counseling/slots");
        const payload = (await response.json().catch(() => null)) as {
          ok: boolean;
          data?: Slot[];
          error?: string;
        } | null;
        if (cancelled) {
          return;
        }
        if (!response.ok || !payload?.ok || !payload.data) {
          setLoadError(payload?.error ?? "Jadwal belum bisa dimuat.");
          return;
        }
        setSlots(payload.data);
      } catch {
        if (!cancelled) {
          setLoadError("Koneksi terputus. Coba muat ulang halaman.");
        }
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  async function bookSlot(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedSlot || submitting) {
      return;
    }

    setSubmitting(true);
    setBookingError(null);
    try {
      const response = await fetch("/api/counseling/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slotId: selectedSlot,
          ...(aliasName.trim() ? { aliasName: aliasName.trim() } : {}),
          ...(contact.trim() ? { contact: contact.trim() } : {}),
        }),
      });
      const payload = (await response.json().catch(() => null)) as {
        ok: boolean;
        data?: BookingResult;
        error?: string;
      } | null;

      if (!response.ok || !payload?.ok || !payload.data) {
        setBookingError(payload?.error ?? "Slot belum bisa dipesan.");
        return;
      }

      setBooking(payload.data);
      setAliasName("");
      setContact("");
    } catch {
      setBookingError("Koneksi terputus. Slot belum dipesan.");
    } finally {
      setSubmitting(false);
    }
  }

  async function lookupBooking(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!lookupCode.trim() || lookupLoading) {
      return;
    }

    setLookupLoading(true);
    setLookupError(null);
    setLookupResult(null);
    try {
      const response = await fetch("/api/counseling/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingCode: lookupCode.trim() }),
      });
      const payload = (await response.json().catch(() => null)) as {
        ok: boolean;
        data?: LookupResult;
        error?: string;
      } | null;

      if (!response.ok || !payload?.ok || !payload.data) {
        setLookupError(payload?.error ?? "Kode booking tidak ditemukan.");
        return;
      }

      setLookupResult(payload.data);
    } catch {
      setLookupError("Koneksi terputus. Coba lagi.");
    } finally {
      setLookupLoading(false);
    }
  }

  async function copyCode() {
    if (!booking) {
      return;
    }
    try {
      await navigator.clipboard.writeText(booking.bookingCode);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="poster-page">
      <section className="poster-masthead">
        <div aria-hidden="true" className="poster-sun" />
        <div className="relative z-[1] mx-auto grid max-w-6xl gap-8 px-5 pt-12 pb-24 sm:px-8 sm:pt-14 lg:grid-cols-[1.08fr_.92fr] lg:items-center lg:gap-10 lg:px-10">
          <div>
            <h1 className="poster-title">
              Bicara dengan <span className="hero-highlight">konselor</span>
            </h1>
            <p className="poster-lead">
              Pesan slot konseling tanpa akun. Kamu boleh memakai nama panggilan atau
              tidak mencantumkan nama sama sekali. Konseling bukan layanan darurat.
            </p>
            <p className="report-alert-line">
              Dalam bahaya sekarang?{" "}
              <Link href="/darurat" className="report-alert-link">
                Lihat kontak darurat
              </Link>
            </p>
          </div>
          <div className="hidden lg:block">
            <ScheduleArt />
          </div>
        </div>
        <div className="hero-bottom-rule" aria-hidden="true">
          <span />
        </div>
      </section>

      <div className="mx-auto max-w-4xl px-4 pb-16 sm:px-8 sm:pb-20 lg:px-10 lg:pb-24">
        <div className="poster-sheet">
          <span className="poster-tab" aria-hidden="true">
            Jadwal konseling ULBK
          </span>

          {booking ? (
            <div className="poster-step">
              <div className="poster-step-head">
                <span aria-hidden="true" className="poster-step-num">
                  Kode booking
                </span>
                <h2 className="poster-step-title">Simpan sobekan tiket ini</h2>
                <p className="poster-step-note">
                  Kode hanya ditampilkan sekali dan tidak dapat dipulihkan.
                </p>
              </div>
              <div className="poster-step-body">
                <div className="ticket">
                  <div className="ticket-head">
                    <span>Kode bookingmu</span>
                    <span>{modeLabels[booking.slot.mode] ?? booking.slot.mode}</span>
                  </div>
                  <div className="ticket-body">
                    <p className="ticket-code">{booking.bookingCode}</p>
                    <p className="mt-3 text-sm leading-relaxed text-[#465460]">
                      {formatRange(booking.slot.startsAt, booking.slot.endsAt)}
                    </p>
                  </div>
                  <div className="ticket-perf" />
                  <div className="ticket-foot flex flex-wrap items-center gap-2">
                    <Button
                      type="button"
                      onClick={copyCode}
                      className="poster-submit gap-2 px-5 text-sm"
                    >
                      {copied ? (
                        <Check aria-hidden="true" className="size-4" />
                      ) : (
                        <Copy aria-hidden="true" className="size-4" />
                      )}
                      {copied ? "Tersalin" : "Salin kode"}
                    </Button>
                    <button
                      type="button"
                      onClick={() => {
                        setBooking(null);
                        setSelectedSlot("");
                        setSlots((current) =>
                          current
                            ? current.filter((slot) => slot.id !== selectedSlot)
                            : current,
                        );
                      }}
                      className="poster-link px-2"
                    >
                      Pesan slot lain
                    </button>
                  </div>
                </div>
                <p className="poster-error">
                  Simpan kode ini sekarang. Gunakan formulir di bawah untuk memeriksa
                  jadwal kapan saja.
                </p>
              </div>
            </div>
          ) : (
            <form onSubmit={bookSlot}>
              <section className="poster-step" aria-labelledby="pilih-jadwal">
                <div className="poster-step-head">
                  <span aria-hidden="true" className="poster-step-num">
                    01
                  </span>
                  <h2 id="pilih-jadwal" className="poster-step-title">
                    Pilih jadwal
                  </h2>
                  <p className="poster-step-note">
                    Slot yang tampil sudah tersedia. Pilih satu yang paling ringan untukmu.
                  </p>
                </div>
                <div className="poster-step-body">
                  {loadError ? (
                    <p role="alert" className="poster-error">
                      {loadError}
                    </p>
                  ) : slots === null ? (
                    <p className="poster-note">Memuat jadwal…</p>
                  ) : slots.length === 0 ? (
                    <p className="poster-panel text-sm leading-relaxed text-[#465460]">
                      Belum ada slot tersedia. Coba lagi nanti atau hubungi ULBK melalui
                      kanal resmi.
                    </p>
                  ) : (
                    <div
                      role="radiogroup"
                      aria-labelledby="pilih-jadwal"
                      className="slot-list"
                    >
                      {slots.map((slot) => (
                        <label key={slot.id} className="slot-option">
                          <span className="slot-date">
                            <span className="slot-day">
                              {dayFormatter.format(new Date(slot.startsAt))}
                            </span>
                            <span className="slot-month">
                              {monthFormatter.format(new Date(slot.startsAt))}
                            </span>
                          </span>
                          <span>
                            <span className="slot-weekday">
                              {weekdayFormatter.format(new Date(slot.startsAt))}
                            </span>
                            <span className="slot-time">
                              {formatTimeRange(slot.startsAt, slot.endsAt)}
                            </span>
                            <span className="slot-mode">
                              {modeLabels[slot.mode] ?? slot.mode}
                            </span>
                          </span>
                          <input
                            type="radio"
                            name="slot"
                            value={slot.id}
                            checked={selectedSlot === slot.id}
                            onChange={() => setSelectedSlot(slot.id)}
                          />
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              </section>

              <section className="poster-step" aria-labelledby="detail-opsional">
                <div className="poster-step-head">
                  <span aria-hidden="true" className="poster-step-num">
                    02
                  </span>
                  <h2 id="detail-opsional" className="poster-step-title">
                    Kalau kamu mau
                  </h2>
                  <p className="poster-step-note">
                    Keduanya opsional. Konselor tetap bisa menemuimu tanpa keduanya.
                  </p>
                </div>
                <div className="poster-step-body">
                  <div className="poster-grid">
                    <div>
                      <label htmlFor="aliasName" className="poster-label">
                        Nama panggilan{" "}
                        <span className="poster-label-note">(opsional)</span>
                      </label>
                      <input
                        id="aliasName"
                        value={aliasName}
                        onChange={(event) => setAliasName(event.target.value)}
                        maxLength={50}
                        placeholder="Nama yang ingin kamu pakai"
                        className="poster-input"
                      />
                    </div>
                    <div>
                      <label htmlFor="contact" className="poster-label">
                        Kontak untuk dihubungi{" "}
                        <span className="poster-label-note">(opsional)</span>
                      </label>
                      <input
                        id="contact"
                        value={contact}
                        onChange={(event) => setContact(event.target.value)}
                        maxLength={200}
                        placeholder="Nomor WA atau email, jika kamu mau"
                        className="poster-input"
                      />
                    </div>
                  </div>
                  <p className="poster-note">
                    Isi kontak hanya jika kamu ingin dihubungi. Data ini disimpan
                    terenkripsi.
                  </p>
                </div>
              </section>

              <div className="poster-step-foot">
                <div className="max-w-[46ch]">
                  <p className="poster-note mt-0">
                    Setelah dipesan, kode booking muncul satu kali. Simpan kode itu untuk
                    memeriksa atau membatalkan jadwal.
                  </p>
                  {bookingError ? (
                    <p role="alert" className="poster-error-text">
                      {bookingError}
                    </p>
                  ) : null}
                </div>
                <Button
                  type="submit"
                  disabled={!selectedSlot || submitting}
                  className="poster-submit"
                >
                  {submitting ? "Memesan..." : "Pesan slot"}
                </Button>
              </div>
            </form>
          )}
        </div>

        <section aria-labelledby="cek-jadwal" className="poster-panel mt-10">
          <h2
            id="cek-jadwal"
            className="text-lg font-extrabold tracking-tight text-[#183456]"
          >
            Cek jadwal dengan kode booking
          </h2>
          <p className="mt-1 text-sm leading-relaxed text-[#465460]">
            Tempelkan kode yang kamu simpan tadi. Kode tidak disimpan di browser ini.
          </p>
          <form onSubmit={lookupBooking} className="mt-4 flex flex-col gap-3 sm:flex-row">
            <div className="flex-1">
              <label htmlFor="bookingCode" className="sr-only">
                Kode booking
              </label>
              <input
                id="bookingCode"
                value={lookupCode}
                onChange={(event) => setLookupCode(event.target.value)}
                placeholder="BKG-XXXX-XXXX-XXXX-XXXX"
                autoComplete="off"
                autoCapitalize="characters"
                spellCheck={false}
                maxLength={64}
                className="poster-input font-mono tracking-wider"
              />
            </div>
            <Button
              type="submit"
              disabled={lookupLoading}
              className="poster-submit min-h-12 text-sm"
            >
              {lookupLoading ? "Mencari..." : "Cek jadwal"}
            </Button>
          </form>

          {lookupError ? (
            <p role="alert" className="poster-error-text">
              {lookupError}
            </p>
          ) : null}

          {lookupResult ? (
            <div className="mt-4 border-t border-[#bfd0c7] pt-4">
              <p className="flex items-center gap-2 text-sm font-extrabold text-[#183456]">
                <ShieldCheck aria-hidden="true" className="size-4 text-[#b34e3c]" />
                {statusLabels[lookupResult.status] ?? lookupResult.status}
              </p>
              <p className="mt-1 text-sm leading-relaxed text-[#465460]">
                {formatRange(lookupResult.startsAt, lookupResult.endsAt)} ·{" "}
                {modeLabels[lookupResult.mode] ?? lookupResult.mode}
              </p>
              {lookupResult.aliasName ? (
                <p className="mt-1 text-sm text-[#465460]">
                  Nama panggilan: {lookupResult.aliasName}
                </p>
              ) : null}
            </div>
          ) : null}
        </section>

        <p className="mt-8 flex items-start gap-2 text-sm leading-relaxed text-[#465460]">
          <ShieldCheck
            aria-hidden="true"
            className="mt-0.5 size-4 shrink-0 text-[#b34e3c]"
          />
          Jika kamu dalam bahaya sekarang, jangan menunggu jadwal konseling.
        </p>
      </div>
    </div>
  );
}
