import Link from "next/link";

const navigation = [
  { href: "/lapor", label: "Lapor" },
  { href: "/status", label: "Cek status" },
  { href: "/konseling", label: "Konseling" },
  { href: "/edukasi", label: "Edukasi" },
  { href: "/peta", label: "Peta titik rawan" },
  { href: "/darurat", label: "Kontak darurat" },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-muted/40">
      <div className="mx-auto grid max-w-5xl gap-8 px-4 py-10 sm:grid-cols-[1.4fr_1fr]">
        <div>
          <p className="flex items-center gap-2 text-base font-semibold">
            <span aria-hidden="true" className="size-2.5 rounded-full bg-primary" />
            Pelita
          </p>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
            Ruang aman untuk melaporkan kekerasan seksual dan perundungan di lingkungan
            kampus. Pelapor tidak perlu membuat akun atau memberikan identitas.
          </p>
          <p className="mt-4 max-w-md text-xs leading-relaxed text-muted-foreground">
            Prototipe untuk tugas kuliah. Enkripsi berlaku saat data disimpan di server,
            bukan enkripsi ujung ke ujung.
          </p>
        </div>

        <nav aria-label="Navigasi footer">
          <ul className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
            {navigation.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="inline-flex min-h-11 items-center text-muted-foreground underline-offset-4 hover:text-foreground hover:underline focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </footer>
  );
}
