# PELITA — Rancangan Teknis (Technical Design Document)

> **Untuk AI agent:** Dokumen ini adalah sumber kebenaran tunggal untuk membangun PELITA. Baca seluruh dokumen sebelum menulis kode. Kerjakan berurutan sesuai **Bagian 13 (Fase Pengerjaan)**, centang checklist setelah selesai, dan jangan membangun fitur di luar **Bagian 12 (Out of Scope)**. Jika ada hal yang ambigu, pilih opsi paling sederhana dan catat asumsinya di `docs/ASSUMPTIONS.md`.

---

## 1. Ringkasan Proyek

| Item | Isi |
|---|---|
| Nama | **PELITA** — Platform Edukasi dan Laporan Terenkripsi Anonim |
| Tujuan | Web pelaporan kekerasan seksual & perundungan di kampus UNY yang anonim, aman, dua arah dengan Satgas PPKS & ULBK, dilengkapi edukasi dan peta titik rawan |
| Konteks | Tugas Team Based Project, mata kuliah Pendidikan dan Pembangunan Berkelanjutan (SDG 16 utama, SDG 5 & 11 sekunder) |
| Jenis produk | Aplikasi web responsif (bukan native app) — **prototipe/MVP untuk demo kuliah** |
| Bahasa antarmuka | Bahasa Indonesia |
| Rujukan regulasi | Keputusan Rektor UNY No. 187.2/0634/1/2024 tentang Satgas PPKS |

### Prinsip desain (urutan prioritas)
1. **Keselamatan & anonimitas pelapor di atas segalanya.** Jika ada konflik antara kemudahan dan anonimitas, anonimitas menang.
2. **Kolektif minimal:** simpan data seminimal mungkin. Jangan menyimpan yang tidak dibutuhkan.
3. **Sederhana & bisa didemokan** dalam 4 minggu oleh mahasiswa.
4. **Ramah korban:** bahasa empatik, tidak menghakimi, tidak menuntut detail berlebihan.

---

## 2. Peran Pengguna

| Peran | Autentikasi | Kemampuan |
|---|---|---|
| **Pelapor (korban/saksi)** | **Tanpa akun.** Hanya memakai *Unique Ticket* | Buat laporan, unggah bukti, cek status, chat dengan admin, booking konseling, baca edukasi, pakai chatbot, lihat peta |
| **Admin Satgas PPKS** | Email + password + (opsional) TOTP 2FA | Lihat & verifikasi laporan, buka bukti, balas chat, ubah status, kelola artikel & titik rawan, lihat statistik |
| **Konselor ULBK** | Sama seperti admin | Kelola slot konseling, lihat permintaan konseling, balas chat pada kasus yang ditugaskan |
| **Super Admin** | Sama seperti admin | Kelola akun admin/konselor, lihat audit log |

---

## 3. Daftar Fitur (Functional Requirements)

> Tabel FR di PRD masih kosong; pemetaan berikut diturunkan dari daftar fitur di dokumen Team Based Project. Tim boleh mengubahnya, tetapi urutan prioritas tetap dipakai agent.

| Kode | Fitur | Pengguna | Prioritas |
|---|---|---|---|
| FR-01 | Form pelaporan anonim + penerbitan Unique Ticket | Pelapor | **P0** |
| FR-02 | Brankas bukti digital terenkripsi + penghapusan metadata | Pelapor | **P0** |
| FR-03 | Cek status & chat anonim dua arah via tiket | Pelapor, Admin | **P0** |
| FR-04 | Dashboard admin (daftar laporan, verifikasi, ubah status, balas) | Admin | **P0** |
| FR-05 | Landing page / dashboard utama + Quick Exit | Semua | **P0** |
| FR-06 | Konsultasi ULBK (booking slot konseling anonim) | Pelapor, Konselor | **P1** |
| FR-07 | Chatbot darurat (FAQ & kontak darurat, berbasis aturan) | Semua | **P1** |
| FR-08 | Statistik laporan per semester (agregat, tanpa data pribadi) | Admin | **P1** |
| FR-09 | Halaman edukasi/artikel + modul Bystander Intervention | Semua | **P2** |
| FR-10 | Peta titik rawan kampus (Leaflet/OSM) | Semua, Admin | **P2** |

---

## 4. Tech Stack

| Lapisan | Pilihan | Alasan |
|---|---|---|
| Framework | **Next.js 14+ (App Router) + TypeScript** | Fullstack satu repo, mudah di-deploy |
| UI | **Tailwind CSS** + komponen shadcn/ui | Cepat, responsif |
| Database | **PostgreSQL 15+** | Relasional, andal |
| ORM | **Prisma** | Skema jelas, migrasi mudah |
| Validasi | **Zod** | Validasi input di server |
| Password admin | **argon2** (`argon2` npm) | Hash password modern |
| Enkripsi | **Node `crypto` — AES-256-GCM** | Bawaan, tanpa dependensi |
| Hash tiket | **HMAC-SHA256** dengan `TICKET_PEPPER` | Tiket berentropi tinggi, cukup cepat dan aman |
| Strip metadata gambar | **sharp** (re-encode tanpa EXIF) | Hapus GPS/EXIF |
| Sesi admin | Cookie `httpOnly`, `secure`, `sameSite=strict` berisi JWT (`jose`) | Sederhana |
| 2FA (opsional) | `otplib` (TOTP) | Peningkatan keamanan admin |
| Real-time chat | **Polling tiap 5–10 detik** | Jauh lebih sederhana daripada WebSocket untuk MVP |
| Peta | **Leaflet + OpenStreetMap** | Gratis, tanpa API key |
| Rate limit | In-memory/`@upstash/ratelimit` opsional; **kunci = hash IP + salt harian, tidak disimpan ke DB** | Anti-spam tanpa menyimpan IP |
| Penyimpanan file | Folder lokal terenkripsi (`/storage/evidence`) di luar `public/` | Cukup untuk prototipe |
| Deploy | Docker Compose (app + postgres) atau VPS/Railway | Pilih yang termudah |
| Test | Vitest (unit), Playwright (E2E minimal) | Verifikasi alur inti |

> **Catatan jujur untuk laporan kuliah:** enkripsi pada prototipe ini adalah *server-side encryption at rest*, bukan *end-to-end encryption*. Admin yang berwenang tetap dapat membaca isi laporan. Cantumkan sebagai batasan di dokumentasi.

---

## 5. Arsitektur

```
Browser (Pelapor/Admin)
        │  HTTPS
        ▼
Next.js App (App Router)
 ├─ app/(public)/…        halaman publik (tanpa login)
 ├─ app/(admin)/admin/…   halaman admin (butuh sesi)
 ├─ app/api/…             Route Handlers (REST/JSON)
 ├─ lib/crypto.ts         AES-256-GCM, HMAC tiket
 ├─ lib/storage.ts        simpan/baca bukti terenkripsi
 ├─ lib/auth.ts           sesi admin
 └─ lib/ratelimit.ts      rate limit tanpa simpan IP
        │
        ├──► PostgreSQL (Prisma)
        └──► Filesystem /storage/evidence (blob terenkripsi)
```

### Struktur folder

```
pelita/
├─ prisma/
│  ├─ schema.prisma
│  └─ seed.ts
├─ src/
│  ├─ app/
│  │  ├─ (public)/
│  │  │  ├─ page.tsx                 # landing / dashboard utama
│  │  │  ├─ lapor/page.tsx           # form pelaporan
│  │  │  ├─ lapor/berhasil/page.tsx  # tampilkan tiket (sekali)
│  │  │  ├─ status/page.tsx          # input tiket → status & chat
│  │  │  ├─ konseling/page.tsx
│  │  │  ├─ edukasi/page.tsx
│  │  │  ├─ edukasi/[slug]/page.tsx
│  │  │  ├─ peta/page.tsx
│  │  │  └─ darurat/page.tsx         # kontak darurat statis
│  │  ├─ (admin)/admin/
│  │  │  ├─ login/page.tsx
│  │  │  ├─ page.tsx                 # ringkasan & statistik
│  │  │  ├─ laporan/page.tsx
│  │  │  ├─ laporan/[id]/page.tsx    # detail + bukti + chat
│  │  │  ├─ konseling/page.tsx
│  │  │  ├─ artikel/page.tsx
│  │  │  ├─ titik-rawan/page.tsx
│  │  │  └─ pengguna/page.tsx        # super admin
│  │  └─ api/ …                      # lihat Bagian 8
│  ├─ components/
│  │  ├─ QuickExitButton.tsx
│  │  ├─ ChatbotWidget.tsx
│  │  ├─ ChatThread.tsx
│  │  ├─ EvidenceUploader.tsx
│  │  └─ ui/ …
│  ├─ lib/
│  │  ├─ crypto.ts
│  │  ├─ storage.ts
│  │  ├─ ticket.ts
│  │  ├─ auth.ts
│  │  ├─ ratelimit.ts
│  │  ├─ validators.ts               # skema Zod
│  │  ├─ chatbot.ts
│  │  └─ db.ts
│  └─ data/
│     ├─ faq.json                    # basis pengetahuan chatbot
│     └─ emergency-contacts.json     # DIISI TIM, jangan dikarang agent
├─ storage/evidence/                 # .gitignore
├─ docs/ASSUMPTIONS.md
├─ .env.example
├─ docker-compose.yml
└─ README.md
```

---

## 6. Model Data (Prisma)

```prisma
datasource db { provider = "postgresql"; url = env("DATABASE_URL") }
generator client { provider = "prisma-client-js" }

enum ReporterRole   { KORBAN SAKSI }
enum ReportCategory { KEKERASAN_SEKSUAL PERUNDUNGAN KEKERASAN_FISIK LAINNYA }
enum ReportStatus   { DITERIMA DIVERIFIKASI DALAM_PENANGANAN SELESAI DITOLAK }
enum MessageSender  { PELAPOR ADMIN }
enum AdminRole      { SATGAS KONSELOR SUPER_ADMIN }
enum ModerationStatus { PENDING APPROVED REJECTED }

model Report {
  id            String         @id @default(cuid())
  ticketHash    String         @unique          // HMAC(ticket), BUKAN tiket asli
  reporterRole  ReporterRole
  category      ReportCategory
  incidentDate  DateTime?
  locationText  String?                         // lokasi kejadian (teks bebas)
  descEnc       Bytes                           // deskripsi terenkripsi
  descIv        Bytes
  descTag       Bytes
  status        ReportStatus   @default(DITERIMA)
  assignedToId  String?
  assignedTo    Admin?         @relation(fields: [assignedToId], references: [id])
  evidences     Evidence[]
  messages      Message[]
  createdAt     DateTime       @default(now())
  updatedAt     DateTime       @updatedAt
  // JANGAN tambahkan: ip, userAgent, email, nama, nim, telepon
}

model Evidence {
  id           String   @id @default(cuid())
  reportId     String
  report       Report   @relation(fields: [reportId], references: [id], onDelete: Cascade)
  storageKey   String   @unique                 // nama file acak di disk
  mimeType     String
  sizeBytes    Int
  iv           Bytes
  authTag      Bytes
  sha256       String                           // hash isi setelah metadata dibersihkan (bukti integritas)
  createdAt    DateTime @default(now())
}

model Message {
  id        String        @id @default(cuid())
  reportId  String
  report    Report        @relation(fields: [reportId], references: [id], onDelete: Cascade)
  sender    MessageSender
  adminId   String?
  bodyEnc   Bytes
  iv        Bytes
  tag       Bytes
  readAt    DateTime?
  createdAt DateTime      @default(now())
}

model Admin {
  id           String    @id @default(cuid())
  name         String
  email        String    @unique
  passwordHash String
  role         AdminRole
  totpSecret   String?
  active       Boolean   @default(true)
  reports      Report[]
  slots        CounselingSlot[]
  createdAt    DateTime  @default(now())
}

model CounselingSlot {
  id          String   @id @default(cuid())
  counselorId String
  counselor   Admin    @relation(fields: [counselorId], references: [id])
  startsAt    DateTime
  endsAt      DateTime
  mode        String   // "ONLINE" | "OFFLINE"
  booking     CounselingBooking?
}

model CounselingBooking {
  id            String   @id @default(cuid())
  slotId        String   @unique
  slot          CounselingSlot @relation(fields: [slotId], references: [id])
  bookingHash   String   @unique   // HMAC(kode booking)
  aliasName     String?            // nama panggilan opsional, BUKAN nama asli wajib
  contactEnc    Bytes?             // kontak opsional (WA/email) terenkripsi
  contactIv     Bytes?
  contactTag    Bytes?
  status        String   @default("DIJADWALKAN")
  createdAt     DateTime @default(now())
}

model HazardPoint {
  id          String           @id @default(cuid())
  lat         Float
  lng         Float
  category    String           // "GELAP", "SEPI", "PERNAH_TERJADI_INSIDEN", dst.
  description String
  status      ModerationStatus @default(PENDING)
  createdAt   DateTime         @default(now())
}

model Article {
  id        String   @id @default(cuid())
  slug      String   @unique
  title     String
  summary   String
  bodyMd    String
  category  String   // "BYSTANDER", "HUKUM", "PSIKOLOGIS", "UMUM"
  published Boolean  @default(false)
  createdAt DateTime @default(now())
}

model AuditLog {
  id        String   @id @default(cuid())
  adminId   String
  action    String   // "VIEW_REPORT","VIEW_EVIDENCE","CHANGE_STATUS","SEND_MESSAGE",...
  targetId  String?
  createdAt DateTime @default(now())
}
```

---

## 7. Desain Keamanan & Anonimitas (WAJIB)

### 7.1 Unique Ticket
- Format tampilan: `PLT-XXXX-XXXX-XXXX-XXXX` (16 karakter Base32 Crockford ≈ 80 bit entropi, dihasilkan dengan `crypto.randomBytes`).
- Tampilkan tiket **satu kali** di halaman `lapor/berhasil`. Sediakan tombol *Salin* dan *Unduh sebagai .txt*. Beri peringatan jelas: **tiket tidak dapat dipulihkan jika hilang**.
- Di DB hanya simpan `HMAC_SHA256(TICKET_PEPPER, tiket_normalisasi)`. Normalisasi: uppercase, hapus tanda `-` dan spasi.
- Pembatasan percobaan cek tiket: maks 10 percobaan/menit per kunci rate-limit; respons error selalu generik ("Tiket tidak ditemukan") dengan waktu respons konstan.

### 7.2 Enkripsi
- `lib/crypto.ts` menyediakan `encrypt(plaintext): {ciphertext, iv, tag}` dan `decrypt(...)` dengan **AES-256-GCM**, IV acak 12 byte per operasi.
- Kunci dari env `DATA_ENCRYPTION_KEY` (32 byte, base64). **Jangan hardcode.** Sediakan skrip `npm run gen:keys`.
- Yang dienkripsi: deskripsi laporan, isi pesan chat, isi file bukti, kontak konseling.
- File bukti: enkripsi streaming ke `storage/evidence/<storageKey>`; `storageKey` acak (`randomUUID`), tanpa nama file asli.

### 7.3 Bukti digital
- Whitelist MIME: `image/jpeg`, `image/png`, `image/webp`, `application/pdf`, `audio/mpeg`, `audio/mp4`, `video/mp4`. Maks **10 MB/file**, maks **5 file/laporan**. Validasi MIME dengan *magic bytes*, bukan hanya ekstensi.
- Gambar: **re-encode dengan `sharp`** untuk menghapus EXIF/GPS, lalu hitung `sha256` dari hasil akhir.
- PDF/audio/video: tolak jika tidak bisa dibersihkan metadatanya, **atau** terima dan beri catatan di UI bahwa metadata tidak dapat dihapus otomatis (pilih salah satu, catat di ASSUMPTIONS.md).
- Nama file asli **tidak disimpan**.
- Bukti hanya bisa diunduh admin lewat endpoint terproteksi yang mendekripsi saat stream; catat `VIEW_EVIDENCE` di audit log.

### 7.4 Larangan penyimpanan identitas
- **Dilarang** menyimpan: IP, User-Agent, header `Referer`, cookie pelacak, fingerprint, analytics pihak ketiga.
- Matikan access log yang memuat IP pada aplikasi/reverse proxy untuk rute `/api/reports*`, `/api/tickets*`.
- Rate limit memakai `HMAC(IP + salt_harian)` di memori saja; salt diganti tiap hari; tidak pernah ditulis ke DB/log.
- Jangan memakai Google Fonts/CDN eksternal/tracker di halaman pelapor (self-host font & aset).
- Tambahkan header: `Referrer-Policy: no-referrer`, `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, CSP ketat, `Cache-Control: no-store` untuk halaman & API pelapor.
- Cookie untuk pelapor: **tidak ada**. Seluruh state pelapor bergantung pada tiket yang dimasukkan (disimpan hanya di memori halaman).

### 7.5 Keamanan admin
- Password minimal 12 karakter, hash argon2id.
- Rate limit login: 5 gagal/15 menit/akun.
- Semua rute `/admin/*` dan `/api/admin/*` dicek sesi + peran (RBAC) di server. Konselor hanya melihat kasus yang ditugaskan kepadanya.
- Audit log setiap akses laporan/bukti dan perubahan status. Audit log **tidak boleh** memuat isi laporan.
- Validasi semua input dengan Zod; Prisma sudah memakai parameterized query; sanitasi Markdown artikel (mis. `rehype-sanitize`).
- Proteksi CSRF untuk endpoint admin yang mengubah data (cookie `sameSite=strict` + cek header `Origin`).

### 7.6 Safety UX
- **Quick Exit:** tombol tetap (fixed) di semua halaman publik dan tombol keyboard `Esc` ×2 → `window.location.replace("https://www.google.com")` dan bersihkan konten halaman sebelum redirect.
- Peringatan privasi di halaman lapor: sarankan memakai mode penyamaran/incognito dan menghapus riwayat.
- Judul tab dan favicon bersifat netral/tidak mencolok.
- Autosave draf form hanya di memori (jangan `localStorage`/cookie).

---

## 8. Spesifikasi API

Semua respons JSON `{ ok: boolean, data?, error? }`. Semua input divalidasi Zod. Prefiks `/api`.

### 8.1 Publik (tanpa autentikasi)

| Metode | Rute | Fungsi | Catatan |
|---|---|---|---|
| POST | `/reports` | Buat laporan (multipart: field + file bukti) | Mengembalikan `ticket` **sekali** |
| POST | `/tickets/lookup` | Body `{ticket}` → status laporan + daftar pesan | Rate-limited |
| POST | `/tickets/messages` | Body `{ticket, body}` → kirim pesan pelapor | |
| POST | `/tickets/evidence` | Tambah bukti ke laporan existing (multipart + ticket) | Batas total 5 file |
| GET | `/counseling/slots` | Daftar slot kosong (tanpa nama konselor sensitif) | |
| POST | `/counseling/book` | `{slotId, aliasName?, contact?}` → `bookingCode` (sekali) | |
| POST | `/counseling/lookup` | `{bookingCode}` → detail jadwal | |
| POST | `/chatbot` | `{message}` → `{reply, suggestions[]}` | Berbasis aturan (FAQ) |
| GET | `/articles` , `/articles/[slug]` | Artikel terbit | |
| GET | `/hazard-points` | Titik rawan berstatus APPROVED | |
| POST | `/hazard-points` | Usulan titik rawan baru (status PENDING) | Tanpa data pribadi |

### 8.2 Admin (butuh sesi + RBAC)

| Metode | Rute | Fungsi | Peran |
|---|---|---|---|
| POST | `/admin/auth/login` , `/admin/auth/logout` | Sesi | Semua |
| GET | `/admin/reports?status=&category=&q=` | Daftar laporan (tanpa isi deskripsi penuh) | SATGAS, SUPER |
| GET | `/admin/reports/[id]` | Detail (dekripsi deskripsi) + log audit | SATGAS, SUPER, KONSELOR (jika ditugaskan) |
| PATCH | `/admin/reports/[id]/status` | Ubah status | SATGAS, SUPER |
| PATCH | `/admin/reports/[id]/assign` | Tugaskan ke admin/konselor | SATGAS, SUPER |
| GET | `/admin/reports/[id]/evidence/[eid]` | Stream bukti terdekripsi | SATGAS, SUPER |
| POST | `/admin/reports/[id]/messages` | Balas pelapor | SATGAS, KONSELOR |
| GET/POST/PATCH/DELETE | `/admin/counseling/slots` | Kelola slot | KONSELOR, SUPER |
| GET | `/admin/counseling/bookings` | Lihat booking | KONSELOR, SUPER |
| GET/POST/PATCH/DELETE | `/admin/articles` | CRUD artikel | SATGAS, SUPER |
| GET/PATCH | `/admin/hazard-points` | Moderasi titik rawan | SATGAS, SUPER |
| GET | `/admin/stats?semester=` | Agregat: jumlah laporan per kategori/status/bulan, rata-rata waktu respons | SATGAS, SUPER |
| GET/POST/PATCH | `/admin/users` | Kelola akun admin | SUPER |
| GET | `/admin/audit-logs` | Audit | SUPER |

---

## 9. Spesifikasi Alur & Halaman

### 9.1 Alur Pelaporan (FR-01, FR-02)
1. Pelapor buka `/` → klik **Lapor Sekarang** → `/lapor`.
2. Halaman menampilkan pernyataan privasi singkat + pilihan peran (korban/saksi).
3. Form: kategori, tanggal kejadian (opsional), lokasi (teks, opsional), kronologi (textarea, wajib, min 20 karakter), unggah bukti (opsional, drag & drop, tampilkan notifikasi "metadata gambar akan dihapus otomatis").
4. Submit → server validasi, enkripsi, simpan, buat tiket.
5. Redirect ke `/lapor/berhasil` (tiket hanya ada di state respons, bukan di URL). Tampilkan tiket, salin/unduh, peringatan tiket tidak bisa dipulihkan, tautan ke `/status` dan `/konseling`.

### 9.2 Alur Cek Status & Chat (FR-03)
1. `/status` → input tiket.
2. Valid → tampilkan status (stepper: Diterima → Diverifikasi → Dalam Penanganan → Selesai), riwayat chat, kotak kirim pesan, tombol tambah bukti.
3. Polling pesan tiap 8 detik saat tab aktif.
4. Pesan admin ditandai "dibaca" ketika pelapor melihatnya.

### 9.3 Alur Konsultasi / Darurat (FR-06, FR-07)
- Chatbot melayani pertanyaan umum: cara lapor, apa itu tiket, kontak darurat, layanan ULBK, hak korban. Jika pesan memuat kata kunci bahaya (mis. "bunuh diri", "disiksa", "sekarang aman"), chatbot **langsung** menampilkan kontak darurat & saran menghubungi orang tepercaya/layanan darurat, bukan jawaban FAQ biasa.
- `/konseling`: daftar slot kosong → pilih → isi alias (opsional) dan kontak (opsional) → dapat **kode booking** (disimpan sebagai hash). Cek jadwal lewat kode booking.

### 9.4 Alur Admin (FR-04, FR-08)
1. Login → ringkasan (jumlah laporan baru, status, grafik per bulan/semester).
2. Daftar laporan dengan filter status/kategori, badge "baru".
3. Detail laporan: info, kronologi, bukti (unduh/pratinjau), tombol ubah status, tugaskan, thread chat balas.
4. Setiap aksi tercatat di audit log.
5. Halaman statistik semester + tombol **ekspor CSV agregat** (tanpa teks laporan).

### 9.5 Edukasi & Peta (FR-09, FR-10)
- `/edukasi`: daftar artikel dengan filter kategori; `/edukasi/[slug]` render Markdown. Seed minimal 4 artikel: Bystander Intervention (5D: Direct, Distract, Delegate, Delay, Document), mengenali bentuk kekerasan seksual, alur pelaporan di UNY, merawat diri setelah kejadian.
- `/peta`: peta Leaflet berpusat di kampus UNY (isi koordinat di `.env`/config oleh tim), marker titik rawan APPROVED, form usul titik rawan (klik peta → deskripsi). Titik rawan = lokasi umum, **tidak dikaitkan ke laporan tertentu**.

---

## 10. Persyaratan UI/UX

- Mobile-first, breakpoint minimal 360px; uji di HP dan laptop.
- Palet tenang (biru/teal lembut, kontras WCAG AA), tipografi mudah dibaca, tanpa gambar atau kata-kata yang memicu trauma.
- Bahasa: empatik, tidak menyalahkan ("Kamu tidak sendirian", bukan "Kamu harus…").
- Form tidak menuntut data berlebihan; semua kolom selain kronologi opsional.
- Aksesibilitas: label form, fokus terlihat, navigasi keyboard, `alt` pada gambar.
- Status loading & error jelas; jangan menampilkan stack trace.
- Komponen `QuickExitButton` ada di layout publik (bukan di setiap halaman satu per satu).

---

## 11. Konfigurasi & Environment

`.env.example`:

```
DATABASE_URL=postgresql://pelita:password@localhost:5432/pelita
DATA_ENCRYPTION_KEY=          # 32 byte base64 (npm run gen:keys)
TICKET_PEPPER=                # 32 byte base64
SESSION_SECRET=               # 32 byte base64
EVIDENCE_DIR=./storage/evidence
MAX_UPLOAD_MB=10
CAMPUS_MAP_LAT=               # diisi tim
CAMPUS_MAP_LNG=               # diisi tim
```

`data/emergency-contacts.json` **harus diisi tim dengan nomor/kanal resmi** (Satgas PPKS UNY, ULBK UNY, layanan darurat nasional). **Agent dilarang mengarang nomor telepon atau alamat.** Gunakan placeholder `"ISI_OLEH_TIM"` hingga diisi.

Seed (`prisma/seed.ts`): 1 super admin (password dari env sementara, wajib diganti), 2 akun demo (satgas, konselor), 4 artikel, beberapa slot konseling, 3 titik rawan contoh, **tanpa laporan palsu bernada sensitif**.

---

## 12. Out of Scope (Versi 1.0)

- Aplikasi native Android/iOS.
- End-to-end encryption sungguhan (client-side key).
- Integrasi SSO kampus / login mahasiswa.
- Notifikasi email/WhatsApp ke pelapor (karena menuntut kontak/identitas).
- Chatbot berbasis LLM (cukup berbasis aturan/FAQ; LLM hanya opsi lanjutan).
- Pembayaran, multi-kampus, multi-bahasa.
- Integrasi otomatis ke sistem hukum/aparat.
- Panggilan suara/video.

---

## 13. Fase Pengerjaan (Checklist untuk Agent)

Selaras dengan milestone PRD (1–28 November 2026). Centang `[x]` saat selesai.

### Fase 0 — Setup (1–3 Nov)
- [x] Inisialisasi Next.js + TypeScript + Tailwind + shadcn/ui, ESLint, Prettier.
- [x] Setup Prisma + PostgreSQL (docker-compose), migrasi dari skema Bagian 6.
- [x] `lib/crypto.ts`, `lib/ticket.ts` + unit test (enkripsi round-trip, tiket valid/invalid, normalisasi).
- [x] `.env.example`, `npm run gen:keys`, header keamanan di `next.config`.
- [x] Layout publik + `QuickExitButton` + landing page (FR-05).

### Fase 1 — Inti Pelaporan (P0) (4–10 Nov)
- [x] `POST /api/reports` + form `/lapor` (FR-01).
- [x] Pipeline bukti: validasi magic bytes, sharp strip EXIF, hash, enkripsi, simpan (FR-02).
- [x] Halaman `/lapor/berhasil` (tiket sekali tampil, salin/unduh).
- [x] `POST /api/tickets/lookup`, `/tickets/messages`, `/tickets/evidence`, halaman `/status` + polling (FR-03).
- [x] Rate limit tanpa simpan IP.
- [x] Test: buat laporan → tiket → lookup → kirim pesan.

### Fase 2 — Admin (P0) (11–17 Nov)
- [x] Auth admin (argon2, sesi JWT cookie, RBAC, rate limit login).
- [x] Daftar laporan, detail, ubah status, tugaskan, balas chat, unduh bukti (FR-04).
- [x] Audit log.
- [x] Test RBAC: konselor tidak bisa membuka laporan yang tidak ditugaskan.

### Fase 3 — Layanan Pendukung (P1) (18–21 Nov)
- [x] Konseling: slot (admin) + booking (publik) + kode booking (FR-06).
- [x] Chatbot berbasis aturan + `faq.json` + deteksi kata kunci darurat (FR-07).
- [x] Statistik semester + ekspor CSV agregat (FR-08).

### Fase 4 — Edukasi & Peta (P2) (22–24 Nov)
- [x] CRUD artikel admin + halaman publik + seed 4 artikel (FR-09).
- [x] Peta Leaflet + usul & moderasi titik rawan (FR-10).

### Fase 5 — Pengujian, Hardening, Dokumentasi (25–28 Nov)
- [ ] Jalankan **Checklist Penerimaan (Bagian 14)**.
- [ ] E2E Playwright untuk 3 alur: lapor, cek status+chat, admin balas.
- [ ] Uji responsif HP/laptop dan uji aksesibilitas dasar (Lighthouse ≥ 90).
- [ ] README: cara instalasi, cara menjalankan, akun demo, batasan keamanan (Bagian 7 catatan jujur).
- [ ] Deploy demo + data seed.

> Jika waktu mepet, **pangkas dari bawah** (P2 dulu, lalu P1). P0 tidak boleh dikurangi.

---

## 14. Checklist Penerimaan (Acceptance Criteria)

**Anonimitas & keamanan**
- [ ] Tidak ada kolom/log yang menyimpan IP, User-Agent, nama, email, NIM, nomor telepon pelapor (periksa skema DB dan log aplikasi).
- [ ] Database tidak memuat tiket asli — hanya HMAC-nya.
- [ ] Deskripsi, pesan, dan file bukti di DB/disk **tidak terbaca** tanpa kunci (verifikasi dengan `SELECT` langsung dan `hexdump`).
- [ ] Foto uji dengan EXIF GPS: setelah diunggah dan diunduh admin, EXIF/GPS **tidak ada**.
- [ ] File dengan ekstensi `.jpg` tetapi isi bukan gambar ditolak.
- [ ] Respons gagal lookup tiket identik untuk semua tiket salah; rate limit aktif.
- [ ] Header keamanan (Bagian 7.4) hadir; tidak ada request ke domain pihak ketiga dari halaman pelapor.
- [ ] Akses `/api/admin/*` tanpa sesi → 401; peran salah → 403.
- [ ] Quick Exit bekerja (klik & `Esc` ×2) di semua halaman publik.

**Fungsional**
- [ ] Alur lapor → tiket → cek status → chat dua arah → status berubah ke SELESAI berjalan.
- [ ] Admin dapat memverifikasi, menugaskan, membalas, mengunduh bukti, dan melihat statistik.
- [ ] Booking konseling menghasilkan kode booking dan slot tidak bisa dipesan dua kali.
- [ ] Chatbot menjawab minimal 10 pertanyaan FAQ dan menampilkan kontak darurat untuk kata kunci bahaya.
- [ ] Artikel dan peta berfungsi; titik rawan PENDING tidak tampil publik.

**Kualitas**
- [ ] `npm run build`, `npm run lint`, `npm test` lulus tanpa error.
- [ ] Tampilan benar pada lebar 360px dan 1280px.

---

## 15. KPI Uji Coba (usulan, silakan sesuaikan)

> Bagian KPI di PRD belum diisi; berikut usulan terukur untuk prototipe.

| Indikator | Target |
|---|---|
| Waktu mengisi & mengirim laporan | ≤ 5 menit |
| Alur inti selesai tanpa bantuan (uji ≥ 10 mahasiswa) | ≥ 80% |
| Skor kenyamanan/keamanan persepsi (skala 1–5, survei uji coba) | ≥ 4,0 |
| Skor SUS (kegunaan) | ≥ 70 |
| Waktu muat halaman utama (4G) | ≤ 3 detik |
| Lighthouse Accessibility | ≥ 90 |
| Kasus uji keamanan Bagian 14 yang lulus | 100% |

---

## 16. Aturan Kerja untuk AI Agent

1. Kerjakan per fase; commit kecil dengan pesan jelas (`feat:`, `fix:`, `docs:`).
2. Jangan menambah dependensi pelacak/analytics. Setiap dependensi baru harus dibenarkan di `docs/ASSUMPTIONS.md`.
3. Jangan mengarang data nyata (nomor darurat, alamat, nama pejabat, statistik). Pakai placeholder bertanda `ISI_OLEH_TIM`.
4. Jangan pernah menulis rahasia (kunci, password) ke repo.
5. Jangan menyimpan atau me-log isi laporan/pesan ke console.
6. Setiap endpoint baru wajib: validasi Zod, penanganan error generik, dan (jika admin) cek RBAC + audit log.
7. Tulis test untuk logika keamanan (crypto, tiket, RBAC, upload).
8. Bila ragu antara dua pendekatan, pilih yang **lebih aman bagi pelapor**, lalu catat.
9. Setelah tiap fase, perbarui checklist di dokumen ini dan ringkas perubahan.
