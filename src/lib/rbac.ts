import type { AdminRole } from "@prisma/client";

export function canAccessReport(
  role: AdminRole,
  adminId: string,
  assignedToId: string | null,
): boolean {
  if (role === "SATGAS" || role === "SUPER_ADMIN") {
    return true;
  }
  return role === "KONSELOR" && assignedToId === adminId;
}

export function canManageReports(role: AdminRole): boolean {
  return role === "SATGAS" || role === "SUPER_ADMIN";
}
