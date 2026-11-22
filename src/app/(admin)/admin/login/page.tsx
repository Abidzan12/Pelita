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
    <div className="admin-shell flex min-h-dvh items-center justify-center px-4 py-10">
      <main className="w-full max-w-4xl">
        <Link
          href="/"
          className="mb-5 inline-flex items-center gap-2 text-lg font-semibold tracking-tight lg:hidden"
        >
          <span aria-hidden="true" className="size-2.5 rounded-full bg-primary" />
          PELITA<span className="text-[#ee8064]">.</span>
        </Link>

        <div className="grid overflow-hidden rounded-xl border border-border bg-card lg:grid-cols-[minmax(0,1fr)_minmax(0,25rem)]">
          <div className="admin-sidebar hidden flex-col justify-between p-8 lg:flex">
            <Link href="/" className="flex items-center gap-2.5 text-lg font-semibold">
              <svg viewBox="0 0 40 40" aria-hidden="true" className="size-8 shrink-0">
                <path d="M20 2 36 11v18L20 38 4 29V11L20 2Z" fill="currentColor" />
                <path
                  d="M20 10v11m0 0 7-4m-7 4-7-4m7 4v8"
                  fill="none"
                  stroke="#f7e9c8"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <circle cx="20" cy="10" r="2.5" fill="#f1c957" />
                <circle cx="13" cy="17" r="2" fill="#ee8064" />
                <circle cx="27" cy="17" r="2" fill="#ee8064" />
                <circle cx="20" cy="29" r="2" fill="#f1c957" />
              </svg>
              PELITA<span className="text-[#ee8064]">.</span>
            </Link>

            <div className="py-10">
              <p className="inline-flex items-center gap-2 rounded-md border border-white/20 px-2.5 py-1 text-xs font-semibold tracking-[0.12em] text-[#f1c957] uppercase">
                <ShieldCheck aria-hidden="true" className="size-3.5" />
                Area terbatas
              </p>
              <h2 className="mt-4 max-w-[18ch] text-3xl font-semibold tracking-tight text-[#fff7e9]">
                Ruang kerja petugas PELITA
              </h2>
              <p className="mt-3 max-w-[34ch] text-sm leading-relaxed text-[#d9e3dc]">
                Kelola laporan, jadwal konseling, dan konten edukasi dengan akses yang
                tercatat.
              </p>
            </div>

            <p className="text-xs leading-relaxed text-[#d9e3dc]">
              Panel ini hanya untuk Satgas PPKS, Konselor ULBK, dan Super Admin.
            </p>
          </div>

          <div className="p-6 sm:p-8">
            <p className="flex items-center gap-2 text-sm font-semibold text-primary lg:hidden">
              <ShieldCheck aria-hidden="true" className="size-4" />
              Area terbatas
            </p>
            <h1 className="mt-3 text-2xl font-semibold tracking-tight lg:mt-0">
              Masuk petugas
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Semua akses laporan dicatat di audit log.
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

            <p className="mt-6 text-sm text-muted-foreground">
              <Link
                href="/"
                className="underline-offset-4 hover:text-foreground hover:underline"
              >
                Kembali ke situs publik
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
