import { describe, expect, it } from "vitest";
import { canAccessReport, canManageReports } from "./rbac";

describe("canAccessReport", () => {
  it("Satgas dan Super Admin dapat membuka semua laporan", () => {
    expect(canAccessReport("SATGAS", "a1", null)).toBe(true);
    expect(canAccessReport("SUPER_ADMIN", "a1", "a2")).toBe(true);
  });

  it("Konselor hanya dapat membuka laporan yang ditugaskan kepadanya", () => {
    expect(canAccessReport("KONSELOR", "a1", "a1")).toBe(true);
    expect(canAccessReport("KONSELOR", "a1", "a2")).toBe(false);
    expect(canAccessReport("KONSELOR", "a1", null)).toBe(false);
  });
});

describe("canManageReports", () => {
  it("hanya Satgas dan Super Admin yang dapat mengubah laporan", () => {
    expect(canManageReports("SATGAS")).toBe(true);
    expect(canManageReports("SUPER_ADMIN")).toBe(true);
    expect(canManageReports("KONSELOR")).toBe(false);
  });
});
