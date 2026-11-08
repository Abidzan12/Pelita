"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CalendarDays, Check, Copy, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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

function formatRange(startsAt: string, endsAt: string): string {
  return `${dateFormatter.format(new Date(startsAt))} · ${timeFormatter.format(
    new Date(startsAt),
  )}–${timeFormatter.format(new Date(endsAt))}`;
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
    <div className="mx-auto max-w-2xl px-4 py-10">
      <p className="text-sm font-semibold tracking-wide text-primary uppercase">
        Konseling ULBK
      </p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight">
        Bicara dengan konselor
      </h1>
      <p className="mt-3 leading-relaxed text-muted-foreground">
        Pesan slot konseling tanpa akun. Kamu boleh memakai nama panggilan atau tidak
        mencantumkan nama sama sekali. Konseling bukan layanan darurat.
      </p>

      {booking ? (
        <div className="mt-8 rounded-lg border border-primary/30 bg-card p-6">
          <p className="text-sm font-medium text-muted-foreground">Kode booking kamu</p>
          <p className="mt-2 font-mono text-2xl font-semibold tracking-wider break-all">
            {booking.bookingCode}
          </p>
          <p className="mt-3 text-sm text-muted-foreground">
            {formatRange(booking.slot.startsAt, booking.slot.endsAt)} ·{" "}
            {modeLabels[booking.slot.mode] ?? booking.slot.mode}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button type="button" onClick={copyCode} className="h-11 gap-2 px-4">
              {copied ? (
                <Check aria-hidden="true" className="size-4" />
              ) : (
                <Copy aria-hidden="true" className="size-4" />
              )}
              {copied ? "Tersalin" : "Salin kode"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setBooking(null);
                setSelectedSlot("");
                setSlots((current) =>
                  current ? current.filter((slot) => slot.id !== selectedSlot) : current,
                );
              }}
              className="h-11 px-4"
            >
              Pesan slot lain
            </Button>
          </div>
          <p className="mt-4 rounded-md border border-destructive/25 bg-destructive/5 p-3 text-sm leading-relaxed">
            Simpan kode ini. Kode hanya ditampilkan sekali dan tidak dapat dipulihkan.
            Gunakan formulir di bawah untuk memeriksa jadwal.
          </p>
        </div>
      ) : (
        <form onSubmit={bookSlot} className="mt-8 space-y-6">
          <fieldset>
            <legend className="flex items-center gap-2 text-sm font-medium">
              <CalendarDays aria-hidden="true" className="size-4 text-primary" />
              Pilih jadwal
            </legend>

            {loadError ? (
              <p role="alert" className="mt-3 text-sm text-destructive">
                {loadError}
              </p>
            ) : slots === null ? (
              <p className="mt-3 text-sm text-muted-foreground">Memuat jadwal…</p>
            ) : slots.length === 0 ? (
              <p className="mt-3 rounded-md border border-border bg-card p-4 text-sm text-muted-foreground">
                Belum ada slot tersedia. Coba lagi nanti atau hubungi ULBK melalui kanal
                resmi.
              </p>
            ) : (
              <div className="mt-3 space-y-2">
                {slots.map((slot) => (
                  <label
                    key={slot.id}
                    className="flex cursor-pointer items-start gap-3 rounded-lg border border-border bg-card p-4 text-sm focus-within:ring-2 focus-within:ring-ring has-[:checked]:border-primary has-[:checked]:bg-secondary/60"
                  >
                    <input
                      type="radio"
                      name="slot"
                      value={slot.id}
                      checked={selectedSlot === slot.id}
                      onChange={() => setSelectedSlot(slot.id)}
                      className="mt-0.5 size-4 accent-primary"
                    />
                    <span>
                      <span className="block font-medium">
                        {formatRange(slot.startsAt, slot.endsAt)}
                      </span>
                      <span className="mt-0.5 block text-muted-foreground">
                        {modeLabels[slot.mode] ?? slot.mode}
                      </span>
                    </span>
                  </label>
                ))}
              </div>
            )}
          </fieldset>

          <div>
            <Label htmlFor="aliasName">
              Nama panggilan{" "}
              <span className="font-normal text-muted-foreground">(opsional)</span>
            </Label>
            <Input
              id="aliasName"
              value={aliasName}
              onChange={(event) => setAliasName(event.target.value)}
              maxLength={50}
              placeholder="Nama yang ingin kamu pakai"
              className="mt-2 h-11 bg-card"
            />
          </div>

          <div>
            <Label htmlFor="contact">
              Kontak untuk dihubungi{" "}
              <span className="font-normal text-muted-foreground">(opsional)</span>
            </Label>
            <Input
              id="contact"
              value={contact}
              onChange={(event) => setContact(event.target.value)}
              maxLength={200}
              placeholder="Nomor WA atau email, jika kamu ingin dihubungi"
              className="mt-2 h-11 bg-card"
            />
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              Hanya diisi jika kamu ingin dihubungi. Data ini disimpan terenkripsi.
            </p>
          </div>

          {bookingError ? (
            <p role="alert" className="text-sm text-destructive">
              {bookingError}
            </p>
          ) : null}

          <Button
            type="submit"
            disabled={!selectedSlot || submitting}
            className="h-11 w-full px-5 text-base font-semibold sm:w-auto"
          >
            {submitting ? "Memesan..." : "Pesan slot"}
          </Button>
        </form>
      )}

      <section aria-labelledby="cek-jadwal" className="mt-12 border-t border-border pt-8">
        <h2 id="cek-jadwal" className="text-lg font-semibold">
          Cek jadwal dengan kode booking
        </h2>
        <form onSubmit={lookupBooking} className="mt-4 flex flex-col gap-3 sm:flex-row">
          <div className="flex-1">
            <Label htmlFor="bookingCode" className="sr-only">
              Kode booking
            </Label>
            <Input
              id="bookingCode"
              value={lookupCode}
              onChange={(event) => setLookupCode(event.target.value)}
              placeholder="BKG-XXXX-XXXX-XXXX-XXXX"
              autoComplete="off"
              autoCapitalize="characters"
              spellCheck={false}
              maxLength={64}
              className="h-11 bg-card font-mono"
            />
          </div>
          <Button
            type="submit"
            variant="outline"
            disabled={lookupLoading}
            className="h-11 px-5"
          >
            {lookupLoading ? "Mencari..." : "Cek jadwal"}
          </Button>
        </form>

        {lookupError ? (
          <p role="alert" className="mt-3 text-sm text-destructive">
            {lookupError}
          </p>
        ) : null}

        {lookupResult ? (
          <div className="mt-4 rounded-lg border border-border bg-card p-4 text-sm">
            <p className="font-medium">
              {statusLabels[lookupResult.status] ?? lookupResult.status}
            </p>
            <p className="mt-1 text-muted-foreground">
              {formatRange(lookupResult.startsAt, lookupResult.endsAt)} ·{" "}
              {modeLabels[lookupResult.mode] ?? lookupResult.mode}
            </p>
            {lookupResult.aliasName ? (
              <p className="mt-1 text-muted-foreground">
                Nama panggilan: {lookupResult.aliasName}
              </p>
            ) : null}
          </div>
        ) : null}
      </section>

      <p className="mt-8 flex items-start gap-2 text-sm leading-relaxed text-muted-foreground">
        <ShieldCheck aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-primary" />
        Jika kamu dalam bahaya sekarang, jangan menunggu jadwal konseling.{" "}
        <Link
          href="/darurat"
          className="font-medium text-primary underline-offset-4 hover:underline"
        >
          Lihat kontak darurat
        </Link>
        .
      </p>
    </div>
  );
}
