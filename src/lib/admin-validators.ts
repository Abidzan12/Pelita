import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Format email tidak valid."),
  password: z.string().min(1, "Password wajib diisi.").max(200),
  totp: z
    .string()
    .trim()
    .regex(/^\d{6}$/, "Kode 2FA harus 6 angka.")
    .optional(),
});

export const reportStatusUpdateSchema = z.object({
  status: z.enum(["DITERIMA", "DIVERIFIKASI", "DALAM_PENANGANAN", "SELESAI", "DITOLAK"]),
});

export const reportAssignSchema = z.object({
  adminId: z.string().trim().min(1).nullable(),
});

export const adminMessageSchema = z.object({
  body: z
    .string()
    .trim()
    .min(1, "Pesan tidak boleh kosong.")
    .max(2000, "Pesan maksimal 2000 karakter."),
});

export const reportListQuerySchema = z.object({
  status: z
    .enum(["DITERIMA", "DIVERIFIKASI", "DALAM_PENANGANAN", "SELESAI", "DITOLAK"])
    .optional(),
  category: z
    .enum(["KEKERASAN_SEKSUAL", "PERUNDUNGAN", "KEKERASAN_FISIK", "LAINNYA"])
    .optional(),
  q: z.string().trim().max(100).optional(),
});

const dateTimeString = z
  .string()
  .trim()
  .refine((value) => !Number.isNaN(Date.parse(value)), "Tanggal tidak valid.");

export const counselingSlotCreateSchema = z.object({
  startsAt: dateTimeString,
  endsAt: dateTimeString,
  mode: z.enum(["ONLINE", "OFFLINE"]),
  counselorId: z.string().trim().min(1).optional(),
});

export const counselingSlotUpdateSchema = z.object({
  startsAt: dateTimeString,
  endsAt: dateTimeString,
  mode: z.enum(["ONLINE", "OFFLINE"]),
});

export const articleSchema = z.object({
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .min(3, "Slug minimal 3 karakter.")
    .max(80, "Slug maksimal 80 karakter.")
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug hanya boleh huruf kecil, angka, dan tanda hubung.",
    ),
  title: z.string().trim().min(3, "Judul minimal 3 karakter.").max(200),
  summary: z.string().trim().min(10, "Ringkasan minimal 10 karakter.").max(500),
  bodyMd: z.string().trim().min(20, "Isi artikel minimal 20 karakter.").max(20000),
  category: z.enum(["BYSTANDER", "HUKUM", "PSIKOLOGIS", "UMUM"]),
  published: z.boolean(),
});

export const hazardModerationSchema = z.object({
  status: z.enum(["PENDING", "APPROVED", "REJECTED"]),
});
