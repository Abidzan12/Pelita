export const STATUS_LABELS: Record<string, string> = {
  DITERIMA: "Diterima",
  DIVERIFIKASI: "Diverifikasi",
  DALAM_PENANGANAN: "Dalam penanganan",
  SELESAI: "Selesai",
  DITOLAK: "Ditolak",
};

export const CATEGORY_LABELS: Record<string, string> = {
  KEKERASAN_SEKSUAL: "Kekerasan seksual",
  PERUNDUNGAN: "Perundungan",
  KEKERASAN_FISIK: "Kekerasan fisik",
  LAINNYA: "Lainnya",
};

export const REPORTER_ROLE_LABELS: Record<string, string> = {
  KORBAN: "Korban",
  SAKSI: "Saksi",
};

export const ADMIN_ROLE_LABELS: Record<string, string> = {
  SATGAS: "Satgas PPKS",
  KONSELOR: "Konselor ULBK",
  SUPER_ADMIN: "Super Admin",
};

export const ARTICLE_CATEGORY_LABELS: Record<string, string> = {
  BYSTANDER: "Bystander",
  HUKUM: "Hukum & prosedur",
  PSIKOLOGIS: "Psikologis",
  UMUM: "Umum",
};

export const HAZARD_CATEGORY_LABELS: Record<string, string> = {
  GELAP: "Penerangan minim",
  SEPI: "Sepi",
  PERNAH_TERJADI_INSIDEN: "Pernah terjadi insiden",
  LAINNYA: "Lainnya",
};

// Kategori titik hasil survei tim tidak memakai skema HazardPoint.
export const HAZARD_PLACE_LABELS: Record<string, string> = {
  PARKIRAN: "Area parkir",
  KANTIN: "Kantin & foodcourt",
  GEDUNG: "Gedung & koridor",
};

export function hazardCategoryLabel(category: string): string {
  return HAZARD_CATEGORY_LABELS[category] ?? HAZARD_PLACE_LABELS[category] ?? category;
}

export const MODERATION_LABELS: Record<string, string> = {
  PENDING: "Menunggu moderasi",
  APPROVED: "Disetujui",
  REJECTED: "Ditolak",
};

export const BOOKING_STATUS_LABELS: Record<string, string> = {
  DIJADWALKAN: "Dijadwalkan",
  SELESAI: "Selesai",
  DIBATALKAN: "Dibatalkan",
};
