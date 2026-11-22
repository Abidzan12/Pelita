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
    <footer className="site-footer">
      <div className="mx-auto grid max-w-6xl gap-8 px-5 pt-10 pb-28 sm:grid-cols-[1.4fr_1fr] sm:px-8 sm:pb-10 lg:px-10">
        <div>
          <p className="flex items-center gap-2 text-base font-extrabold tracking-wide">
            <svg
              viewBox="0 0 40 40"
              aria-hidden="true"
              className="size-8 shrink-0 text-[#f1c957]"
            >
              <path d="M20 2 36 11v18L20 38 4 29V11L20 2Z" fill="currentColor" />
              <path
                d="M20 10v11m0 0 7-4m-7 4-7-4m7 4v8"
                fill="none"
                stroke="#183456"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="20" cy="10" r="2.5" fill="#ee8064" />
              <circle cx="13" cy="17" r="2" fill="#183456" />
              <circle cx="27" cy="17" r="2" fill="#183456" />
              <circle cx="20" cy="29" r="2" fill="#ee8064" />
            </svg>
            PELITA
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
                  className="footer-nav-link inline-flex min-h-11 items-center underline-offset-4 hover:underline focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
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
