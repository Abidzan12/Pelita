---
name: pelita-no-slop
description: Use whenever writing, editing, or reviewing code in PELITA. Prevents generic AI-generated output - hallucinated APIs, fake placeholder data, over-engineering, empty error handling, noisy comments, unrequested refactors, and unverified claims of completion.
---

# Anti AI-slop

Tujuan: kode yang bisa dipertanggungjawabkan mahasiswa saat presentasi dan sidang, bukan kode yang hanya terlihat meyakinkan.

## 1. Jangan mengarang
- Sebelum memakai library, fungsi, atau opsi konfigurasi, pastikan ia ada: lihat `package.json`, tipe di `node_modules`, atau dokumentasi resmi. Versi Next.js, Prisma, dan sharp bisa berbeda dari yang kamu ingat.
- Jangan menulis nomor telepon, alamat, nama pejabat, statistik, atau tautan sebagai kenyataan. Pakai `ISI_OLEH_TIM`.
- Jangan menyatakan fitur "sudah berfungsi" jika belum dijalankan.

## 2. Sederhana, bukan sok canggih
- Jangan buat abstraksi (factory, repository, service layer, generic wrapper) sebelum ada tiga pemakaian nyata.
- Jangan menambah dependensi bila Node/Next/Prisma yang ada sudah cukup.
- Tidak ada file `utils.ts` atau `helpers.ts` sebagai tempat sampah. Beri nama sesuai domain: `ticket.ts`, `evidence-storage.ts`.
- Tidak ada kode mati, parameter tak terpakai, flag "untuk nanti", atau fitur spekulatif.

## 3. Error dan tipe yang jujur
- Dilarang `catch {}` kosong atau menelan error lalu mengembalikan sukses. Tangani, atau lempar ulang, atau kembalikan error yang benar.
- Dilarang `any`, `as unknown as X`, `@ts-ignore`, `eslint-disable` tanpa alasan satu baris di sampingnya.
- Validasi semua input dari luar dengan Zod; jangan mempercayai tipe dari klien.

## 4. Data dan konfigurasi
- Tidak ada lorem ipsum, "John Doe", angka karangan, atau `TODO` tanpa kejelasan di kode produksi. Data demo hanya di `prisma/seed.ts` dan harus bertanda jelas.
- Tidak ada nilai rahasia atau URL yang di-hardcode; gunakan `.env` dan perbarui `.env.example`.
- Mock hanya di dalam test.

## 5. Komentar dan gaya
- Komentar menjelaskan **mengapa**, bukan **apa**. Hapus komentar yang hanya mengulang kode.
- Tanpa emoji, banner ASCII, atau komentar dekoratif di kode.
- Penamaan konsisten dan spesifik: `Report`, `Ticket`, `Evidence`, bukan `data`, `item`, `handleStuff`.
- Ikuti gaya file di sekitarnya. Jangan memformat ulang seluruh file.

## 6. Diff yang disiplin
- Ubah hanya yang dibutuhkan slice ini. Tidak ada refactor atau rename "sekalian".
- Satu commit satu maksud. Pesan commit menjelaskan perubahan perilaku.

## Daftar periksa sebelum selesai
- [ ] Setiap import dan API yang kupakai benar-benar ada di versi yang terpasang
- [ ] Tidak ada data karangan, placeholder tersembunyi, atau error yang ditelan
- [ ] Tidak ada abstraksi atau dependensi yang tidak dibutuhkan
- [ ] Tidak ada perubahan di luar lingkup
- [ ] Aku bisa menjelaskan tiap bagian kode ini ke dosen tanpa membaca ulang
