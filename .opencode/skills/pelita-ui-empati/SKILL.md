---
name: pelita-ui-empati
description: Use when building or editing any PELITA user interface - pages, components, forms, chatbot, map, copywriting, layout, colors, typography. Ensures trauma-informed, victim-friendly, accessible, mobile-first UI in Indonesian that avoids the generic AI-generated look.
---

# UI PELITA: tenang, jelas, aman

Pengguna utama sedang takut, bingung, atau terluka, dan sering membuka web ini lewat HP dengan sembunyi-sembunyi. Antarmuka harus menenangkan, bukan memamerkan.

## Prinsip
1. **Satu hal per layar.** Satu tindakan utama yang jelas. Jangan membanjiri dengan pilihan.
2. **Tidak menuntut.** Hanya kronologi yang wajib. Semua lain ditandai "opsional". Jangan minta identitas.
3. **Tidak menghakimi.** Tidak ada kalimat yang menyiratkan pelapor harus membuktikan atau bertanggung jawab.
4. **Selalu ada jalan keluar.** `QuickExitButton` terlihat di layout publik; judul tab netral.
5. **Jujur tentang batasan.** Jelaskan kapan tiket tidak bisa dipulihkan, dan bahwa metadata file tertentu tidak bisa dihapus otomatis.

## Teks (Bahasa Indonesia)
- Nada hangat, tenang, kalimat pendek, sapaan "kamu".
- Bagus: "Kamu tidak sendirian. Ceritakan dengan caramu sendiri, kamu boleh berhenti kapan saja."
- Hindari: "Anda wajib mengisi seluruh data", "Laporan palsu akan dipidana" di halaman form, istilah hukum tanpa penjelasan, bahasa yang menyalahkan.
- Pesan error ramah dan jelas: apa yang terjadi dan apa yang bisa dilakukan berikutnya.
- Jangan memakai statistik yang menakut-nakuti sebagai hiasan halaman.

## Tampilan: hindari kesan "template AI"
Hindari: gradasi ungu-biru, glassmorphism, kartu fitur tiga kolom dengan ikon emoji, hero tengah dengan dua tombol, bayangan dan sudut membulat berlebihan di mana-mana, ilustrasi stok generik.
Arah yang dipakai:
- Latar netral hangat (putih gading/abu muda), satu warna aksen teal atau biru-hijau lembut, kontras teks memenuhi WCAG AA.
- Tata letak rata kiri, ruang napas lega, hierarki tipografi yang jelas.
- Font **self-hosted** (paket `@fontsource-*` yang dipasang lokal). Dilarang CDN font.
- Ikon fungsional (lucide), bukan hiasan. Tanpa gambar atau visual yang memicu trauma.
- Animasi minim, hormati `prefers-reduced-motion`, tidak ada autoplay.

## Formulir dan alur
- Label di atas input, bukan hanya placeholder. Tampilkan error di dekat field.
- Unggah bukti: jelaskan apa yang terjadi dengan berkas (metadata dihapus bila bisa), tampilkan ukuran dan jumlah maksimum.
- Halaman tiket: tampilkan sekali, tombol Salin dan Unduh .txt, peringatan jelas, tidak ada tiket di URL.
- Draf form hanya di memori, bukan `localStorage`.

## Teknis UI
- Mobile-first mulai 360px; area sentuh minimal 44px.
- Navigasi keyboard, fokus terlihat, `alt` pada gambar, `aria-live` untuk status chat dan error.
- Setiap komponen data punya state: loading, kosong, error, sukses.
- Chatbot: sapaan singkat, jawaban pendek, kontak darurat selalu mudah dijangkau, tidak berpura-pura menjadi konselor.

## Daftar periksa
- [ ] Bisa dipakai nyaman di 360px dan 1280px
- [ ] Hanya satu tindakan utama per layar
- [ ] Tidak ada permintaan identitas yang tidak perlu
- [ ] Teks hangat dan tidak menghakimi
- [ ] Tidak ada aset atau skrip dari domain luar
- [ ] Tidak terlihat seperti template generik
