import { NextResponse } from "next/server";
import { jsonError, rejectCrossOrigin, requireAdmin } from "@/lib/admin-api";
import { hazardModerationSchema } from "@/lib/admin-validators";
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

  const parsed = hazardModerationSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError("Status moderasi tidak valid.", 400);
  }

  try {
    const existing = await prisma.hazardPoint.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!existing) {
      return jsonError("Titik rawan tidak ditemukan.", 404);
    }

    const point = await prisma.hazardPoint.update({
      where: { id },
      data: { status: parsed.data.status },
      select: { id: true, status: true },
    });
    await writeAuditLog(auth.admin.id, "MODERATE_HAZARD", id);
    return NextResponse.json({ ok: true, data: point });
  } catch {
    return jsonError("Status titik rawan belum bisa diubah.", 500);
  }
}
