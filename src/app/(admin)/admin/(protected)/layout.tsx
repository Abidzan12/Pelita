import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AdminLogoutButton } from "@/components/admin/AdminLogoutButton";
import { getCurrentAdmin } from "@/lib/auth";
import { ADMIN_ROLE_LABELS } from "@/lib/labels";

export const metadata: Metadata = {
  title: {
    default: "Panel petugas",
    template: "%s · Panel PELITA",
  },
  robots: { index: false, follow: false },
};

export default async function ProtectedAdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    redirect("/admin/login");
  }

  return (
    <div className="min-h-dvh bg-muted/30">
      <header className="border-b border-border bg-background">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3">
          <Link
            href="/admin"
            className="flex min-h-11 items-center gap-2 text-base font-semibold tracking-tight"
          >
            <span aria-hidden="true" className="size-2.5 rounded-full bg-primary" />
            Pelita <span className="font-normal text-muted-foreground">Panel</span>
          </Link>

          <nav
            aria-label="Navigasi panel"
            className="order-3 w-full sm:order-2 sm:w-auto"
          >
            <ul className="flex items-center gap-1 text-sm">
              <li>
                <Link
                  href="/admin"
                  className="inline-flex min-h-11 items-center rounded-md px-3 font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  Dasbor
                </Link>
              </li>
              <li>
                <Link
                  href="/admin/laporan"
                  className="inline-flex min-h-11 items-center rounded-md px-3 font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  Laporan
                </Link>
              </li>
              <li>
                <Link
                  href="/admin/konseling"
                  className="inline-flex min-h-11 items-center rounded-md px-3 font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  Konseling
                </Link>
              </li>
              {admin.role !== "KONSELOR" ? (
                <>
                  <li>
                    <Link
                      href="/admin/statistik"
                      className="inline-flex min-h-11 items-center rounded-md px-3 font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
                    >
                      Statistik
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/admin/artikel"
                      className="inline-flex min-h-11 items-center rounded-md px-3 font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
                    >
                      Artikel
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/admin/titik-rawan"
                      className="inline-flex min-h-11 items-center rounded-md px-3 font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
                    >
                      Titik rawan
                    </Link>
                  </li>
                </>
              ) : null}
            </ul>
          </nav>

          <div className="order-2 ml-auto flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-medium">{admin.name}</p>
              <p className="text-xs text-muted-foreground">
                {ADMIN_ROLE_LABELS[admin.role] ?? admin.role}
              </p>
            </div>
            <AdminLogoutButton />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
    </div>
  );
}
