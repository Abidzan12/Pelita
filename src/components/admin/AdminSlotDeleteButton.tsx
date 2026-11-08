"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Trash2 } from "lucide-react";

export function AdminSlotDeleteButton({ slotId }: { slotId: string }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function remove() {
    setDeleting(true);
    setError(null);
    try {
      const response = await fetch(`/api/admin/counseling/slots/${slotId}`, {
        method: "DELETE",
      });
      const payload = (await response.json().catch(() => null)) as {
        ok: boolean;
        error?: string;
      } | null;
      if (!response.ok || !payload?.ok) {
        setError(payload?.error ?? "Slot belum bisa dihapus.");
        return;
      }
      router.refresh();
    } catch {
      setError("Koneksi terputus. Slot belum dihapus.");
    } finally {
      setDeleting(false);
      setConfirming(false);
    }
  }

  if (error) {
    return (
      <span role="alert" className="text-xs text-destructive">
        {error}
      </span>
    );
  }

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="inline-flex min-h-11 items-center gap-1 rounded-md px-2 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-destructive"
      >
        <Trash2 aria-hidden="true" className="size-3.5" />
        Hapus
      </button>
    );
  }

  return (
    <span className="inline-flex items-center gap-1">
      <button
        type="button"
        onClick={remove}
        disabled={deleting}
        className="inline-flex min-h-11 items-center rounded-md bg-destructive/10 px-2 text-xs font-semibold text-destructive hover:bg-destructive/20"
      >
        {deleting ? "Menghapus..." : "Yakin hapus"}
      </button>
      <button
        type="button"
        onClick={() => setConfirming(false)}
        className="inline-flex min-h-11 items-center rounded-md px-2 text-xs text-muted-foreground hover:bg-muted"
      >
        Batal
      </button>
    </span>
  );
}
