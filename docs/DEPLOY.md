# Deploy demo PELITA

Panduan singkat untuk menjalankan PELITA lewat Docker Compose di VPS atau laptop
untuk demo kuliah. Ini bukan panduan produksi penuh.

## 1. Siapkan `.env`

```bash
cp .env.example .env
npm run gen:keys
```

Salin tiga kunci yang tercetak ke `.env`: `DATA_ENCRYPTION_KEY`, `TICKET_PEPPER`,
`SESSION_SECRET`. Isi juga `SEED_SUPER_ADMIN_EMAIL`, `SEED_SUPER_ADMIN_PASSWORD`,
dan `SEED_DEMO_PASSWORD` (minimal 12 karakter).

Set `APP_URL` ke alamat publik yang dipakai, misalnya `https://pelita.example.org`.
Nilai ini dipakai untuk pemeriksaan Origin (CSRF) pada endpoint admin. Jika memakai
port lain, ubah juga pemetaan port di `docker-compose.yml`.

Jika `POSTGRES_PASSWORD` diubah, pastikan `DATABASE_URL` untuk pengembangan lokal
juga memakai password yang sama.

## 2. Jalankan

```bash
docker compose up -d --build
docker compose exec app npx prisma db seed
```

Aplikasi tersedia di `http://localhost:3000`. Container `app` menjalankan
`prisma migrate deploy` otomatis saat start.

Akun demo dibuat oleh seed; lihat README. Ganti password demo sebelum demo publik.

## 3. Yang harus disimpan dan dijaga

- **Volume `pelita-db`**: seluruh data laporan terenkripsi dan hash tiket.
- **Volume `pelita-evidence`**: berkas bukti terenkripsi. Jangan pernah menaruhnya di
  dalam folder yang bisa diakses web.
- **`.env` dan tiga kunci**: tanpa `DATA_ENCRYPTION_KEY`, isi laporan dan bukti tidak
  dapat dibuka. Tanpa `TICKET_PEPPER`, tiket pelapor tidak dapat dicocokkan.
- **Backup**: salin database dan volume bukti secara terpisah dari kunci. Simpan kunci
  di tempat aman, bukan di repo.

## 4. Reverse proxy dan log

Letakkan aplikasi di belakang HTTPS (Caddy/Nginx). Contoh Nginx:

```nginx
server {
    listen 443 ssl;
    server_name pelita.example.org;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Jangan catat IP untuk rute pelapor dan tiket.
    location ~ ^/(api/reports|api/tickets) {
        access_log off;
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Aplikasi hanya memakai `X-Forwarded-For` untuk hash rate limit di memori; nilai
mentahnya tidak disimpan. Pastikan log reverse proxy untuk rute di atas dimatikan
agar IP pelapor tidak tercatat.

## 5. Memperbarui

```bash
git pull
docker compose up -d --build
```

Migrasi Prisma dijalankan otomatis oleh container `app`.

## Batasan prototipe

- Enkripsi adalah enkripsi di sisi server, bukan enkripsi ujung ke ujung.
- CSP masih mengizinkan skrip inline milik Next.js.
- Rate limit disimpan di memori per instance.
- Ubin peta dimuat dari OpenStreetMap hanya di halaman `/peta`.
- Login admin memakai sesi cookie 8 jam; 2FA tersedia di skema tetapi belum ada
  halaman pengaturan 2FA.
