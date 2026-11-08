"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Counselor = { id: string; name: string };

export function AdminSlotForm({
  isSuperAdmin,
  counselors,
}: {
  isSuperAdmin: boolean;
  counselors: Counselor[];
}) {
  const router = useRouter();
  const [counselorId, setCounselorId] = useState(counselors[0]?.id ?? "");
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [mode, setMode] = useState("ONLINE");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  async function createSlot(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    setNotice(null);

    try {
      const response = await fetch("/api/admin/counseling/slots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          startsAt: new Date(startsAt).toISOString(),
          endsAt: new Date(endsAt).toISOString(),
          mode,
          ...(isSuperAdmin ? { counselorId } : {}),
        }),
      });
      const payload = (await response.json().catch(() => null)) as {
        ok: boolean;
        error?: string;
      } | null;

      if (!response.ok || !payload?.ok) {
        setError(payload?.error ?? "Slot belum bisa dibuat.");
        return;
      }

      setStartsAt("");
      setEndsAt("");
      setNotice("Slot dibuat.");
      router.refresh();
    } catch {
      setError("Koneksi terputus. Slot belum dibuat.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={createSlot} className="rounded-lg border border-border bg-card p-5">
      <h2 className="text-lg font-semibold">Tambah slot konseling</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        {isSuperAdmin ? (
          <div className="sm:col-span-2">
            <Label htmlFor="counselorId">Konselor</Label>
            <select
              id="counselorId"
              value={counselorId}
              onChange={(event) => setCounselorId(event.target.value)}
              required
              className="mt-2 h-11 w-full rounded-lg border border-input bg-background px-3 text-sm"
            >
              <option value="">Pilih konselor</option>
              {counselors.map((counselor) => (
                <option key={counselor.id} value={counselor.id}>
                  {counselor.name}
                </option>
              ))}
            </select>
          </div>
        ) : null}

        <div>
          <Label htmlFor="startsAt">Mulai</Label>
          <Input
            id="startsAt"
            type="datetime-local"
            value={startsAt}
            onChange={(event) => setStartsAt(event.target.value)}
            required
            className="mt-2 h-11 bg-background"
          />
        </div>
        <div>
          <Label htmlFor="endsAt">Selesai</Label>
          <Input
            id="endsAt"
            type="datetime-local"
            value={endsAt}
            onChange={(event) => setEndsAt(event.target.value)}
            required
            className="mt-2 h-11 bg-background"
          />
        </div>
        <div>
          <Label htmlFor="mode">Mode</Label>
          <select
            id="mode"
            value={mode}
            onChange={(event) => setMode(event.target.value)}
            className="mt-2 h-11 w-full rounded-lg border border-input bg-background px-3 text-sm"
          >
            <option value="ONLINE">Online</option>
            <option value="OFFLINE">Tatap muka</option>
          </select>
        </div>
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

      <Button type="submit" disabled={saving} className="mt-4 h-11 px-5">
        {saving ? "Menyimpan..." : "Tambah slot"}
      </Button>
    </form>
  );
}
