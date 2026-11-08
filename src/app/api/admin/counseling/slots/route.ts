import { NextResponse } from "next/server";
import { jsonError, rejectCrossOrigin, requireAdmin } from "@/lib/admin-api";
import { counselingSlotCreateSchema } from "@/lib/admin-validators";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";

export async function GET() {
  const auth = await requireAdmin(["KONSELOR", "SUPER_ADMIN"]);
  if ("response" in auth) {
    return auth.response;
  }

  try {
    const slots = await prisma.counselingSlot.findMany({
      where: auth.admin.role === "KONSELOR" ? { counselorId: auth.admin.id } : {},
      orderBy: { startsAt: "asc" },
      take: 100,
      select: {
        id: true,
        startsAt: true,
        endsAt: true,
        mode: true,
        counselor: { select: { id: true, name: true } },
        booking: { select: { id: true, aliasName: true, status: true, createdAt: true } },
      },
    });
    return NextResponse.json({ ok: true, data: slots });
  } catch {
    return jsonError("Jadwal belum bisa dimuat.", 500);
  }
}

export async function POST(request: Request) {
  const crossOrigin = rejectCrossOrigin(request);
  if (crossOrigin) {
    return crossOrigin;
  }

  const auth = await requireAdmin(["KONSELOR", "SUPER_ADMIN"]);
  if ("response" in auth) {
    return auth.response;
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("Permintaan tidak valid.", 400);
  }

  const parsed = counselingSlotCreateSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(parsed.error.issues[0]?.message ?? "Data slot tidak valid.", 400);
  }

  const startsAt = new Date(parsed.data.startsAt);
  const endsAt = new Date(parsed.data.endsAt);
  if (startsAt >= endsAt) {
    return jsonError("Waktu selesai harus setelah waktu mulai.", 400);
  }
  if (startsAt <= new Date()) {
    return jsonError("Slot harus berada di waktu yang akan datang.", 400);
  }

  let counselorId = auth.admin.id;
  if (auth.admin.role === "SUPER_ADMIN") {
    if (!parsed.data.counselorId) {
      return jsonError("Pilih konselor untuk slot ini.", 400);
    }
    const counselor = await prisma.admin.findFirst({
      where: { id: parsed.data.counselorId, role: "KONSELOR", active: true },
      select: { id: true },
    });
    if (!counselor) {
      return jsonError("Konselor tidak ditemukan atau tidak aktif.", 400);
    }
    counselorId = counselor.id;
  }

  try {
    const slot = await prisma.counselingSlot.create({
      data: { counselorId, startsAt, endsAt, mode: parsed.data.mode },
      select: { id: true, startsAt: true, endsAt: true, mode: true },
    });
    return NextResponse.json({ ok: true, data: slot }, { status: 201 });
  } catch {
    return jsonError("Slot belum bisa dibuat. Coba lagi.", 500);
  }
}
