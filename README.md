# PELITA

Platform Edukasi dan Laporan Terenkripsi Anonim untuk melaporkan kekerasan seksual dan
perundungan di lingkungan kampus UNY. Dibuat sebagai prototipe tugas kuliah
(Pendidikan dan Pembangunan Berkelanjutan, SDG 16/5/11).

Dokumen sumber kebenaran ada di [`docs/PELITA_TECHNICAL_DESIGN.md`](docs/PELITA_TECHNICAL_DESIGN.md).
Keputusan yang tidak diatur di sana dicatat di [`docs/ASSUMPTIONS.md`](docs/ASSUMPTIONS.md).

## Status

Fase 0 (setup), Fase 1 (inti pelaporan P0), Fase 2 (panel admin P0), Fase 3
(layanan pendukung P1), Fase 4 (edukasi & peta P2), dan Fase 5 (pengujian,
hardening, dokumentasi, deploy) selesai: laporan anonim + tiket, pipeline bukti
terenkripsi, cek status, chat dua arah, autentikasi admin, RBAC, audit log,
konseling, chatbot berbasis aturan, statistik semester, artikel Markdown
tersanitasi, dan peta titik rawan.

## Akun demo

Setelah `npm run db:seed`, akun berikut tersedia (password diambil dari
`SEED_DEMO_PASSWORD` di `.env`):

| Peran         | Email                        |
| ------------- | ---------------------------- |
| Super Admin   | `super.admin@pelita.local`   |
| Satgas PPKS   | `satgas.demo@pelita.local`   |
| Konselor ULBK | `konselor.demo@pelita.local` |

Ganti password demo sebelum deploy. Jangan memakai akun ini untuk data nyata.

## Stack

- Next.js 15 (App Router) + TypeScript + Tailwind CSS 4 + shadcn/ui
- PostgreSQL 16 + Prisma 6
- Zod, argon2, jose, sharp, otplib
- Vitest

## Menjalankan secara lokal

Prasyarat: Node.js 22+, npm, Docker.

```bash
npm install
cp .env.example .env
npm run gen:keys
# salin tiga kunci yang tercetak ke .env
docker compose up -d db
npm run db:migrate
npm run dev
```

Buka <http://localhost:3000>.

### Perintah

| Perintah                    | Fungsi                                                |
| --------------------------- | ----------------------------------------------------- |
| `npm run dev`               | Server pengembangan                                   |
| `npm run build`             | Build produksi                                        |
| `npm run lint`              | ESLint                                                |
| `npm test`                  | Unit test (Vitest)                                    |
| `npm run gen:keys`          | Membuat kunci enkripsi, pepper tiket, dan secret sesi |
| `npm run db:migrate`        | Migrasi Prisma                                        |
| `npm run db:seed`           | Seed data demo                                        |
| `npm run db:up` / `db:down` | Menyalakan/mematikan PostgreSQL                       |
| `npm test`                  | Unit test (Vitest)                                    |
| `npm run test:e2e`          | E2E Playwright (butuh database dan akun seed)         |

## Menjalankan dengan Docker (demo)

```bash
cp .env.example .env
npm run gen:keys
# isi tiga kunci dan akun seed di .env, lalu:
docker compose up -d --build
docker compose exec app npx prisma db seed
```

Aplikasi tersedia di <http://localhost:3000>. Panduan lengkap, termasuk reverse proxy
dan pengelolaan kunci, ada di [`docs/DEPLOY.md`](docs/DEPLOY.md).

## Pengujian

- Unit test: `npm test` (crypto, tiket, storage, validator, rate limit, RBAC,
  chatbot).
- E2E: `npm run test:e2e` menjalankan alur lapor, cek status + chat, balasan admin,
  Quick Exit, dan uji overflow 360px/1280px. Pastikan database sudah dimigrasi dan
  `npm run db:seed` sudah dijalankan.
- Hasil terakhir: 38 unit test lulus, 11 E2E lulus, Lighthouse Accessibility 100
  pada `/`, `/lapor`, `/konseling`, `/edukasi`, dan `/peta`.

## Keamanan dan batasan jujur

- Enkripsi adalah **server-side encryption at rest** (AES-256-GCM), bukan enkripsi
  ujung ke ujung. Petugas berwenang tetap dapat membaca laporan.
- CSP masih mengizinkan skrip inline milik Next.js; nonce per-request belum
  diterapkan pada prototipe ini.
- Rate limit disimpan di memori proses, bukan di database, dan tidak menyimpan IP.
- Jangan commit `.env`, kunci, atau isi `storage/evidence`.

## Data yang harus diisi tim

Nomor/kanal kontak darurat, koordinat kampus, dan akun seed memakai placeholder
`ISI_OLEH_TIM`. Jangan mengarang data resmi.
