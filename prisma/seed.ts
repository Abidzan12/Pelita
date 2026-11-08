import { AdminRole, ModerationStatus, PrismaClient } from "@prisma/client";
import argon2 from "argon2";

const prisma = new PrismaClient();

const articles = [
  {
    slug: "lima-langkah-menjadi-saksi-aman",
    title: "Lima langkah aman menjadi saksi (5D)",
    summary:
      "Cara mengambil tindakan saat melihat kekerasan tanpa menempatkan dirimu atau korban dalam bahaya.",
    category: "BYSTANDER",
    bodyMd: `# Lima langkah aman menjadi saksi

Sebagai saksi, kamu tidak harus menghadapi pelaku sendirian. Pilih langkah yang paling aman untuk situasi itu. Kalau ragu, utamakan keselamatanmu dan korban.

## 1. Direct
Sapa korban atau alihkan percakapan dengan tenang, misalnya menanyakan hal sederhana. Jangan menantang pelaku bila itu berisiko.

## 2. Distract
Ciptakan pengalihan: menjatuhkan sesuatu, bertanya arah, atau memanggil nama korban seolah kamu mengenalnya. Tujuannya memutus situasi, bukan mempermalukan siapa pun.

## 3. Delegate
Minta bantuan orang lain: teman terdekat, petugas keamanan, atau orang dewasa yang dipercaya. Kamu tidak harus menjadi pahlawan sendirian.

## 4. Delay
Setelah kejadian, temani korban dan tanyakan apa yang dia butuhkan. Jangan mendesak untuk melapor atau menceritakan detail.

## 5. Document
Dokumentasi hanya jika aman dan tidak melanggar privasi korban. Jangan menyebarkan foto, video, atau identitas korban. Simpan bukti untuk diserahkan kepada pihak berwenang bila korban setuju.

Ingat: keselamatanmu juga penting. Tindakan kecil yang aman tetap berarti.`,
  },
  {
    slug: "mengenali-bentuk-kekerasan-seksual",
    title: "Mengenali bentuk kekerasan seksual",
    summary:
      "Kekerasan seksual tidak selalu berupa kontak fisik. Mengenali bentuknya membantu memahami bahwa itu bukan salahmu.",
    category: "UMUM",
    bodyMd: `# Mengenali bentuk kekerasan seksual

Kekerasan seksual adalah tindakan bernuansa seksual yang dilakukan tanpa persetujuan. Persetujuan harus diberikan dengan sadar, bebas, dan bisa dicabut kapan saja.

Bentuknya dapat meliputi:

- ucapan, siulan, atau komentar bernuansa seksual yang tidak diinginkan;
- menyentuh atau meraba tanpa izin;
- memaksa atau membujuk dengan tekanan untuk melakukan aktivitas seksual;
- mengirim atau menyebarkan konten seksual tanpa persetujuan;
- mengancam atau memeras dengan konten intim;
- memperlihatkan bagian tubuh atau konten seksual secara paksa.

Kekerasan seksual dapat terjadi pada siapa saja, termasuk laki-laki, dan pelakunya bisa orang yang dikenal atau dipercaya.

**Ini bukan salahmu.** Kamu tidak perlu membuktikan bahwa kamu sudah melawan atau menolak dengan cara tertentu. Kamu berhak mendapat dukungan dan memilih langkah yang paling aman bagimu.`,
  },
  {
    slug: "alur-pelaporan-di-lingkungan-kampus",
    title: "Alur pelaporan di lingkungan kampus",
    summary:
      "Langkah umum untuk melapor ke Satgas PPKS, menyimpan bukti, dan menjaga tiket laporan.",
    category: "HUKUM",
    bodyMd: `# Alur pelaporan di lingkungan kampus

Setiap kampus memiliki mekanisme dan kanal resmi sendiri. Di UNY, pelaporan kekerasan seksual dan perundungan dapat diarahkan ke Satgas PPKS melalui kanal resmi yang tercantum di halaman Kontak Darurat. Prosedur dan tenggat resmi mengikuti kebijakan kampus, bukan halaman ini.

## Langkah umum

1. **Catat apa yang kamu ingat.** Tulis kronologi dengan kata-katamu sendiri. Kamu tidak perlu detail yang tidak kamu ingat.
2. **Simpan bukti bila aman.** Screenshot, foto, atau rekaman dapat membantu. Jangan menyebarkannya ke publik.
3. **Pilih kanal yang nyaman.** Kamu bisa memakai Pelita untuk laporan anonim atau menghubungi kanal resmi kampus secara langsung.
4. **Simpan tiket.** Jika memakai Pelita, tiket adalah satu-satunya kunci untuk membuka laporan dan chat.
5. **Akses dukungan.** Konseling ULBK dapat membantu tanpa menuntut kamu melapor lebih dulu.

Kamu boleh berhenti kapan saja, bertanya lebih dulu, atau meminta didampingi orang yang kamu percaya. Keputusan tentang langkah hukum tetap ada di tanganmu.`,
  },
  {
    slug: "merawat-diri-setelah-kejadian",
    title: "Merawat diri setelah kejadian",
    summary:
      "Hal kecil yang bisa membantu saat pikiran dan tubuh masih terasa tidak aman.",
    category: "PSIKOLOGIS",
    bodyMd: `# Merawat diri setelah kejadian

Reaksi setelah kejadian bisa berbeda pada setiap orang: syok, marah, mati rasa, sulit tidur, atau merasa bersalah. Tidak ada reaksi yang "salah".

## Hal yang mungkin membantu

- **Kembali ke saat ini.** Sadari lima benda yang bisa kamu lihat, empat yang bisa kamu sentuh, dan tiga suara di sekitarmu.
- **Hubungi satu orang yang kamu percaya.** Kamu tidak harus menceritakan semuanya; cukup bilang kamu butuh ditemani.
- **Jaga kebutuhan dasar.** Minum air, makan, dan istirahat bila memungkinkan.
- **Batasi paparan.** Kamu boleh menjauh dari percakapan atau konten yang membuatmu tidak aman.
- **Cari bantuan profesional.** Konselor kampus atau layanan kesehatan dapat membantu. Kamu berhak bertanya tentang kerahasiaannya lebih dulu.

Kalau kamu berada dalam bahaya sekarang atau memiliki pikiran untuk menyakiti diri, hubungi layanan darurat setempat atau orang yang bisa menemanimu. Jangan menunggu balasan chat.

Kamu tidak harus melewati semuanya sendirian.`,
  },
] as const;

function required(name: string): string {
  const value = process.env[name];
  if (!value || value === "ISI_OLEH_TIM") {
    throw new Error(`${name} belum diisi. Isi di .env sebelum menjalankan seed.`);
  }
  return value;
}

async function main() {
  const superEmail = required("SEED_SUPER_ADMIN_EMAIL").toLowerCase();
  const superPassword = required("SEED_SUPER_ADMIN_PASSWORD");
  const demoPassword = required("SEED_DEMO_PASSWORD");

  if (superPassword.length < 12 || demoPassword.length < 12) {
    throw new Error("Password seed minimal 12 karakter.");
  }

  const superHash = await argon2.hash(superPassword, { type: argon2.argon2id });
  const demoHash = await argon2.hash(demoPassword, { type: argon2.argon2id });

  await prisma.admin.upsert({
    where: { email: superEmail },
    update: {},
    create: {
      name: "Super Admin Demo",
      email: superEmail,
      passwordHash: superHash,
      role: AdminRole.SUPER_ADMIN,
    },
  });

  await prisma.admin.upsert({
    where: { email: "satgas.demo@pelita.local" },
    update: { passwordHash: demoHash, active: true },
    create: {
      name: "Satgas Demo",
      email: "satgas.demo@pelita.local",
      passwordHash: demoHash,
      role: AdminRole.SATGAS,
    },
  });

  const counselor = await prisma.admin.upsert({
    where: { email: "konselor.demo@pelita.local" },
    update: { passwordHash: demoHash, active: true },
    create: {
      name: "Konselor Demo",
      email: "konselor.demo@pelita.local",
      passwordHash: demoHash,
      role: AdminRole.KONSELOR,
    },
  });

  for (const article of articles) {
    await prisma.article.upsert({
      where: { slug: article.slug },
      update: {},
      create: { ...article, published: true },
    });
  }

  const now = new Date();
  const slots = [
    {
      startsAt: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 9, 0),
      endsAt: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 10, 0),
      mode: "ONLINE",
    },
    {
      startsAt: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 13, 0),
      endsAt: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 14, 0),
      mode: "OFFLINE",
    },
    {
      startsAt: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 2, 10, 0),
      endsAt: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 2, 11, 0),
      mode: "ONLINE",
    },
  ];

  for (const slot of slots) {
    const existing = await prisma.counselingSlot.findFirst({
      where: { counselorId: counselor.id, startsAt: slot.startsAt },
      select: { id: true },
    });
    if (!existing) {
      await prisma.counselingSlot.create({
        data: { ...slot, counselorId: counselor.id },
      });
    }
  }

  const lat = Number(process.env.CAMPUS_MAP_LAT);
  const lng = Number(process.env.CAMPUS_MAP_LNG);
  const hasCampusCoordinates =
    process.env.CAMPUS_MAP_LAT &&
    process.env.CAMPUS_MAP_LNG &&
    Number.isFinite(lat) &&
    Number.isFinite(lng);

  if (hasCampusCoordinates && (await prisma.hazardPoint.count()) === 0) {
    await prisma.hazardPoint.createMany({
      data: [
        {
          lat,
          lng,
          category: "GELAP",
          description: "Contoh data: area parkir dengan penerangan minim.",
          status: ModerationStatus.APPROVED,
        },
        {
          lat: lat + 0.0004,
          lng: lng + 0.0003,
          category: "SEPI",
          description: "Contoh data: jalur pejalan kaki yang sepi pada malam hari.",
          status: ModerationStatus.APPROVED,
        },
        {
          lat: lat - 0.0003,
          lng: lng + 0.0002,
          category: "PERNAH_TERJADI_INSIDEN",
          description: "Contoh data: titik yang perlu ditinjau moderasi.",
          status: ModerationStatus.PENDING,
        },
      ],
    });
  }

  console.log("Seed selesai: akun demo, artikel, dan slot konseling siap.");
  console.log(
    hasCampusCoordinates
      ? "Titik rawan contoh dibuat."
      : "Titik rawan dilewati karena koordinat kampus belum diisi.",
  );
}

main()
  .catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : "Seed gagal.");
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
