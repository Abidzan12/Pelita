import { z } from "zod";

export const reporterRoleSchema = z.enum(["KORBAN", "SAKSI"]);

export const reportCategorySchema = z.enum([
  "KEKERASAN_SEKSUAL",
  "PERUNDUNGAN",
  "KEKERASAN_FISIK",
  "LAINNYA",
]);

export const createReportSchema = z.object({
  reporterRole: reporterRoleSchema,
  category: reportCategorySchema,
  incidentDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Format tanggal tidak valid.")
    .refine((value) => {
      const date = new Date(`${value}T00:00:00.000Z`);
      return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
    }, "Tanggal tidak valid.")
    .optional(),
  locationText: z.string().trim().max(200, "Lokasi maksimal 200 karakter.").optional(),
  description: z
    .string()
    .trim()
    .min(20, "Ceritakan sedikit lebih banyak, minimal 20 karakter.")
    .max(5000, "Kronologi maksimal 5000 karakter."),
});

export const ticketLookupSchema = z.object({
  ticket: z.string().trim().min(1).max(64),
});

export const ticketMessageSchema = z.object({
  ticket: z.string().trim().min(1).max(64),
  body: z
    .string()
    .trim()
    .min(1, "Pesan tidak boleh kosong.")
    .max(2000, "Pesan maksimal 2000 karakter."),
});

export const counselingBookingSchema = z.object({
  slotId: z.string().trim().min(1).max(64),
  aliasName: z.string().trim().max(50, "Nama panggilan maksimal 50 karakter.").optional(),
  contact: z.string().trim().max(200, "Kontak maksimal 200 karakter.").optional(),
});

export const counselingLookupSchema = z.object({
  bookingCode: z.string().trim().min(1).max(64),
});

export type CreateReportInput = z.infer<typeof createReportSchema>;

export function zodFieldErrors(error: z.ZodError): { field: string; message: string }[] {
  return error.issues.map((issue) => ({
    field: issue.path.join("."),
    message: issue.message,
  }));
}
