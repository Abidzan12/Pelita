---
name: pelita-verification
description: Use before declaring any PELITA task done, before committing, and at the end of each phase. Runs lint, build, tests, and privacy/security checks, then reports honestly what was verified and what was not.
---

# Verifikasi sebelum bilang "selesai"

Jangan percaya diri sendiri. Jalankan, lihat hasilnya, laporkan apa adanya.

## 1. Perintah wajib
```
npm run lint
npm run build
npm test
```
Jika ada yang gagal, perbaiki akar masalahnya. Jangan menonaktifkan test atau aturan lint agar lolos.

## 2. Pemeriksaan privasi cepat (jalankan dari root proyek)
```
grep -rniE "x-forwarded-for|x-real-ip|remoteAddress|req\.ip|user-agent" src/
grep -rniE "localStorage|sessionStorage|document\.cookie" src/
grep -rniE "fonts\.googleapis|fonts\.gstatic|next/font/google|googletagmanager|analytics" src/
grep -rnE "console\.(log|error|warn)" src/
grep -rniE "log:\s*\[.*query" src/ prisma/
```
Setiap temuan harus dibenarkan (mis. `x-forwarded-for` hanya untuk hash rate-limit di memori) atau dihapus. Periksa juga `prisma/schema.prisma`: tidak ada kolom `ip`, `userAgent`, `email`, `name`, `nim`, `phone` pada model pelapor.

## 3. Uji perilaku sesuai slice
- Jalankan alurnya sungguhan (dev server atau test E2E), bukan hanya membaca kode.
- Uji jalur gagal: input kosong, file tipe salah, tiket salah, sesi admin tidak ada, peran salah.
- Untuk upload: coba gambar ber-EXIF GPS lalu pastikan hasil akhir tanpa EXIF; coba file `.jpg` palsu dan pastikan ditolak.
- Untuk enkripsi: lihat langsung baris di DB dan file di disk, pastikan tidak terbaca tanpa kunci.
- Untuk admin: pastikan `/api/admin/*` tanpa sesi menghasilkan 401 dan peran salah 403.

## 4. Laporan penutup (wajib, jujur)
Tulis dalam format ini:

```
Selesai: <apa yang dikerjakan, FR terkait>
Diverifikasi: <perintah dan uji yang benar-benar dijalankan + hasilnya>
Belum diuji: <apa yang tidak sempat/bisa diuji dan alasannya>
Asumsi baru: <yang dicatat di docs/ASSUMPTIONS.md, atau "tidak ada">
Risiko privasi: <temuan atau "tidak ada yang ditemukan">
```
Dilarang menulis "semua berfungsi" tanpa daftar bukti. Jika ada yang tidak diuji, katakan.

## 5. Akhir fase
Jalankan **Checklist Penerimaan (Bagian 14)** di `docs/PELITA_TECHNICAL_DESIGN.md` untuk item yang relevan dengan fase itu dan lampirkan hasilnya.
