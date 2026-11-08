---
name: pelita-workflow
description: Use at the start of any PELITA task and when planning, choosing the next piece of work, or finishing a feature. Enforces spec-driven development, one small vertical slice at a time, phase order from the technical design, and no scope creep.
---

# Alur kerja PELITA

## Langkah
1. **Baca spesifikasi.** Buka `docs/PELITA_TECHNICAL_DESIGN.md`: bagian fitur (FR-xx) yang relevan, skema, API, dan checklist fase yang sedang berjalan. Jangan mengandalkan ingatan.
2. **Pilih satu slice vertikal.** Satu slice = satu kemampuan utuh yang bisa dicoba: skema DB, lalu API, lalu UI, lalu test. Contoh: "pelapor mengirim laporan tanpa bukti dan menerima tiket". Bukan "bikin semua endpoint".
3. **Tulis rencana 3–6 baris** sebelum koding: FR yang dikerjakan, file yang akan dibuat/diubah, risiko privasi.
4. **Implementasi minimal** yang memenuhi spesifikasi. Tidak lebih.
5. **Verifikasi** dengan skill `pelita-verification`.
6. **Tutup slice:** centang item di checklist fase pada dokumen teknis, commit kecil (`feat:`, `fix:`, `docs:`, `test:`), ringkas apa yang berubah dan apa yang belum diuji.

## Urutan prioritas
P0 harus selesai dan stabil sebelum P1; P1 sebelum P2. Jika waktu mepet, pangkas dari P2.

## Batas
- Dilarang membangun yang ada di bagian Out of Scope.
- Dilarang refactor di luar slice yang sedang dikerjakan. Catat sebagai saran, jangan dikerjakan diam-diam.
- Dilarang menambah dependensi tanpa alasan tertulis di `docs/ASSUMPTIONS.md` (nama, fungsi, kenapa tidak cukup dengan yang ada, tidak melacak pengguna).

## Kapan berhenti dan bertanya ke tim
- Spesifikasi saling bertentangan, atau ada keputusan produk (bukan teknis) yang belum ditentukan.
- Fitur membutuhkan data nyata yang hanya tim punya (kontak darurat, koordinat kampus, kebijakan Satgas).
- Perubahan akan melemahkan anonimitas pelapor.
Untuk hal lain, ambil asumsi paling sederhana yang aman, catat di `docs/ASSUMPTIONS.md`, lanjutkan.

## Kriteria selesai satu slice
- Perilaku sesuai spesifikasi dan dicoba nyata (bukan hanya "kodenya terlihat benar").
- Test untuk logika yang penting sudah ada dan lulus.
- Lint dan build lulus.
- Checklist fase diperbarui; asumsi tercatat.
