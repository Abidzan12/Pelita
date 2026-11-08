import { NextResponse } from "next/server";
import { jsonError, rejectCrossOrigin, requireAdmin } from "@/lib/admin-api";
import { counselingSlotUpdateSchema } from "@/lib/admin-validators";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";

async function loadSlot(id: string) {
  return prisma.counselingSlot.findUnique({
    where: { id },
    select: { id: true, counselorId: true, booking: { select: { id: true } } },
  });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const crossOrigin = rejectCrossOrigin(request);
  if (crossOrigin) {
    return crossOrigin;
  }

  const auth = await requireAdmin(["KONSELOR", "SUPER_ADMIN"]);
  if ("response" in auth) {
    return auth.response;
  }

  const { id } = await params;
  const slot = await loadSlot(id);
  if (!slot) {
    return jsonError("Slot tidak ditemukan.", 404);
  }
  if (auth.admin.role === "KONSELOR" && slot.counselorId !== auth.admin.id) {
    return jsonError("Kamu tidak memiliki akses ke slot ini.", 403);
  }
  if (slot.booking) {
    return jsonError("Slot yang sudah dipesan tidak dapat diubah.", 409);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("Permintaan tidak valid.", 400);
  }

  const parsed = counselingSlotUpdateSchema.safeParse(body);
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

  try {
    const updated = await prisma.counselingSlot.update({
      where: { id },
      data: { startsAt, endsAt, mode: parsed.data.mode },
      select: { id: true, startsAt: true, endsAt: true, mode: true },
    });
    return NextResponse.json({ ok: true, data: updated });
  } catch {
    return jsonError("Slot belum bisa diubah. Coba lagi.", 500);
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const crossOrigin = rejectCrossOrigin(request);
  if (crossOrigin) {
    return crossOrigin;
  }

  const auth = await requireAdmin(["KONSELOR", "SUPER_ADMIN"]);
  if ("response" in auth) {
    return auth.response;
  }

  const { id } = await params;
  const slot = await loadSlot(id);
  if (!slot) {
    return jsonError("Slot tidak ditemukan.", 404);
  }
  if (auth.admin.role === "KONSELOR" && slot.counselorId !== auth.admin.id) {
    return jsonError("Kamu tidak memiliki akses ke slot ini.", 403);
  }
  if (slot.booking) {
    return jsonError("Slot yang sudah dipesan tidak dapat dihapus.", 409);
  }

  try {
    await prisma.counselingSlot.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return jsonError("Slot belum bisa dihapus. Coba lagi.", 500);
  }
}
