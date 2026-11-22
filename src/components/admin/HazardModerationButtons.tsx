"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function HazardModerationButtons({
  pointId,
  status,
}: {
  pointId: string;
  status: string;
}) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function moderate(nextStatus: "APPROVED" | "REJECTED" | "PENDING") {
    setSaving(true);
    setError(null);
    try {
      const response = await fetch(`/api/admin/hazard-points/${pointId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      const payload = (await response.json().catch(() => null)) as {
        ok: boolean;
        error?: string;
      } | null;
      if (!response.ok || !payload?.ok) {
        setError(payload?.error ?? "Status belum berubah.");
        return;
      }
      router.refresh();
    } catch {
      setError("Koneksi terputus. Status belum berubah.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {status !== "APPROVED" ? (
        <button
          type="button"
          disabled={saving}
          onClick={() => moderate("APPROVED")}
          className="inline-flex min-h-11 items-center rounded-md border border-[#8fae9b] bg-[#e7f0e8] px-3 text-xs font-semibold text-[#2c4a3d] transition-colors hover:bg-[#dbe9dd] focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none disabled:opacity-60"
        >
          Setujui
        </button>
      ) : null}
      {status !== "REJECTED" ? (
        <button
          type="button"
          disabled={saving}
          onClick={() => moderate("REJECTED")}
          className="inline-flex min-h-11 items-center rounded-md border border-[#c9a29a] bg-[#f6e2de] px-3 text-xs font-semibold text-[#8a2f1d] transition-colors hover:bg-[#f0d3cd] focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none disabled:opacity-60"
        >
          Tolak
        </button>
      ) : null}
      {status === "APPROVED" || status === "REJECTED" ? (
        <button
          type="button"
          disabled={saving}
          onClick={() => moderate("PENDING")}
          className="inline-flex min-h-11 items-center rounded-md px-3 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none disabled:opacity-60"
        >
          Tandai pending
        </button>
      ) : null}
      {error ? (
        <span role="alert" className="text-xs text-destructive">
          {error}
        </span>
      ) : null}
    </div>
  );
}
