"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function AdminReplyForm({ reportId }: { reportId: string }) {
  const router = useRouter();
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function sendReply(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!body.trim() || sending) {
      return;
    }

    setSending(true);
    setError(null);
    try {
      const response = await fetch(`/api/admin/reports/${reportId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: body.trim() }),
      });
      const payload = (await response.json().catch(() => null)) as {
        ok: boolean;
        error?: string;
      } | null;

      if (!response.ok || !payload?.ok) {
        setError(payload?.error ?? "Balasan belum terkirim.");
        return;
      }

      setBody("");
      router.refresh();
    } catch {
      setError("Koneksi terputus. Balasan belum terkirim.");
    } finally {
      setSending(false);
    }
  }

  return (
    <form onSubmit={sendReply} className="mt-4">
      <Label htmlFor="reply">Balas pelapor</Label>
      <Textarea
        id="reply"
        value={body}
        onChange={(event) => setBody(event.target.value)}
        rows={3}
        maxLength={2000}
        placeholder="Tulis balasan yang empatik dan jelas. Jangan meminta identitas yang tidak diperlukan."
        className="mt-2 bg-card"
      />
      <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs text-muted-foreground">
          {body.length}/2000 · balasan dienkripsi
        </p>
        <Button type="submit" disabled={sending || !body.trim()} className="h-11 px-5">
          {sending ? "Mengirim..." : "Kirim balasan"}
        </Button>
      </div>
      {error ? (
        <p role="alert" className="mt-2 text-sm text-destructive">
          {error}
        </p>
      ) : null}
    </form>
  );
}
