# PELITA

Platform Edukasi dan Laporan Terenkripsi Anonim untuk melaporkan kekerasan seksual dan
perundungan di lingkungan kampus UNY. Dibuat sebagai prototipe tugas kuliah
(Pendidikan dan Pembangunan Berkelanjutan, SDG 16/5/11).

Dokumen sumber kebenaran ada di [`docs/PELITA_TECHNICAL_DESIGN.md`](docs/PELITA_TECHNICAL_DESIGN.md).
Keputusan yang tidak diatur di sana dicatat di [`docs/ASSUMPTIONS.md`](docs/ASSUMPTIONS.md).

## Status

Fase 0 (setup), Fase 1 (inti pelaporan P0), Fase 2 (panel admin P0), Fase 3
(layanan pendukung P1), dan Fase 4 (edukasi & peta P2) selesai: laporan anonim +
tiket, pipeline bukti terenkripsi, cek status, chat dua arah, autentikasi admin,
RBAC, audit log, konseling, chatbot berbasis aturan, statistik semester, artikel
Markdown tersanitasi, dan peta titik rawan. Fase 5 (pengujian & hardening) sedang
dikerjakan.

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

## Keamanan dan batasan jujur

- Enkripsi adalah **server-side encryption at rest** (AES-256-GCM), bukan enkripsi
  ujung ke ujung. Petugas berwenang tetap dapat membaca laporan.
- CSP saat ini mengizinkan skrip inline milik Next.js; nonce per-request direncanakan
  pada fase hardening.
- Rate limit disimpan di memori proses, bukan di database, dan tidak menyimpan IP.
- Jangan commit `.env`, kunci, atau isi `storage/evidence`.

## Data yang harus diisi tim

Nomor/kanal kontak darurat, koordinat kampus, dan akun seed memakai placeholder
`ISI_OLEH_TIM`. Jangan mengarang data resmi.
