"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type LoginResponse = {
  ok: boolean;
  error?: string;
  totpRequired?: boolean;
};

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [totp, setTotp] = useState("");
  const [totpRequired, setTotpRequired] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          ...(totpRequired && totp ? { totp } : {}),
        }),
      });
      const payload = (await response.json().catch(() => null)) as LoginResponse | null;

      if (!response.ok || !payload?.ok) {
        if (payload?.totpRequired) {
          setTotpRequired(true);
        }
        setError(payload?.error ?? "Tidak bisa masuk. Coba lagi.");
        return;
      }

      router.replace("/admin");
      router.refresh();
    } catch {
      setError("Koneksi terputus. Coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-muted/40 px-4 py-12">
      <div className="w-full max-w-md">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-lg font-semibold tracking-tight"
        >
          <span aria-hidden="true" className="size-2.5 rounded-full bg-primary" />
          Pelita
        </Link>

        <div className="mt-6 rounded-lg border border-border bg-card p-6 shadow-sm">
          <p className="flex items-center gap-2 text-sm font-medium text-primary">
            <ShieldCheck aria-hidden="true" className="size-4" />
            Area terbatas
          </p>
          <h1 className="mt-3 text-2xl font-semibold tracking-tight">Masuk petugas</h1>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Panel ini hanya untuk Satgas PPKS, Konselor ULBK, dan Super Admin. Semua akses
            laporan dicatat di audit log.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="username"
                required
                className="mt-2 h-11 bg-background"
              />
            </div>

            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
                required
                className="mt-2 h-11 bg-background"
              />
            </div>

            {totpRequired ? (
              <div>
                <Label htmlFor="totp">Kode 2FA</Label>
                <Input
                  id="totp"
                  type="text"
                  value={totp}
                  onChange={(event) => setTotp(event.target.value)}
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  required
                  className="mt-2 h-11 bg-background font-mono tracking-widest"
                />
              </div>
            ) : null}

            {error ? (
              <p role="alert" className="text-sm text-destructive">
                {error}
              </p>
            ) : null}

            <Button
              type="submit"
              disabled={loading}
              className="h-11 w-full px-5 text-base font-semibold"
            >
              {loading ? "Memeriksa..." : "Masuk"}
            </Button>
          </form>
        </div>

        <p className="mt-4 text-center text-sm text-muted-foreground">
          <Link
            href="/"
            className="underline-offset-4 hover:text-foreground hover:underline"
          >
            Kembali ke situs publik
          </Link>
        </p>
      </div>
    </div>
  );
}
