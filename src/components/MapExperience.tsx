"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { HAZARD_CATEGORY_LABELS } from "@/lib/labels";
import type { MapPoint } from "@/components/MapView";

const MapView = dynamic(() => import("@/components/MapView"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[420px] items-center justify-center rounded-lg border border-border bg-muted/40 text-sm text-muted-foreground">
      Memuat peta…
    </div>
  ),
});

type MapExperienceProps = {
  center: [number, number];
  points: MapPoint[];
};

export function MapExperience({ center, points }: MapExperienceProps) {
  const [selected, setSelected] = useState<{ lat: number; lng: number } | null>(null);
  const [category, setCategory] = useState("GELAP");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

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
    <div className="space-y-4">
      <MapView
        center={center}
        points={points}
        selected={selected}
        onSelect={(lat, lng) => setSelected({ lat, lng })}
      />

      <form
        onSubmit={submitProposal}
        className="rounded-lg border border-border bg-card p-5"
      >
        <h2 className="text-lg font-semibold">Usulkan titik rawan</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Klik lokasi di peta, lalu jelaskan kondisi umumnya. Jangan mencantumkan nama,
          nomor, atau detail yang bisa mengidentifikasi seseorang.
        </p>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="hazard-category">Kategori</Label>
            <select
              id="hazard-category"
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              className="mt-2 h-11 w-full rounded-lg border border-input bg-background px-3 text-sm"
            >
              {Object.entries(HAZARD_CATEGORY_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div className="text-sm text-muted-foreground">
            <p className="text-xs font-medium">Lokasi terpilih</p>
            <p className="mt-2 font-mono text-xs">
              {selected
                ? `${selected.lat.toFixed(5)}, ${selected.lng.toFixed(5)}`
                : "Belum dipilih"}
            </p>
          </div>
        </div>

        <div className="mt-4">
          <Label htmlFor="hazard-description">Deskripsi kondisi</Label>
          <Textarea
            id="hazard-description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            maxLength={300}
            rows={3}
            placeholder="Contoh: area parkir dengan penerangan minim pada malam hari."
            className="mt-2 bg-background"
          />
          <p className="mt-1 text-xs text-muted-foreground">{description.length}/300</p>
        </div>

        {error ? (
          <p role="alert" className="mt-3 text-sm text-destructive">
            {error}
          </p>
        ) : null}
        {notice ? (
          <p role="status" className="mt-3 text-sm text-primary">
            {notice}
          </p>
        ) : null}

        <Button type="submit" disabled={submitting} className="mt-4 h-11 px-5">
          {submitting ? "Mengirim..." : "Kirim usulan"}
        </Button>
      </form>
    </div>
  );
}
