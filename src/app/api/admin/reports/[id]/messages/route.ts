import { NextResponse } from "next/server";
import { jsonError, rejectCrossOrigin, requireAdmin } from "@/lib/admin-api";
import { adminMessageSchema } from "@/lib/admin-validators";
import { writeAuditLog } from "@/lib/auth";
import { toBytes } from "@/lib/bytes";
import { encrypt } from "@/lib/crypto";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const crossOrigin = rejectCrossOrigin(request);
  if (crossOrigin) {
    return crossOrigin;
  }

  const auth = await requireAdmin(["SATGAS", "KONSELOR", "SUPER_ADMIN"]);
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

  const parsed = adminMessageSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(parsed.error.issues[0]?.message ?? "Pesan tidak valid.", 400);
  }

  try {
    const report = await prisma.report.findUnique({
      where: { id },
      select: { id: true, assignedToId: true },
    });

    if (!report) {
      return jsonError("Laporan tidak ditemukan.", 404);
    }

    if (auth.admin.role === "KONSELOR" && report.assignedToId !== auth.admin.id) {
      return jsonError("Kamu tidak memiliki akses ke laporan ini.", 403);
    }

    const encrypted = encrypt(parsed.data.body);
    const message = await prisma.message.create({
      data: {
        reportId: report.id,
        sender: "ADMIN",
        adminId: auth.admin.id,
        bodyEnc: toBytes(encrypted.ciphertext),
        iv: toBytes(encrypted.iv),
        tag: toBytes(encrypted.tag),
      },
      select: { id: true, createdAt: true },
    });

    await writeAuditLog(auth.admin.id, "SEND_MESSAGE", report.id);
    return NextResponse.json(
      { ok: true, data: { id: message.id, createdAt: message.createdAt } },
      { status: 201 },
    );
  } catch {
    return jsonError("Terjadi kesalahan. Coba lagi sebentar lagi.", 500);
  }
}
