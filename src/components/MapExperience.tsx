"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { HAZARD_CATEGORY_LABELS, hazardCategoryLabel } from "@/lib/labels";
import type { MapPoint } from "@/components/MapView";

const MapView = dynamic(() => import("@/components/MapView"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center bg-[#e6ede5] text-sm text-[#465460]">
      Memuat peta…
    </div>
  ),
});

type MapExperienceProps = {
  center: [number, number];
  points: MapPoint[];
  /** True saat daftar usulan gagal dimuat, bukan saat memang kosong. */
  approvedUnavailable?: boolean;
};

const LEGEND = [
  { kind: "SURVEY", label: "Hasil survei tim" },
  { kind: "USULAN", label: "Usulan yang disetujui" },
  { kind: "PILIHAN", label: "Lokasi pilihanmu" },
] as const;

function formatCoord(lat: number, lng: number): string {
  return `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
}

function PointRow({ point }: { point: MapPoint }) {
  return (
    <li className="peta-row" data-kind={point.source}>
      <span aria-hidden="true" className="peta-row-dot" />
      <div>
        <p className="peta-row-cat">{hazardCategoryLabel(point.category)}</p>
        <p className="peta-row-desc">{point.description}</p>
        <p className="peta-row-coord">{formatCoord(point.lat, point.lng)}</p>
      </div>
    </li>
  );
}

export function MapExperience({
  center,
  points,
  approvedUnavailable = false,
}: MapExperienceProps) {
  const [selected, setSelected] = useState<{ lat: number; lng: number } | null>(null);
  const [category, setCategory] = useState("GELAP");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const surveyPoints = points.filter((point) => point.source === "SURVEY");
  const approvedPoints = points.filter((point) => point.source === "USULAN");

  async function submitProposal(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selected) {
      setError("Klik lokasi pada peta terlebih dahulu.");
      return;
    }
    if (description.trim().length < 10) {
      setError("Deskripsi minimal 10 karakter.");
      return;
    }

    setSubmitting(true);
    setError(null);
    setNotice(null);
    try {
      const response = await fetch("/api/hazard-points", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lat: selected.lat,
          lng: selected.lng,
          category,
          description: description.trim(),
        }),
      });
      const payload = (await response.json().catch(() => null)) as {
        ok: boolean;
        data?: { message: string };
        error?: string;
      } | null;

      if (!response.ok || !payload?.ok) {
        setError(payload?.error ?? "Usulan belum bisa dikirim.");
        return;
      }

      setNotice(payload.data?.message ?? "Usulan terkirim dan menunggu moderasi.");
      setSelected(null);
      setDescription("");
    } catch {
      setError("Koneksi terputus. Usulan belum dikirim.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <div className="poster-sheet">
        <span className="poster-tab" aria-hidden="true">
          Peta kampus · tanpa data pribadi
        </span>

        <div className="peta-plate-head">
          <h2 className="poster-step-title">Denah area yang sudah dipetakan</h2>
          <p className="poster-step-note">
            Klik peta untuk menandai lokasi usulanmu. Titik di luar denah ini belum
            dipetakan.
          </p>
        </div>

        <div className="peta-canvas">
          <MapView
            center={center}
            points={points}
            selected={selected}
            onSelect={(lat, lng) => {
              setSelected({ lat, lng });
              setNotice(null);
            }}
          />
        </div>

        <div className="peta-legend">
          <ul>
            {LEGEND.map((item) => (
              <li key={item.kind}>
                <span aria-hidden="true" className="peta-swatch" data-kind={item.kind} />
                {item.label}
              </li>
            ))}
          </ul>
          <p className="peta-picked" aria-live="polite">
            {selected ? (
              <>
                Ditandai:{" "}
                <span className="peta-picked-coord">
                  {formatCoord(selected.lat, selected.lng)}
                </span>
                .{" "}
                <a href="#usul">Lengkapi usulan</a>
              </>
            ) : (
              "Belum ada lokasi yang ditandai."
            )}
          </p>
        </div>
      </div>

      <section aria-labelledby="daftar-titik" className="peta-index">
        <h2 id="daftar-titik" className="peta-index-title">
          Titik rawan
        </h2>
        <p className="peta-index-note">
          Dua kelompok di bawah ini dibedakan lewat warna penanda pada peta.
        </p>

        <div className="peta-index-grid">
          <div className="peta-group">
            <h3 className="peta-group-title">
              Hasil survei tim
              <span className="peta-group-count">{surveyPoints.length} titik</span>
            </h3>
            <ul className="peta-list">
              {surveyPoints.map((point) => (
                <PointRow key={point.id} point={point} />
              ))}
            </ul>
          </div>

          <div className="peta-group">
            <h3 className="peta-group-title">
              Usulan yang disetujui
              <span className="peta-group-count">{approvedPoints.length} titik</span>
            </h3>
            {approvedUnavailable ? (
              <p className="peta-group-empty">
                Daftar usulan sedang tidak dapat dimuat. Muat ulang halaman ini untuk
                mencoba lagi.
              </p>
            ) : approvedPoints.length === 0 ? (
              <p className="peta-group-empty">
                Belum ada usulan warga yang disetujui. Usulan yang kamu kirim akan tampil
                di sini setelah diperiksa tim.
              </p>
            ) : (
              <ul className="peta-list">
                {approvedPoints.map((point) => (
                  <PointRow key={point.id} point={point} />
                ))}
              </ul>
            )}
          </div>
        </div>
      </section>

      <div id="usul" tabIndex={-1} className="poster-sheet poster-sheet--stacked">
        <span className="poster-tab" aria-hidden="true">
          Usul titik · tanpa nama
        </span>

        <form onSubmit={submitProposal}>
          <section className="poster-step" aria-labelledby="usul-heading">
            <div className="poster-step-head">
              <h2 id="usul-heading" className="poster-step-title">
                Usulkan titik rawan
              </h2>
              <p className="poster-step-note">
                Tandai lokasi di peta, lalu jelaskan kondisi umumnya. Jangan cantumkan
                nama, nomor, atau detail yang bisa mengenali seseorang.
              </p>
            </div>

            <div className="poster-step-body">
              <div className="peta-form-grid">
                <div>
                  <label htmlFor="hazard-category" className="poster-label">
                    Kategori
                  </label>
                  <select
                    id="hazard-category"
                    value={category}
                    onChange={(event) => setCategory(event.target.value)}
                    className="poster-select"
                  >
                    {Object.entries(HAZARD_CATEGORY_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <p className="poster-label">Lokasi terpilih</p>
                  <p className="peta-picked-value" data-set={selected ? "true" : "false"}>
                    {selected
                      ? formatCoord(selected.lat, selected.lng)
                      : "Belum dipilih — klik peta di atas."}
                  </p>
                </div>
              </div>

              <div>
                <label htmlFor="hazard-description" className="poster-label">
                  Deskripsi kondisi
                </label>
                <textarea
                  id="hazard-description"
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  maxLength={300}
                  rows={3}
                  placeholder="Contoh: area parkir dengan penerangan minim pada malam hari."
                  className="poster-textarea poster-textarea--short"
                />
                <div className="poster-hint-row">
                  <p>Jelaskan kondisi tempatnya, bukan kejadian yang menimpa orang.</p>
                  <p>{description.length}/300</p>
                </div>
              </div>

              {error ? (
                <p role="alert" className="poster-error">
                  {error}
                </p>
              ) : null}
              {notice ? (
                <p role="status" className="peta-notice">
                  {notice}
                </p>
              ) : null}
            </div>
          </section>

          <div className="poster-step-foot">
            <p className="poster-note mt-0 max-w-[46ch]">
              Usulan diperiksa tim sebelum tampil di peta.
            </p>
            <button type="submit" disabled={submitting} className="poster-submit">
              {submitting ? "Mengirim…" : "Kirim usulan"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
