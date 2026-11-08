import { NextResponse } from "next/server";
import { jsonError, rejectCrossOrigin, requireAdmin } from "@/lib/admin-api";
import { reportAssignSchema } from "@/lib/admin-validators";
import { writeAuditLog } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const crossOrigin = rejectCrossOrigin(request);
  if (crossOrigin) {
    return crossOrigin;
  }

  const auth = await requireAdmin(["SATGAS", "SUPER_ADMIN"]);
  if ("response" in auth) {
    return auth.response;
  }

  const { id } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("Permintaan tidak valid.", 400);
  }

  const parsed = reportAssignSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError("Tujuan penugasan tidak valid.", 400);
  }

  try {
    const report = await prisma.report.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!report) {
      return jsonError("Laporan tidak ditemukan.", 404);
    }

    if (parsed.data.adminId) {
      const assignee = await prisma.admin.findFirst({
        where: { id: parsed.data.adminId, active: true },
        select: { id: true },
      });
      if (!assignee) {
        return jsonError("Akun yang dituju tidak ditemukan atau tidak aktif.", 400);
      }
    }

    const updated = await prisma.report.update({
      where: { id },
      data: { assignedToId: parsed.data.adminId },
      select: {
        id: true,
        assignedTo: { select: { id: true, name: true, role: true } },
      },
    });

    await writeAuditLog(auth.admin.id, "ASSIGN_REPORT", id);
    return NextResponse.json({ ok: true, data: updated });
  } catch {
    return jsonError("Terjadi kesalahan. Coba lagi sebentar lagi.", 500);
  }
}
