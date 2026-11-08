# Asumsi PELITA

Catatan keputusan yang tidak diatur eksplisit di `PELITA_TECHNICAL_DESIGN.md`.
Setiap asumsi harus bisa dijelaskan saat presentasi.

## Stack & versi

- **Next.js 15.5.29** (App Router) dan **React 19.1.0**: versi stabil yang dipakai
  `create-next-app`, masih memenuhi syarat "Next.js 14+" dan lebih teruji daripada
  rilis major terbaru.
- **Prisma 6.19.3**: skema pada dokumen teknis memakai `prisma-client-js` dan
  `datasource.url`, yang masih didukung penuh di Prisma 6. Prisma 7 mengubah
  konfigurasi generator dan belum diperlukan untuk prototipe ini.
- **Tailwind CSS 4** + **shadcn/ui** (gaya `base-nova`): bawaan scaffold terbaru.
  Komponen tetap lokal di `src/components/ui`, tanpa aset dari CDN.
- **Vitest 5** untuk unit test.
- **Zod 4** untuk validasi input.
- **PostgreSQL 16** (image `postgres:16-alpine`) memenuhi syarat "PostgreSQL 15+".
- **react-markdown 10 + rehype-sanitize 6** untuk merender Markdown artikel. Dipilih
  karena Markdown perlu ditampilkan dan disanitasi; menulis parser sendiri lebih
  berisiko. Tidak ada analytics atau pelacak.
- **leaflet 1.9 + react-leaflet 5** untuk peta, sesuai Bagian 4 dokumen teknis.
  Ubin peta dimuat dari `tile.openstreetmap.org`; ini satu-satunya permintaan ke
  domain pihak ketiga dan hanya terjadi di halaman `/peta`.

## Keamanan

- **CSP masih memakai `'unsafe-inline'` untuk skrip.** Next.js menyisipkan skrip
  hidrasi inline; nonce per-request membutuhkan middleware dan akan dikerjakan pada
  fase hardening. Header lain (`Referrer-Policy`, `nosniff`, `DENY`, `no-store`)
  sudah aktif.
- **Metadata PDF/audio/video:** mengikuti opsi kedua pada dokumen teknis, yaitu
  menerima berkas dan menampilkan catatan di UI bahwa metadata tidak dapat dihapus
  otomatis. Gambar tetap di-re-encode dengan `sharp` sehingga EXIF/GPS hilang.
- **Tiket:** normalisasi hanya mengubah huruf besar serta menghapus spasi dan tanda
  hubung. Prefiks `PLT` tetap menjadi bagian tiket yang di-hash; tiket tanpa `PLT`
  dianggap tidak valid.
- **Rate limit** disimpan di memori proses. Pada deployment multi-instance, batas
  ini berlaku per instance; cukup untuk prototipe demo.
- **Cookie pelapor** tidak dibuat sama sekali. State pelapor hanya ada di memori
  halaman dan bergantung pada tiket.

## Data tim yang belum tersedia

- Nomor/kanal kontak darurat, koordinat kampus, dan akun seed diisi dengan
  placeholder `ISI_OLEH_TIM`. Agent tidak mengarang data tersebut.

## Admin & seed

- Sesi admin memakai JWT HS256 di cookie `httpOnly`, `sameSite=strict`, `secure` di
  produksi, berlaku 8 jam. Peran dibaca ulang dari database pada setiap request agar
  akun yang dinonaktifkan langsung kehilangan akses.
- Login dibatasi 5 kegagalan per akun per 15 menit dan 20 percobaan per IP per 15
  menit. Kunci disimpan sebagai HMAC di memori, bukan email/IP mentah.
- Endpoint admin yang mengubah data memeriksa header `Origin` terhadap `APP_URL`
  (fallback: origin request) sebagai proteksi CSRF, selain cookie `sameSite=strict`.
- Seed membuat akun demo `super.admin@pelita.local`, `satgas.demo@pelita.local`, dan
  `konselor.demo@pelita.local` dengan password dari `.env`. Kredensial demo ini hanya
  untuk prototipe dan wajib diganti sebelum deploy.
- `AuditLog` mencatat VIEW_REPORT, VIEW_EVIDENCE, CHANGE_STATUS, ASSIGN_REPORT, dan
  SEND_MESSAGE. Karena halaman detail dirender di server, satu kunjungan dapat
  menghasilkan lebih dari satu catatan VIEW_REPORT bila halaman dirender ulang.
- Konselor hanya dapat melihat laporan yang ditugaskan kepadanya dan tidak dapat
  mengunduh isi bukti atau mengubah status. Batasan ini dicek di server, bukan hanya
  disembunyikan di UI.

## Konseling

- Kode booking memakai format `BKG-XXXX-XXXX-XXXX-XXXX` dan disimpan hanya sebagai
  HMAC. Domain HMAC dibedakan dari tiket (`booking:` vs tiket), walaupun memakai
  `TICKET_PEPPER` yang sama.
- Kontak konseling bersifat opsional. Bila diisi, kontak dienkripsi sebelum disimpan
  dan hanya ditampilkan kepada Konselor/Super Admin di panel. Pengisian kontak
  dianggap sebagai persetujuan untuk dihubungi.
- Pembatalan/penjadwalan ulang booking belum tersedia pada versi ini. Slot yang sudah
  dipesan tidak dapat diubah atau dihapus.
- Super Admin boleh membuat slot untuk Konselor aktif; Konselor hanya mengelola
  slotnya sendiri.

## Chatbot

- Chatbot berbasis aturan dan FAQ lokal, bukan LLM. Tidak ada pesan yang disimpan.
- Daftar kata kunci bahaya mencakup ungkapan seperti "bunuh diri", "disiksa",
  "dipukul", "diancam", "diperkosa", dan "butuh bantuan sekarang". Bila terdeteksi,
  chatbot menampilkan arahan bantuan segera dan tautan ke halaman Kontak Darurat,
  tanpa mengarang nomor atau alamat.

## Statistik

- Format semester adalah `YYYY-1` (Januari–Juni) atau `YYYY-2` (Juli–Desember).
- Statistik hanya memuat agregat: jumlah per status/kategori/bulan dan rata-rata
  waktu respons. Rata-rata dihitung dari selisih pesan admin pertama dan waktu
  laporan dibuat, hanya untuk laporan yang sudah dibalas.
- Halaman dan API statistik hanya untuk Satgas dan Super Admin. Ekspor CSV dicatat
  di audit log.

## Artikel & peta

- Markdown artikel dirender dengan `react-markdown` dan disanitasi memakai
  `rehype-sanitize`. HTML mentah dan tautan `javascript:` dibuang sebelum tampil.
- Seed memperbarui isi 4 artikel bawaan setiap kali dijalankan. Perubahan manual
  pada artikel bawaan akan tertimpa bila seed dijalankan ulang.
- Peta memakai Leaflet + ubin OpenStreetMap. Ini satu-satunya permintaan ke domain
  pihak ketiga dan hanya terjadi di `/peta`. CSP `img-src` dibuka khusus untuk
  `*.tile.openstreetmap.org`.
- `CAMPUS_MAP_LAT` dan `CAMPUS_MAP_LNG` harus diisi tim. Selama kosong, halaman
  `/peta` menampilkan pemberitahuan dan daftar titik (tanpa peta). Fitur peta sudah
  diuji dengan koordinat uji sementara, lalu data uji dihapus; koordinat kampus yang
  sebenarnya belum diisi.
- Titik rawan hanya menyimpan koordinat, kategori, deskripsi, dan status moderasi.
  Tidak ada relasi ke laporan atau identitas pelapor.
