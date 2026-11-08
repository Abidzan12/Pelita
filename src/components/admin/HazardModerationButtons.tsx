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
          className="inline-flex min-h-10 items-center rounded-md border border-emerald-300 bg-emerald-50 px-3 text-xs font-semibold text-emerald-800 hover:bg-emerald-100 disabled:opacity-60"
        >
          Setujui
        </button>
      ) : null}
      {status !== "REJECTED" ? (
        <button
          type="button"
          disabled={saving}
          onClick={() => moderate("REJECTED")}
          className="inline-flex min-h-10 items-center rounded-md border border-destructive/30 bg-destructive/5 px-3 text-xs font-semibold text-destructive hover:bg-destructive/10 disabled:opacity-60"
        >
          Tolak
        </button>
      ) : null}
      {status === "APPROVED" || status === "REJECTED" ? (
        <button
          type="button"
          disabled={saving}
          onClick={() => moderate("PENDING")}
          className="inline-flex min-h-10 items-center rounded-md px-3 text-xs font-medium text-muted-foreground hover:bg-muted disabled:opacity-60"
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
