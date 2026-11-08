import { describe, expect, it } from "vitest";
import { createReportSchema, ticketMessageSchema } from "./validators";

describe("createReportSchema", () => {
  it("menerima laporan minimal", () => {
    const result = createReportSchema.safeParse({
      reporterRole: "KORBAN",
      category: "PERUNDUNGAN",
      description: "Saya mengalami perundungan berulang di kelas selama sebulan.",
    });
    expect(result.success).toBe(true);
  });

  it("menolak deskripsi yang terlalu pendek", () => {
    const result = createReportSchema.safeParse({
      reporterRole: "SAKSI",
      category: "LAINNYA",
      description: "pendek",
    });
    expect(result.success).toBe(false);
  });

  it("menolak kategori dan peran yang tidak dikenal", () => {
    const result = createReportSchema.safeParse({
      reporterRole: "ADMIN",
      category: "APA_SAJA",
      description: "Deskripsi yang cukup panjang untuk lolos validasi.",
    });
    expect(result.success).toBe(false);
  });

  it("menolak tanggal dengan format salah", () => {
    const result = createReportSchema.safeParse({
      reporterRole: "KORBAN",
      category: "PERUNDUNGAN",
      incidentDate: "08-11-2026",
      description: "Deskripsi yang cukup panjang untuk lolos validasi.",
    });
    expect(result.success).toBe(false);
  });

  it("menolak tanggal yang tidak ada di kalender", () => {
    const result = createReportSchema.safeParse({
      reporterRole: "KORBAN",
      category: "PERUNDUNGAN",
      incidentDate: "2026-02-31",
      description: "Deskripsi yang cukup panjang untuk lolos validasi.",
    });
    expect(result.success).toBe(false);
  });
});

describe("ticketMessageSchema", () => {
  it("menolak pesan kosong", () => {
    const result = ticketMessageSchema.safeParse({ ticket: "PLT-ABCD", body: "   " });
    expect(result.success).toBe(false);
  });
});
