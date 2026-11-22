import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AdminLogoutButton } from "@/components/admin/AdminLogoutButton";
import { AdminNav } from "@/components/admin/AdminNav";
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
    <div className="admin-shell min-h-dvh lg:grid lg:grid-cols-[17rem_minmax(0,1fr)]">
      <a
        href="#konten"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-primary-foreground"
      >
        Lewati ke konten
      </a>
      <aside
        aria-label="Panel petugas"
        className="admin-sidebar sticky top-0 z-30 lg:flex lg:h-dvh lg:flex-col"
      >
        <div className="flex items-center justify-between gap-4 px-4 py-3 lg:px-5 lg:py-6">
          <Link
            href="/admin"
            className="flex min-h-11 items-center gap-2.5 rounded-md text-lg font-semibold tracking-tight"
          >
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
            <span>
              PELITA<span className="text-[#ee8064]">.</span>
            </span>
            <span className="rounded-md border border-white/20 px-1.5 py-0.5 text-xs font-semibold tracking-[0.14em] text-[#f1c957] uppercase">
              Panel
            </span>
          </Link>

          <div className="lg:hidden">
            <AdminLogoutButton />
          </div>
        </div>

        <div className="border-y border-white/10 px-3 py-3 lg:mt-2 lg:border-y-0 lg:py-0">
          <p className="hidden px-3 pb-2 text-xs font-semibold tracking-[0.18em] text-white/50 uppercase lg:block">
            Menu
          </p>
          <AdminNav role={admin.role} />
        </div>

        <div className="mt-auto hidden border-t border-white/10 px-5 py-4 lg:block">
          <p className="truncate text-sm font-semibold">{admin.name}</p>
          <p className="mt-0.5 text-xs text-[#d9e3dc]">
            {ADMIN_ROLE_LABELS[admin.role] ?? admin.role}
          </p>
          <div className="mt-2">
            <AdminLogoutButton />
          </div>
        </div>
      </aside>

      <div className="flex min-h-dvh flex-col">
        <main
          id="konten"
          className="flex-1 scroll-mt-36 px-4 py-8 sm:px-6 lg:scroll-mt-0 lg:px-10 lg:py-10"
        >
          <div className="mx-auto w-full max-w-6xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
