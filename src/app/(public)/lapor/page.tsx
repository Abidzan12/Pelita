"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { Paperclip, ShieldCheck, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

const focusTargets: Record<string, string> = {
  reporterRole: 'input[name="reporterRole"]',
  category: "#category",
  description: "#description",
  confirmed: "#confirmed",
};

function ReportSheetArt() {
  return (
    <svg viewBox="0 0 440 340" aria-hidden="true" className="report-art">
      <g transform="rotate(5 170 180)">
        <rect x="62" y="62" width="208" height="252" fill="#e6dcc4" />
      </g>
      <g transform="rotate(-4 170 170)">
        <rect
          x="70"
          y="46"
          width="214"
          height="262"
          fill="#fff7e9"
          stroke="#c7c9ba"
          strokeWidth="1.5"
        />
        <rect x="70" y="46" width="214" height="24" fill="#f1c957" />
        <rect x="70" y="70" width="214" height="4" fill="#ee8064" />
        <path
          d="M90 108h174M90 134h174M90 160h174M90 186h128"
          stroke="#cfc9b6"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <rect x="90" y="212" width="92" height="10" fill="#ee8064" />
        <path d="M284 46v26l-26-26Z" fill="#d3543d" />
      </g>
      <g transform="rotate(-12 352 116)">
        <circle cx="352" cy="116" r="40" fill="none" stroke="#f1c957" strokeWidth="1.5" />
        <text
          x="352"
          y="112"
          fill="#f1c957"
          fontSize="12"
          fontWeight="800"
          letterSpacing="1.2"
          textAnchor="middle"
        >
          TANPA
        </text>
        <text
          x="352"
          y="130"
          fill="#f1c957"
          fontSize="12"
          fontWeight="800"
          letterSpacing="1.2"
          textAnchor="middle"
        >
          NAMA
        </text>
      </g>
    </svg>
  );
}

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

  function clearFieldError(field: string) {
    setFieldErrors((current) => {
      if (!current[field]) {
        return current;
      }
      const next = { ...current };
      delete next[field];
      return next;
    });
    setError(null);
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
      const first = Object.keys(errors)[0];
      document.querySelector<HTMLElement>(focusTargets[first] ?? "")?.focus();
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
    <div className="report-poster">
      <section className="report-masthead">
        <div aria-hidden="true" className="poster-sun" />
        <div className="relative z-[1] mx-auto grid max-w-6xl gap-8 px-5 pt-12 pb-24 sm:px-8 sm:pt-14 lg:grid-cols-[1.08fr_.92fr] lg:items-center lg:gap-10 lg:px-10 lg:pt-16 lg:pb-28">
          <div>
            <h1 className="report-title">
              Ceritakan
              <br />
              <span className="hero-highlight">dengan caramu</span>
            </h1>
            <p className="report-lead">
              Kamu tidak perlu menjelaskan semuanya. Hanya kronologi yang wajib diisi, dan
              kamu boleh berhenti kapan saja.
            </p>
            <p className="report-alert-line">
              Dalam bahaya sekarang?{" "}
              <Link href="/darurat" className="report-alert-link">
                Lihat kontak darurat
              </Link>
            </p>
          </div>

          <div className="hidden lg:block">
            <ReportSheetArt />
          </div>
        </div>
        <div className="hero-bottom-rule" aria-hidden="true">
          <span />
        </div>
      </section>

      <div className="mx-auto max-w-4xl px-4 pb-16 sm:px-8 sm:pb-20 lg:px-10 lg:pb-24">
        <div className="report-sheet">
          <span className="report-tab" aria-hidden="true">
            Lembar laporan · tanpa nama
          </span>

          <div className="report-band">
            <p className="report-band-title">
              <ShieldCheck aria-hidden="true" className="size-4" />
              Sebelum mulai
            </p>
            <ul className="report-band-list">
              <li>Tidak ada akun, nama, atau kontak yang diminta.</li>
              <li>Draf hanya tersimpan selama halaman ini terbuka.</li>
              <li>
                Jika memungkinkan, gunakan mode penyamaran dan tutup tab ini setelah
                selesai.
              </li>
            </ul>
          </div>

          <form onSubmit={handleSubmit} noValidate>
            <fieldset className="report-section" aria-labelledby="bagian-peran">
              <div className="report-section-head">
                <span aria-hidden="true" className="report-section-num">
                  01
                </span>
                <h2 id="bagian-peran" className="report-section-title">
                  Kamu melapor sebagai
                </h2>
                <p className="report-section-note">
                  Pilih yang paling dekat dengan posisimu saat kejadian.
                </p>
              </div>
              <div className="report-section-body">
                <div className="report-choices" data-invalid={Boolean(fieldErrors.reporterRole)}>
                  {roles.map((role) => (
                    <label key={role.value} className="report-choice">
                      <input
                        type="radio"
                        name="reporterRole"
                        value={role.value}
                        checked={reporterRole === role.value}
                        onChange={() => {
                          setReporterRole(role.value);
                          clearFieldError("reporterRole");
                        }}
                        aria-describedby={
                          fieldErrors.reporterRole ? "reporterRole-error" : undefined
                        }
                      />
                      {role.label}
                    </label>
                  ))}
                </div>
                {fieldErrors.reporterRole ? (
                  <p id="reporterRole-error" className="report-error-text">
                    {fieldErrors.reporterRole}
                  </p>
                ) : null}
              </div>
            </fieldset>

            <section className="report-section" aria-labelledby="bagian-kejadian">
              <div className="report-section-head">
                <span aria-hidden="true" className="report-section-num">
                  02
                </span>
                <h2 id="bagian-kejadian" className="report-section-title">
                  Tentang kejadian
                </h2>
                <p className="report-section-note">
                  Kalau tidak ingat pasti, boleh dikosongkan.
                </p>
              </div>
              <div className="report-section-body">
                <div>
                  <label htmlFor="category" className="report-label">
                    Kategori kejadian
                  </label>
                  <select
                    id="category"
                    value={category}
                    onChange={(event) => {
                      setCategory(event.target.value);
                      clearFieldError("category");
                    }}
                    aria-invalid={Boolean(fieldErrors.category)}
                    aria-describedby={
                      fieldErrors.category ? "category-error" : undefined
                    }
                    className="report-select"
                  >
                    <option value="">Pilih kategori</option>
                    {categories.map((item) => (
                      <option key={item.value} value={item.value}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                  {fieldErrors.category ? (
                    <p id="category-error" className="report-error-text">
                      {fieldErrors.category}
                    </p>
                  ) : null}
                </div>

                <div className="report-grid">
                  <div>
                    <label htmlFor="incidentDate" className="report-label">
                      Tanggal kejadian{" "}
                      <span className="report-label-note">(opsional)</span>
                    </label>
                    <Input
                      id="incidentDate"
                      type="date"
                      value={incidentDate}
                      onChange={(event) => setIncidentDate(event.target.value)}
                      className="report-input"
                    />
                  </div>
                  <div>
                    <label htmlFor="locationText" className="report-label">
                      Lokasi <span className="report-label-note">(opsional)</span>
                    </label>
                    <Input
                      id="locationText"
                      value={locationText}
                      onChange={(event) => setLocationText(event.target.value)}
                      maxLength={200}
                      placeholder="Contoh: gedung kelas, area parkir"
                      className="report-input"
                    />
                  </div>
                </div>
              </div>
            </section>

            <section className="report-section" aria-labelledby="bagian-cerita">
              <div className="report-section-head">
                <span aria-hidden="true" className="report-section-num">
                  03
                </span>
                <h2 id="bagian-cerita" className="report-section-title">
                  Apa yang terjadi
                </h2>
                <p className="report-section-note">
                  Hanya bagian ini yang wajib diisi.
                </p>
              </div>
              <div className="report-section-body">
                <div>
                  <label htmlFor="description" className="report-label">
                    Kronologi <span className="report-label-note">(wajib)</span>
                  </label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(event) => {
                      setDescription(event.target.value);
                      clearFieldError("description");
                    }}
                    minLength={20}
                    maxLength={5000}
                    rows={8}
                    aria-invalid={Boolean(fieldErrors.description)}
                    aria-describedby="description-hint description-error"
                    placeholder="Tulis apa yang terjadi dengan kata-katamu sendiri."
                    className="report-textarea"
                  />
                  <div className="report-hint-row">
                    <p id="description-hint">
                      Minimal 20 karakter. Maksimal 5000 karakter.
                    </p>
                    <p aria-hidden="true">{description.length}/5000</p>
                  </div>
                  {fieldErrors.description ? (
                    <p id="description-error" className="report-error-text">
                      {fieldErrors.description}
                    </p>
                  ) : null}
                </div>
              </div>
            </section>

            <section className="report-section" aria-labelledby="bagian-bukti">
              <div className="report-section-head">
                <span aria-hidden="true" className="report-section-num">
                  04
                </span>
                <h2 id="bagian-bukti" className="report-section-title">
                  Bukti, kalau ada
                </h2>
                <p className="report-section-note">
                  Boleh dilewati. Laporan tetap bisa dikirim.
                </p>
              </div>
              <div className="report-section-body">
                <div>
                  <label htmlFor="evidence" className="report-label">
                    Berkas pendukung{" "}
                    <span className="report-label-note">(opsional)</span>
                  </label>
                  <input
                    id="evidence"
                    type="file"
                    multiple
                    accept="image/jpeg,image/png,image/webp,application/pdf,audio/mpeg,audio/mp4,video/mp4"
                    onChange={(event) => {
                      addFiles(Array.from(event.target.files ?? []));
                      event.target.value = "";
                    }}
                    className="report-file"
                  />
                  <p className="report-note">
                    Maksimal {MAX_EVIDENCE_PER_REPORT} berkas, masing-masing {MAX_FILE_MB}{" "}
                    MB. Foto JPG/PNG/WebP akan diproses ulang sehingga metadata EXIF/GPS
                    dihapus. Untuk PDF, audio, dan video, metadata tidak dapat dihapus
                    otomatis.
                  </p>
                  <p className="report-note">Nama berkas asli tidak disimpan.</p>

                  {files.length > 0 ? (
                    <ul className="report-files">
                      {files.map((file, index) => (
                        <li
                          key={`${file.name}-${file.size}-${index}`}
                          className="report-file-row"
                        >
                          <Paperclip aria-hidden="true" className="report-file-icon" />
                          <span className="min-w-0 flex-1 truncate">{file.name}</span>
                          <span className="report-file-size">
                            {(file.size / (1024 * 1024)).toFixed(1)} MB
                          </span>
                          <button
                            type="button"
                            onClick={() => removeFile(index)}
                            className="report-file-remove"
                            aria-label={`Hapus ${file.name}`}
                          >
                            <Trash2 aria-hidden="true" className="size-4" />
                          </button>
                        </li>
                      ))}
                    </ul>
                  ) : null}

                  {fileError ? (
                    <p role="alert" className="report-error-text">
                      {fileError}
                    </p>
                  ) : null}
                </div>
              </div>
            </section>

            <section className="report-section" aria-labelledby="bagian-kirim">
              <div className="report-section-head">
                <span aria-hidden="true" className="report-section-num">
                  05
                </span>
                <h2 id="bagian-kirim" className="report-section-title">
                  Sebelum mengirim
                </h2>
                <p className="report-section-note">
                  Tiket hanya muncul sekali setelah laporan terkirim.
                </p>
              </div>
              <div className="report-section-body">
                <label className="report-confirm" data-invalid={Boolean(fieldErrors.confirmed)}>
                  <input
                    id="confirmed"
                    type="checkbox"
                    checked={confirmed}
                    onChange={(event) => {
                      setConfirmed(event.target.checked);
                      clearFieldError("confirmed");
                    }}
                    aria-describedby={fieldErrors.confirmed ? "confirmed-error" : undefined}
                  />
                  <span>
                    Saya memahami bahwa tiket hanya ditampilkan sekali dan tidak dapat
                    dipulihkan jika hilang.
                  </span>
                </label>
                {fieldErrors.confirmed ? (
                  <p id="confirmed-error" className="report-error-text">
                    {fieldErrors.confirmed}
                  </p>
                ) : null}

                {error ? (
                  <div role="alert" className="report-error">
                    {error}
                  </div>
                ) : null}

                <div className="report-actions">
                  <p className="report-actions-note">
                    Dengan mengirim, laporan disimpan terenkripsi dan hanya dapat dibaca
                    petugas berwenang.
                  </p>
                  <Button
                    type="submit"
                    disabled={submitting}
                    className="report-submit"
                  >
                    {submitting ? "Mengirim..." : "Kirim laporan"}
                  </Button>
                </div>
              </div>
            </section>
          </form>
        </div>
      </div>
    </div>
  );
}
