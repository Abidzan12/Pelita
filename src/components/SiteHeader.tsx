"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight } from "lucide-react";

type NavItem = {
  href: string;
  label: string;
  shortLabel?: string;
  matches: (pathname: string) => boolean;
};

const navigation: NavItem[] = [
  {
    href: "/lapor",
    label: "Lapor",
    matches: (pathname: string) =>
      pathname === "/lapor" || pathname.startsWith("/lapor/"),
  },
  {
    href: "/status",
    label: "Cek status",
    matches: (pathname: string) => pathname === "/status",
  },
  {
    href: "/konseling",
    label: "Konseling",
    matches: (pathname: string) => pathname === "/konseling",
  },
  {
    href: "/edukasi",
    label: "Edukasi",
    matches: (pathname: string) => pathname.startsWith("/edukasi"),
  },
  {
    href: "/peta",
    label: "Peta titik rawan",
    shortLabel: "Peta",
    matches: (pathname: string) => pathname === "/peta",
  },
];

export function SiteHeader() {
  const pathname = usePathname() ?? "";
  const isHome = pathname === "/";
  const isEmergency = pathname === "/darurat";

  return (
    <header className="site-header sticky top-0 z-40">
      <div className="mx-auto grid max-w-6xl grid-cols-[1fr_auto] items-center gap-x-4 gap-y-2 px-4 py-2 sm:flex sm:gap-x-6 sm:px-8 sm:py-3 lg:px-10">
        <Link
          href="/"
          aria-current={isHome ? "page" : undefined}
          className={`brand-lockup ${isHome ? "brand-lockup--active" : ""} flex min-h-11 items-center gap-2 rounded-[3px] text-lg font-semibold tracking-tight focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none`}
        >
          <svg viewBox="0 0 40 40" aria-hidden="true" className="size-9 shrink-0">
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
            PELITA<span className="brand-period">.</span>
          </span>
        </Link>

        <nav
          aria-label="Navigasi utama"
          className="col-span-2 sm:order-2 sm:col-span-1 sm:w-auto"
        >
          <ul className="flex items-center gap-1 text-sm">
            {navigation.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-label={item.label}
                  aria-current={item.matches(pathname) ? "page" : undefined}
                  className={`site-nav-link ${item.matches(pathname) ? "site-nav-link--active" : ""} inline-flex min-h-11 items-center rounded-[3px] px-3 font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none`}
                >
                  {item.shortLabel ? (
                    <>
                      <span className="sm:hidden">{item.shortLabel}</span>
                      <span className="hidden sm:inline">{item.label}</span>
                    </>
                  ) : (
                    item.label
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <Link
          href="/darurat"
          aria-label="Butuh bantuan sekarang?"
          aria-current={isEmergency ? "page" : undefined}
          className={`header-help ${isEmergency ? "header-help--active" : ""} col-start-2 row-start-1 inline-flex min-h-11 items-center gap-1.5 rounded-[3px] px-3 text-sm font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none sm:order-3 sm:ml-auto`}
        >
          <span className="hidden sm:inline">Butuh bantuan sekarang?</span>
          <span className="sm:hidden">Bantuan</span>
          <ArrowUpRight aria-hidden="true" className="size-4" />
        </Link>
      </div>
    </header>
  );
}
