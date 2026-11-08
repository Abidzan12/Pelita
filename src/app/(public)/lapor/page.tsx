"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { Paperclip, ShieldCheck, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useTicketReceipt } from "@/components/TicketReceipt";
import { DEFAULT_MAX_UPLOAD_MB, MAX_EVIDENCE_PER_REPORT } from "@/lib/evidence-limits";

const MAX_FILE_MB = DEFAULT_MAX_UPLOAD_MB;
const MAX_FILE_BYTES = MAX_FILE_MB * 1024 * 1024;

const roles = [
  { value: "KORBAN", label: "Saya yang mengalaminya" },
  { value: "SAKSI", label: "Saya melihat atau mengetahui kejadian" },
] as const;

const categories = [
  { value: "KEKERASAN_SEKSUAL", label: "Kekerasan seksual" },
  { value: "PERUNDUNGAN", label: "Perundungan" },
  { value: "KEKERASAN_FISIK", label: "Kekerasan fisik" },
  { value: "LAINNYA", label: "Lainnya" },
] as const;

type FieldErrors = Record<string, string>;

export default function ReportPage() {
  const router = useRouter();
  const { setTicket } = useTicketReceipt();

  const [reporterRole, setReporterRole] = useState("");
  const [category, setCategory] = useState("");
  const [incidentDate, setIncidentDate] = useState("");
  const [locationText, setLocationText] = useState("");
  const [description, setDescription] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);

  function addFiles(selected: File[]) {
    setFileError(null);

    const oversized = selected.find((file) => file.size > MAX_FILE_BYTES);
    if (oversized) {
      setFileError(`Berkas "${oversized.name}" lebih dari ${MAX_FILE_MB} MB.`);
      return;
    }

    const combined = [...files, ...selected];
    if (combined.length > MAX_EVIDENCE_PER_REPORT) {
      setFileError(`Maksimal ${MAX_EVIDENCE_PER_REPORT} berkas per laporan.`);
      return;
    }

    setFiles(combined);
  }

  function removeFile(index: number) {
    setFiles((current) => current.filter((_, position) => position !== index));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setFieldErrors({});

    const errors: FieldErrors = {};
    if (!reporterRole) {
      errors.reporterRole = "Pilih salah satu.";
    }
    if (!category) {
      errors.category = "Pilih kategori kejadian.";
    }
    if (description.trim().length < 20) {
      errors.description = "Ceritakan sedikit lebih banyak, minimal 20 karakter.";
    }
    if (!confirmed) {
      errors.confirmed = "Konfirmasi dulu sebelum mengirim.";
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setError("Ada isian yang perlu dilengkapi.");
      return;
    }

    const formData = new FormData();
    formData.set("reporterRole", reporterRole);
    formData.set("category", category);
    if (incidentDate) {
      formData.set("incidentDate", incidentDate);
    }
    if (locationText.trim()) {
      formData.set("locationText", locationText.trim());
    }
    formData.set("description", description.trim());
    for (const file of files) {
      formData.append("evidence", file);
    }

    setSubmitting(true);
    try {
      const response = await fetch("/api/reports", { method: "POST", body: formData });
      const payload: unknown = await response.json().catch(() => null);

      if (
        !response.ok ||
        !payload ||
        typeof payload !== "object" ||
        !("ok" in payload) ||
        payload.ok !== true
      ) {
        const message =
          payload && typeof payload === "object" && "error" in payload
            ? String(payload.error)
            : "Laporan belum terkirim. Periksa koneksi lalu coba lagi.";
        setError(message);

        if (payload && typeof payload === "object" && "fields" in payload) {
          const serverFields = payload.fields;
          if (Array.isArray(serverFields)) {
            const mapped: FieldErrors = {};
            for (const issue of serverFields) {
              if (
                issue &&
                typeof issue === "object" &&
                "field" in issue &&
                "message" in issue
              ) {
                mapped[String(issue.field)] = String(issue.message);
              }
            }
            setFieldErrors(mapped);
          }
        }
        return;
      }

      const ticket =
        "data" in payload &&
        payload.data &&
        typeof payload.data === "object" &&
        "ticket" in payload.data
          ? String(payload.data.ticket)
          : "";

      if (!ticket) {
        setError(
          "Laporan terkirim, tetapi tiket tidak diterima. Hubungi tim melalui kanal resmi.",
        );
        return;
      }

      setDescription("");
      setFiles([]);
      setTicket(ticket);
      router.push("/lapor/berhasil");
    } catch {
      setError(
        "Koneksi terputus. Laporan belum terkirim; coba lagi saat koneksi stabil.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <p className="text-sm font-semibold tracking-wide text-primary uppercase">
        Laporan anonim
      </p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight">
        Ceritakan dengan caramu
      </h1>
      <p className="mt-3 leading-relaxed text-muted-foreground">
        Kamu tidak perlu menjelaskan semuanya. Hanya kronologi yang wajib diisi, dan kamu
        boleh berhenti kapan saja.
      </p>

      <div className="mt-6 rounded-lg border border-border bg-card p-4 text-sm leading-relaxed">
        <p className="flex items-start gap-2 font-medium">
          <ShieldCheck
            aria-hidden="true"
            className="mt-0.5 size-4 shrink-0 text-primary"
          />
          Sebelum mulai
        </p>
        <ul className="mt-2 space-y-1 pl-6 text-muted-foreground">
          <li>Tidak ada akun, nama, atau kontak yang diminta.</li>
          <li>Draf hanya tersimpan selama halaman ini terbuka.</li>
          <li>
            Jika memungkinkan, gunakan mode penyamaran dan tutup tab ini setelah selesai.
          </li>
        </ul>
      </div>

      <p className="mt-4 text-sm text-muted-foreground">
        Dalam bahaya sekarang?{" "}
        <Link
          href="/darurat"
          className="font-medium text-primary underline-offset-4 hover:underline"
        >
          Lihat kontak darurat
        </Link>
        .
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-8" noValidate>
        <fieldset>
          <legend className="text-sm font-medium">Kamu melapor sebagai</legend>
          <div className="mt-2 grid gap-3 sm:grid-cols-2">
            {roles.map((role) => (
              <label
                key={role.value}
                className="flex cursor-pointer items-center gap-3 rounded-lg border border-border bg-card p-4 text-sm transition-colors focus-within:ring-2 focus-within:ring-ring has-[:checked]:border-primary has-[:checked]:bg-secondary/60"
              >
                <input
                  type="radio"
                  name="reporterRole"
                  value={role.value}
                  checked={reporterRole === role.value}
                  onChange={() => setReporterRole(role.value)}
                  className="size-4 accent-primary"
                  aria-describedby={
                    fieldErrors.reporterRole ? "reporterRole-error" : undefined
                  }
                />
                {role.label}
              </label>
            ))}
          </div>
          {fieldErrors.reporterRole ? (
            <p id="reporterRole-error" className="mt-2 text-sm text-destructive">
              {fieldErrors.reporterRole}
            </p>
          ) : null}
        </fieldset>

        <div className="space-y-5">
          <div>
            <Label htmlFor="category">Kategori kejadian</Label>
            <select
              id="category"
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              aria-invalid={Boolean(fieldErrors.category)}
              aria-describedby={fieldErrors.category ? "category-error" : undefined}
              className="mt-2 h-11 w-full rounded-lg border border-input bg-card px-3 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm"
            >
              <option value="">Pilih kategori</option>
              {categories.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
            {fieldErrors.category ? (
              <p id="category-error" className="mt-2 text-sm text-destructive">
                {fieldErrors.category}
              </p>
            ) : null}
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <Label htmlFor="incidentDate">
                Tanggal kejadian{" "}
                <span className="font-normal text-muted-foreground">(opsional)</span>
              </Label>
              <Input
                id="incidentDate"
                type="date"
                value={incidentDate}
                onChange={(event) => setIncidentDate(event.target.value)}
                className="mt-2 h-11 bg-card"
              />
            </div>
            <div>
              <Label htmlFor="locationText">
                Lokasi{" "}
                <span className="font-normal text-muted-foreground">(opsional)</span>
              </Label>
              <Input
                id="locationText"
                value={locationText}
                onChange={(event) => setLocationText(event.target.value)}
                maxLength={200}
                placeholder="Contoh: gedung kelas, area parkir"
                className="mt-2 h-11 bg-card"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="description">
              Kronologi <span className="font-normal text-destructive">(wajib)</span>
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              minLength={20}
              maxLength={5000}
              rows={8}
              aria-invalid={Boolean(fieldErrors.description)}
              aria-describedby="description-hint description-error"
              placeholder="Tulis apa yang terjadi dengan kata-katamu sendiri."
              className="mt-2 min-h-40 bg-card"
            />
            <div className="mt-1 flex justify-between gap-4 text-sm text-muted-foreground">
              <p id="description-hint">Minimal 20 karakter. Maksimal 5000 karakter.</p>
              <p aria-hidden="true">{description.length}/5000</p>
            </div>
            {fieldErrors.description ? (
              <p id="description-error" className="mt-1 text-sm text-destructive">
                {fieldErrors.description}
              </p>
            ) : null}
          </div>
        </div>

        <div>
          <Label htmlFor="evidence">
            Bukti <span className="font-normal text-muted-foreground">(opsional)</span>
          </Label>
          <div className="mt-2 rounded-lg border border-border bg-card p-4">
            <input
              id="evidence"
              type="file"
              multiple
              accept="image/jpeg,image/png,image/webp,application/pdf,audio/mpeg,audio/mp4,video/mp4"
              onChange={(event) => {
                addFiles(Array.from(event.target.files ?? []));
                event.target.value = "";
              }}
              className="block w-full text-sm file:mr-3 file:min-h-9 file:rounded-md file:border-0 file:bg-secondary file:px-3 file:text-sm file:font-medium file:text-secondary-foreground hover:file:bg-accent"
            />
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Maksimal {MAX_EVIDENCE_PER_REPORT} berkas, masing-masing {MAX_FILE_MB} MB.
              Foto JPG/PNG/WebP akan diproses ulang sehingga metadata EXIF/GPS dihapus.
              Untuk PDF, audio, dan video, metadata tidak dapat dihapus otomatis.
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Nama berkas asli tidak disimpan.
            </p>

            {files.length > 0 ? (
              <ul className="mt-3 divide-y divide-border border-t border-border">
                {files.map((file, index) => (
                  <li
                    key={`${file.name}-${file.size}-${index}`}
                    className="flex items-center gap-3 py-2 text-sm"
                  >
                    <Paperclip
                      aria-hidden="true"
                      className="size-4 shrink-0 text-muted-foreground"
                    />
                    <span className="min-w-0 flex-1 truncate">{file.name}</span>
                    <span className="shrink-0 text-muted-foreground">
                      {(file.size / (1024 * 1024)).toFixed(1)} MB
                    </span>
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="inline-flex size-11 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                      aria-label={`Hapus ${file.name}`}
                    >
                      <Trash2 aria-hidden="true" className="size-4" />
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}

            {fileError ? (
              <p role="alert" className="mt-3 text-sm text-destructive">
                {fileError}
              </p>
            ) : null}
          </div>
        </div>

        <div>
          <label className="flex items-start gap-3 text-sm leading-relaxed">
            <input
              type="checkbox"
              checked={confirmed}
              onChange={(event) => setConfirmed(event.target.checked)}
              className="mt-0.5 size-4 shrink-0 accent-primary"
              aria-describedby={fieldErrors.confirmed ? "confirmed-error" : undefined}
            />
            <span>
              Saya memahami bahwa tiket hanya ditampilkan sekali dan tidak dapat
              dipulihkan jika hilang.
            </span>
          </label>
          {fieldErrors.confirmed ? (
            <p id="confirmed-error" className="mt-2 text-sm text-destructive">
              {fieldErrors.confirmed}
            </p>
          ) : null}
        </div>

        {error ? (
          <div
            role="alert"
            className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive"
          >
            {error}
          </div>
        ) : null}

        <div className="flex flex-col gap-3 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-sm text-sm text-muted-foreground">
            Dengan mengirim, laporan disimpan terenkripsi dan hanya dapat dibaca petugas
            berwenang.
          </p>
          <Button
            type="submit"
            disabled={submitting}
            className="h-11 shrink-0 px-6 text-base font-semibold"
          >
            {submitting ? "Mengirim..." : "Kirim laporan"}
          </Button>
        </div>
      </form>
    </div>
  );
}
