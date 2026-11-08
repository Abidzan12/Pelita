"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ADMIN_ROLE_LABELS, STATUS_LABELS } from "@/lib/labels";

type AssignableAdmin = {
  id: string;
  name: string;
  role: string;
};

type Props = {
  reportId: string;
  currentStatus: string;
  assignedToId: string | null;
  admins: AssignableAdmin[];
};

export function AdminReportActions({
  reportId,
  currentStatus,
  assignedToId,
  admins,
}: Props) {
  const router = useRouter();
  const [status, setStatus] = useState(currentStatus);
  const [assignee, setAssignee] = useState(assignedToId ?? "");
  const [savingStatus, setSavingStatus] = useState(false);
  const [savingAssignee, setSavingAssignee] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function saveStatus(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSavingStatus(true);
    setMessage(null);
    setError(null);
    try {
      const response = await fetch(`/api/admin/reports/${reportId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const payload = (await response.json().catch(() => null)) as {
        ok: boolean;
        error?: string;
      } | null;
      if (!response.ok || !payload?.ok) {
        setError(payload?.error ?? "Status belum berubah.");
        return;
      }
      setMessage("Status diperbarui.");
      router.refresh();
    } catch {
      setError("Koneksi terputus. Status belum berubah.");
    } finally {
      setSavingStatus(false);
    }
  }

  async function saveAssignee(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSavingAssignee(true);
    setMessage(null);
    setError(null);
    try {
      const response = await fetch(`/api/admin/reports/${reportId}/assign`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminId: assignee || null }),
      });
      const payload = (await response.json().catch(() => null)) as {
        ok: boolean;
        error?: string;
      } | null;
      if (!response.ok || !payload?.ok) {
        setError(payload?.error ?? "Penugasan belum berubah.");
        return;
      }
      setMessage("Penugasan diperbarui.");
      router.refresh();
    } catch {
      setError("Koneksi terputus. Penugasan belum berubah.");
    } finally {
      setSavingAssignee(false);
    }
  }

  return (
    <section
      aria-labelledby="tindakan-heading"
      className="rounded-lg border border-border bg-card p-5"
    >
      <h2 id="tindakan-heading" className="text-lg font-semibold">
        Tindakan
      </h2>

      <form onSubmit={saveStatus} className="mt-4 flex flex-wrap items-end gap-3">
        <div className="min-w-48 flex-1">
          <Label htmlFor="status">Ubah status</Label>
          <select
            id="status"
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            className="mt-2 h-11 w-full rounded-lg border border-input bg-background px-3 text-sm"
          >
            {Object.entries(STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <Button type="submit" disabled={savingStatus} className="h-11 px-5">
          {savingStatus ? "Menyimpan..." : "Simpan status"}
        </Button>
      </form>

      <form onSubmit={saveAssignee} className="mt-4 flex flex-wrap items-end gap-3">
        <div className="min-w-48 flex-1">
          <Label htmlFor="assignee">Tugaskan ke</Label>
          <select
            id="assignee"
            value={assignee}
            onChange={(event) => setAssignee(event.target.value)}
            className="mt-2 h-11 w-full rounded-lg border border-input bg-background px-3 text-sm"
          >
            <option value="">Belum ditugaskan</option>
            {admins.map((admin) => (
              <option key={admin.id} value={admin.id}>
                {admin.name} — {ADMIN_ROLE_LABELS[admin.role] ?? admin.role}
              </option>
            ))}
          </select>
        </div>
        <Button
          type="submit"
          variant="outline"
          disabled={savingAssignee}
          className="h-11 px-5"
        >
          {savingAssignee ? "Menyimpan..." : "Simpan penugasan"}
        </Button>
      </form>

      {message ? (
        <p role="status" className="mt-3 text-sm text-primary">
          {message}
        </p>
      ) : null}
      {error ? (
        <p role="alert" className="mt-3 text-sm text-destructive">
          {error}
        </p>
      ) : null}
    </section>
  );
}
