import type { AdminRole } from "@prisma/client";
import { NextResponse } from "next/server";
import { getCurrentAdmin, isSameOrigin, type SessionAdmin } from "./auth";

export function jsonError(error: string, status: number) {
  return NextResponse.json({ ok: false, error }, { status });
}

export async function requireAdmin(
  roles?: AdminRole[],
): Promise<{ admin: SessionAdmin } | { response: NextResponse }> {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return { response: jsonError("Tidak terautentikasi.", 401) };
  }
  if (roles && !roles.includes(admin.role)) {
    return { response: jsonError("Kamu tidak memiliki akses.", 403) };
  }
  return { admin };
}

export function rejectCrossOrigin(request: Request): NextResponse | null {
  if (!isSameOrigin(request)) {
    return jsonError("Permintaan ditolak.", 403);
  }
  return null;
}
