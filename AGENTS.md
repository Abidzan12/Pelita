# PELITA — Aturan untuk Agent

PELITA adalah web pelaporan anonim kekerasan seksual & perundungan untuk kampus UNY (tugas kuliah, prototipe/MVP).
Pengguna web ini adalah penyintas dan saksi kekerasan. Kesalahan keamanan bukan sekadar bug: bisa membahayakan orang.

## Wajib sebelum mulai
1. Baca `docs/PELITA_TECHNICAL_DESIGN.md` (sumber kebenaran: fitur, skema, API, keamanan, fase).
2. Muat skill yang sesuai dengan tugas (tabel di bawah).
3. Kerjakan per fase dan per slice kecil. Jangan lompat fase, jangan menambah fitur di luar dokumen.

## Skill yang tersedia
| Skill | Muat ketika |
|---|---|
| `pelita-workflow` | Awal setiap tugas, saat merencanakan, memilih pekerjaan berikutnya, dan menyelesaikan fitur |
| `pelita-privacy-guard` | Menyentuh laporan, tiket, bukti, chat, logging, skema DB, API, cookie, aset eksternal |
| `pelita-no-slop` | Menulis atau me-review kode apa pun |
| `pelita-ui-empati` | Membuat atau mengubah halaman, komponen, teks UI |
| `pelita-verification` | Sebelum menyatakan tugas selesai, sebelum commit, di akhir fase |

## Aturan keras (tidak bisa ditawar)
- Jangan simpan atau log IP, User-Agent, nama, email, NIM, atau telepon pelapor.
- Jangan mengarang data nyata: nomor darurat, alamat, nama pejabat, statistik. Pakai `ISI_OLEH_TIM`.
- Jangan mengarang API, fungsi, atau versi library. Cek `package.json`, tipe di `node_modules`, atau dokumentasi resmi.
- Jangan menyatakan "selesai" atau "lolos" tanpa benar-benar menjalankan perintahnya.
- Jangan commit rahasia (`.env`, kunci, password).
- Bila dua pilihan setara, pilih yang lebih aman bagi pelapor, lalu catat di `docs/ASSUMPTIONS.md`.

## Perintah proyek
- `npm run dev` · `npm run lint` · `npm run build` · `npm test`
- `npm run gen:keys` membuat kunci enkripsi untuk `.env`

## Gaya komunikasi
- Balas ke tim dalam Bahasa Indonesia, ringkas, jujur tentang apa yang belum diuji.
- Teks antarmuka pengguna: Bahasa Indonesia yang hangat dan tidak menghakimi.
