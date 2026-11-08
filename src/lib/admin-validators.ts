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
