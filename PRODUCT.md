# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- Penyintas dan saksi kekerasan seksual atau perundungan di lingkungan kampus UNY yang ingin membuat laporan tanpa akun dan menjaga anonimitas.
- Tim pendamping kampus, termasuk Admin Satgas PPKS dan Konselor ULBK, yang menangani laporan atau dukungan lanjutan sesuai peran.

## Product Purpose

PELITA (Platform Edukasi dan Laporan Terenkripsi Anonim) adalah prototipe web untuk pelaporan kekerasan seksual dan perundungan di kampus UNY. Produk ini memungkinkan pelaporan anonim dan akses ke dukungan lanjutan. Keberhasilan produk berpusat pada keselamatan dan anonimitas pelapor.

## Positioning

Pelapor dapat membuat laporan tanpa akun, lalu menggunakan tiket unik untuk memeriksa status dan berkomunikasi dua arah secara anonim dengan tim penanganan. Data laporan dan bukti dilindungi dengan enkripsi sisi server saat tersimpan; ini bukan enkripsi end-to-end.

## Operating Context

Produk dibuat sebagai prototipe/MVP responsif untuk demonstrasi tugas Team Based Project di mata kuliah Pendidikan dan Pembangunan Berkelanjutan. Konteks institusionalnya adalah kampus UNY dan layanan Satgas PPKS serta ULBK. Bahasa antarmuka adalah Bahasa Indonesia.

## Capabilities and Constraints

- Cakupan yang direncanakan mencakup pelaporan tanpa akun melalui tiket unik, cek status dan komunikasi anonim, dukungan konseling, serta edukasi. Peran admin dan konselor memiliki akses sesuai otorisasi.
- Keselamatan dan anonimitas pelapor didahulukan daripada kemudahan; data pribadi dikumpulkan seminimal mungkin.
- Produk adalah aplikasi web, bukan aplikasi native. Enkripsi prototipe adalah server-side encryption at rest, bukan end-to-end encryption.
- Nomor kontak darurat, alamat, nama pejabat, koordinat, dan fakta institusional lain yang belum diberikan tim tidak boleh dibuat-buat; gunakan `ISI_OLEH_TIM` sampai dikonfirmasi.
- Detail evaluasi keberhasilan dan kebutuhan aksesibilitas produk yang lebih spesifik belum dikonfirmasi.

## Brand Commitments

- Nama produk: PELITA — Platform Edukasi dan Laporan Terenkripsi Anonim.
- Antarmuka menggunakan Bahasa Indonesia.
- Suara produk harus empatik dan tidak menyalahkan atau menuntut detail berlebihan dari pelapor.

## Evidence on Hand

- `docs/PELITA_TECHNICAL_DESIGN.md` adalah sumber spesifikasi teknis dan fitur proyek.
- Proyek ini adalah prototipe untuk demo kuliah, bukan bukti bahwa layanan telah dioperasikan secara resmi oleh UNY.
- Kontak darurat dan alamat layanan resmi harus diisi dan diverifikasi oleh tim; jangan mengarangnya.

## Product Principles

1. Keselamatan dan anonimitas pelapor di atas segalanya.
2. Simpan data sesedikit mungkin dan hanya bila diperlukan.
3. Gunakan bahasa yang empatik dan tidak menghakimi.
4. Batasi akses tim penanganan sesuai peran dan kebutuhan tugas.
