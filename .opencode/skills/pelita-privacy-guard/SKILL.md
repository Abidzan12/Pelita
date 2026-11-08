---
name: pelita-privacy-guard
description: Mandatory before writing or changing anything in PELITA that touches reports, tickets, evidence uploads, chat messages, counseling bookings, logging, error handling, database schema, API routes, cookies, analytics, fonts, or any third-party request. Protects the anonymity of reporters and survivors.
---

# Penjaga privasi PELITA

Pelapor datang dengan rasa takut identitasnya bocor. Satu baris log yang ceroboh bisa mematahkan janji anonimitas. Periksa setiap perubahan terhadap daftar ini.

## Dilarang disimpan, di-log, atau dikirim ke pihak lain
- IP address (termasuk `x-forwarded-for`, `x-real-ip`, `req.ip`, `remoteAddress`)
- User-Agent, header `Referer`, fingerprint perangkat
- Nama, email, NIM, nomor telepon pelapor (kecuali kontak konseling opsional yang dienkripsi)
- Isi laporan, isi pesan, nama file asli bukti, atau tiket asli di log, console, atau pesan error
- Cookie atau storage di sisi pelapor (`document.cookie`, `localStorage`, `sessionStorage`)

## Pola yang benar
- **Tiket:** dibuat dengan `crypto.randomBytes`, ditampilkan sekali, disimpan hanya sebagai `HMAC-SHA256(TICKET_PEPPER, tiket_ternormalisasi)`.
- **Data sensitif** (deskripsi, pesan, kontak, file bukti): dienkripsi dengan AES-256-GCM lewat `lib/crypto.ts`, IV acak baru untuk tiap operasi. Jangan menulis fungsi enkripsi baru di tempat lain.
- **Rate limit:** kunci dari hash IP + salt harian, hanya di memori, tidak pernah ditulis ke DB atau log.
- **Error ke pelapor:** selalu generik. "Tiket tidak ditemukan" harus identik untuk semua tiket salah, tanpa membedakan "format salah" dan "tidak ada".
- **Bukti:** cek magic bytes, batas ukuran, re-encode gambar dengan sharp untuk membuang EXIF/GPS, simpan dengan nama acak.
- **Admin:** cek sesi dan peran di server pada setiap rute, catat ke audit log tanpa isi laporan.

## Tanda bahaya (cari dan hentikan)
- `console.log(req)`, `console.log(body)`, `console.error(err)` pada rute pelapor yang bisa memuat data
- Prisma `log: ['query']` aktif (isi kueri masuk log)
- `next/font/google`, tag `<link>` ke CDN, Google Analytics, Vercel Analytics, Sentry dengan data request, widget pihak ketiga
- Tambahan kolom `ip`, `userAgent`, `email`, `name` pada tabel pelapor
- Tiket di URL, query string, atau title halaman
- Respons API yang membocorkan apakah suatu tiket ada lewat perbedaan pesan atau waktu respons
- Komentar `// TODO: encrypt later` atau data sementara tak terenkripsi

## Review diri sebelum selesai
1. Perubahan ini menambah data yang disimpan? Apakah benar-benar dibutuhkan?
2. Adakah jalur (log, error, header, URL) tempat data pelapor bisa bocor?
3. Adakah request keluar ke domain lain dari halaman pelapor?
4. Apakah penolakan dan error tetap generik?
Jika ada jawaban "ya/mungkin" yang tidak bisa dibenarkan, hentikan dan perbaiki dulu.
