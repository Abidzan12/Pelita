---
name: PELITA
description: Poster mahasiswa untuk ruang aman, dukungan, dan pelaporan anonim.
colors:
  navy: "#122744"
  navy-support: "#163456"
  paper: "#f2ead9"
  paper-green: "#e6ede5"
  coral: "#ee8064"
  coral-deep: "#d3543d"
  coral-muted: "#b34e3c"
  highlight: "#f1c957"
  highlight-soft: "#f7dc85"
  highlight-deep: "#b38b31"
  warm-white: "#fff7e9"
  body-ink: "#183456"
  body-muted: "#465460"
  nav-muted: "#d9e3dc"
  support-muted: "#d1ddd7"
  footer-ink: "#e6e9de"
  footer-muted: "#c6d1cb"
  border-dark: "rgb(255 255 255 / 14%)"
  border-dark-soft: "rgb(255 255 255 / 9%)"
  border-light: "#c7c9ba"
  border-green: "#bfd0c7"
  paper-panel: "#f5f4e9"
  emergency: "#edc84f"
  footer: "#10233c"
  action-ink: "#132c47"
  action-hover: "#f5eddc"
  support-link: "#163f59"
  panel-paper: "#f5f4e9"
  footer-deep: "#10233c"
  emergency-field: "#edc84f"
  light-ink: "#f5eddc"
  process-border: "#c7c9ba"
  panel-border: "#bfd0c7"
  ink-action: "#132c47"
  white-9: "rgb(255 255 255 / 9%)"
  white-11: "rgb(255 255 255 / 11%)"
  white-24: "rgb(255 255 255 / 24%)"
  coral-12: "rgb(211 84 61 / 12%)"
  coral-15: "rgb(238 128 100 / 15%)"
  highlight-9: "rgb(241 201 87 / 9%)"
  highlight-24: "rgb(241 201 87 / 24%)"
typography:
  display:
    fontFamily: "Source Sans 3 Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(3rem, 7vw, 5.8rem)"
    fontWeight: 800
    lineHeight: 0.94
    letterSpacing: "-0.065em"
  body:
    fontFamily: "Source Sans 3 Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1rem"
    lineHeight: 1.625
  body-small:
    fontFamily: "Source Sans 3 Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "15px"
    lineHeight: 1.625
  label-small:
    fontFamily: "Source Sans 3 Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.8rem"
    lineHeight: 1.5
  label:
    fontFamily: "Source Sans 3 Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.72rem"
    fontWeight: 850
    letterSpacing: "0.17em"
  micro:
    fontFamily: "Source Sans 3 Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "9px"
    fontWeight: 800
  micro-mobile:
    fontFamily: "Source Sans 3 Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "7px"
    fontWeight: 800
  compact:
    fontFamily: "Source Sans 3 Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.75rem"
    lineHeight: 1.5
  action-label:
    fontFamily: "Source Sans 3 Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.9rem"
    fontWeight: 800
  section-title:
    fontFamily: "Source Sans 3 Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(2.3rem, 5vw, 4.2rem)"
    fontWeight: 850
    lineHeight: 1.02
rounded:
  sm: "3px"
  md: "6px"
  base: "8px"
spacing:
  xs: "8px"
  sm: "16px"
  md: "24px"
  lg: "40px"
  xl: "64px"
components:
  button-primary:
    backgroundColor: "{colors.highlight}"
    textColor: "{colors.navy}"
    rounded: "{rounded.sm}"
    height: "48px"
    padding: "0 24px"
---

# Design System: PELITA

## Overview

**Creative North Star: “Poster mahasiswa”**

PELITA menggunakan bahasa visual poster layanan mahasiswa: jelas, hangat, dan mudah dikenali tanpa menyerupai kanal resmi kampus yang belum dikonfirmasi. Bidang navy memberi tempat untuk pesan utama, sementara warna kertas krem dan aksen koral membentuk suasana yang bersahabat. Kuning dipakai sebagai sorot tindakan dan penanda penting.

Komposisi mengutamakan satu ajakan yang mudah ditemukan, lalu mengarahkan pengunjung ke langkah laporan, dukungan, informasi privasi, dan kontak bantuan. Ilustrasi dan logo dibuat lokal untuk menghindari aset eksternal. Nada visual mendukung keselamatan dan anonimitas, bukan urgensi pemasaran.

**Key Characteristics:**

- Headline besar dengan kontras kuat dan bahasa langsung.
- Palet kertas hangat, navy, koral, dan sorot kuning.
- Bentuk geometris ringkas dengan batas yang jelas.
- Responsif, rata kiri, dan menjaga Quick Exit tetap tersedia.

## Colors

Palet memadukan tinta navy dengan warna kertas dan aksen poster koral-kuning.

### Primary

- **Navy Poster** (#122744): bidang hero dan identitas header.
- **Koral Poster** (#ee8064): aksen hangat pada logo, garis, dan detail ilustrasi.
- **Kuning Sorot** (#f1c957): highlight dan tombol aksi utama.

### Secondary

- **Navy Dukungan** (#163456): bidang tautan dukungan dan footer.
- **Koral Dalam** (#d3543d): penanda dan garis pemisah yang kuat.

### Neutral

- **Kertas Krem** (#f2ead9): bidang konten edukasi dan proses.
- **Kertas Hijau Pucat** (#e6ede5): bidang privasi.
- **Putih Hangat** (#fff7e9): teks utama di atas bidang gelap.
- **Tinta Isi** (#183456): judul dan isi utama pada bidang terang.
- **Teks Sekunder** (#465460): paragraf penjelas di atas kertas.

## Typography

**Display Font:** Source Sans 3 Variable (fallback ui-sans-serif, system-ui, sans-serif)  
**Body Font:** Source Sans 3 Variable (fallback ui-sans-serif, system-ui, sans-serif)

**Character:** Sans-serif lokal dengan bentuk lugas dan mudah dibaca. Headline poster tebal dan rapat; teks isi tetap lebih longgar untuk membaca informasi sensitif dengan nyaman.

### Hierarchy

- **Display** (800, `clamp(3rem, 7vw, 5.8rem)`, 0.94): pesan utama hero.
- **Headline** (850, `clamp(2.3rem, 5vw, 4.2rem)`, 1.02): judul bagian.
- **Title** (700–800, 1.25–2rem): judul dukungan dan konten.
- **Body** (400, 1rem–1.25rem, 1.625): penjelasan dengan lebar baris dibatasi.
- **Label** (850, 0.72rem, tracking 0.17em, uppercase): penanda bagian yang singkat.

## Layout

Halaman publik memakai kontainer maksimum 72rem, padding horizontal 1.25rem di layar kecil, 2rem mulai breakpoint `sm`, dan 2.5rem di layar besar. Hero berubah menjadi dua kolom pada breakpoint `lg`, dengan salinan dan CTA di kiri serta ilustrasi di kanan. Daftar dukungan memakai dua kolom lalu menjadi satu kolom pada layar kecil. Bagian proses dan privasi memakai grid asimetris pada desktop dan alur satu kolom di mobile.

Gunakan ritme jarak 8/16/24/40/64px sebagai acuan yang diamati. Hindari lebar tetap untuk teks; pertahankan panjang baris nyaman dan pastikan tidak ada scroll horizontal.

## Elevation & Depth

Sistem ini datar secara default. Kedalaman datang dari bidang warna, batas tipis, pola titik berkontras rendah, dan lapisan bentuk geometris—bukan dari tumpukan kartu atau bayangan kabur. Tombol utama memiliki bayangan keras pendek sebagai detail poster tactile dan bergerak sedikit pada hover; hormati `prefers-reduced-motion`.

## Shapes

Bentuk utama geometris: bidang persegi, garis tegas, lingkaran stempel, dan potongan diagonal. Sudut umumnya kecil (3–8px); radius besar tidak menjadi bahasa dominan. Border penuh digunakan untuk memisahkan informasi, bukan garis dekoratif sepihak.

## Components

### Buttons

- **Shape:** tegas dan tactile; radius kecil (sekitar 3–6px).
- **Primary:** kuning sorot dengan teks navy, tinggi minimum 48px, padding horizontal sekitar 24px.
- **Hover / Focus:** hover memberi perubahan warna dan respons posisi yang kecil; fokus keyboard harus terlihat dengan ring yang jelas.
- **Secondary:** tautan teks putih hangat dengan aksen panah koral pada hero.

### Cards / Containers

- **Corner Style:** kecil dan konsisten, umumnya 3–8px.
- **Background:** bidang krem, hijau pucat, navy, atau putih hangat sesuai konteks.
- **Shadow Strategy:** tanpa bayangan dekoratif; pemisahan melalui warna dan border.
- **Border:** garis penuh dengan kontras cukup.
- **Internal Padding:** 16–40px berdasarkan kepentingan konten.

### Inputs / Fields

- **Style:** label jelas, latar terang, border penuh, radius kecil.
- **Focus:** indikator fokus keyboard kontras dan tidak tertutup elemen lain.
- **Error / Disabled:** pesan dekat field; status tidak hanya dibedakan dengan warna.

### Navigation

- **Style:** header navy dengan logo lokal, tautan navigasi putih kehijauan, dan tombol bantuan kuning.
- **Hover / Focus:** perubahan latar ringan dan fokus keyboard terlihat.
- **Mobile:** navigasi dapat membungkus ke baris berikutnya; kontrol tetap memiliki area sentuh minimum 44px.

### Ilustrasi poster

SVG lokal memakai bidang poster navy, sorot kertas krem, kuning, dan aksen koral. Ilustrasi memiliki judul dan deskripsi aksesibel, tanpa simbol resmi kampus.

## Do's and Don'ts

### Do:

- **Do** pertahankan urutan tindakan: mulai lapor atau cek tiket, lalu jalur dukungan.
- **Do** gunakan bahasa Indonesia yang hangat, singkat, dan tidak menghakimi.
- **Do** jaga kontras teks dan indikator fokus pada setiap bidang warna.
- **Do** pertahankan Quick Exit dan kontak bantuan yang sudah ada.
- **Do** gunakan gambar dan font lokal; deskripsikan gambar informatif dengan alt text.

### Don't:

- **Don't** menambah logo, lambang, statistik, kontak, atau klaim resmi yang belum diverifikasi tim.
- **Don't** gunakan warna atau animasi yang membuat halaman terasa mendesak atau mengancam.
- **Don't** simpan atau meminta identitas pelapor untuk memperindah alur.
- **Don't** memuat font, ilustrasi, atau skrip dari CDN/layanan pihak ketiga.
