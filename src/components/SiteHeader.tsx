import Link from "next/link";

const navigation = [
  { href: "/lapor", label: "Lapor" },
  { href: "/status", label: "Cek status" },
  { href: "/konseling", label: "Konseling" },
  { href: "/edukasi", label: "Edukasi" },
  { href: "/peta", label: "Peta titik rawan" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3">
        <Link
          href="/"
          className="flex min-h-11 items-center gap-2 rounded-md text-lg font-semibold tracking-tight focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        >
          <span aria-hidden="true" className="size-2.5 rounded-full bg-primary" />
          Pelita
        </Link>

        <nav aria-label="Navigasi utama" className="order-3 w-full sm:order-2 sm:w-auto">
          <ul className="-mx-2 flex items-center gap-1 overflow-x-auto text-sm">
            {navigation.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="inline-flex min-h-11 items-center rounded-md px-2 font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <Link
          href="/darurat"
          className="order-2 ml-auto inline-flex min-h-11 items-center rounded-md border border-primary/30 bg-secondary px-3 text-sm font-semibold text-secondary-foreground transition-colors hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none sm:order-3"
        >
          Butuh bantuan sekarang?
        </Link>
      </div>
    </header>
  );
}
