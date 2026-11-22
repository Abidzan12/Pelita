import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { readJson, RequestTooLargeError } from "@/lib/request-body";
import { jsonError, rejectCrossOrigin, requireAdmin } from "@/lib/admin-api";
import { counselingSlotUpdateSchema } from "@/lib/admin-validators";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";

class SlotNotFoundError extends Error {}
class SlotForbiddenError extends Error {}
class SlotBookedError extends Error {}

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
    body = await readJson(request);
  } catch (error) {
    return error instanceof RequestTooLargeError
      ? jsonError("Permintaan terlalu besar.", 413)
      : jsonError("Permintaan tidak valid.", 400);
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
    const updated = await prisma.$transaction(async (tx) => {
      await tx.$queryRaw`SELECT id FROM "CounselingSlot" WHERE id = ${id} FOR UPDATE`;
      const current = await tx.counselingSlot.findUnique({
        where: { id },
        select: { id: true, counselorId: true, booking: { select: { id: true } } },
      });
      if (!current) {
        throw new SlotNotFoundError();
      }
      if (auth.admin.role === "KONSELOR" && current.counselorId !== auth.admin.id) {
        throw new SlotForbiddenError();
      }
      if (current.booking) {
        throw new SlotBookedError();
      }
      return tx.counselingSlot.update({
        where: { id },
        data: { startsAt, endsAt, mode: parsed.data.mode },
        select: { id: true, startsAt: true, endsAt: true, mode: true },
      });
    });
    return NextResponse.json({ ok: true, data: updated });
  } catch (error) {
    if (error instanceof SlotNotFoundError) {
      return jsonError("Slot tidak ditemukan.", 404);
    }
    if (error instanceof SlotForbiddenError) {
      return jsonError("Kamu tidak memiliki akses ke slot ini.", 403);
    }
    if (error instanceof SlotBookedError) {
      return jsonError("Slot yang sudah dipesan tidak dapat diubah.", 409);
    }
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

  try {
    await prisma.$transaction(async (tx) => {
      await tx.$queryRaw`SELECT id FROM "CounselingSlot" WHERE id = ${id} FOR UPDATE`;
      const current = await tx.counselingSlot.findUnique({
        where: { id },
        select: { id: true, counselorId: true, booking: { select: { id: true } } },
      });
      if (!current) {
        throw new SlotNotFoundError();
      }
      if (auth.admin.role === "KONSELOR" && current.counselorId !== auth.admin.id) {
        throw new SlotForbiddenError();
      }
      if (current.booking) {
        throw new SlotBookedError();
      }
      await tx.counselingSlot.delete({ where: { id } });
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof SlotNotFoundError) {
      return jsonError("Slot tidak ditemukan.", 404);
    }
    if (error instanceof SlotForbiddenError) {
      return jsonError("Kamu tidak memiliki akses ke slot ini.", 403);
    }
    if (
      error instanceof SlotBookedError ||
      (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2003")
    ) {
      return jsonError("Slot yang sudah dipesan tidak dapat dihapus.", 409);
    }
    return jsonError("Slot belum bisa dihapus. Coba lagi.", 500);
  }
}
