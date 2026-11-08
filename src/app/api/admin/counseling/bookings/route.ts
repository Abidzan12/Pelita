import { NextResponse } from "next/server";
import { jsonError, requireAdmin } from "@/lib/admin-api";
import { decryptToString } from "@/lib/crypto";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";

export async function GET() {
  const auth = await requireAdmin(["KONSELOR", "SUPER_ADMIN"]);
  if ("response" in auth) {
    return auth.response;
  }

  try {
    const bookings = await prisma.counselingBooking.findMany({
      where:
        auth.admin.role === "KONSELOR" ? { slot: { counselorId: auth.admin.id } } : {},
      orderBy: { slot: { startsAt: "asc" } },
      take: 200,
      select: {
        id: true,
        aliasName: true,
        status: true,
        createdAt: true,
        contactEnc: true,
        contactIv: true,
        contactTag: true,
        slot: {
          select: {
            startsAt: true,
            endsAt: true,
            mode: true,
            counselor: { select: { id: true, name: true } },
          },
        },
      },
    });

    const data = bookings.map((booking) => ({
      id: booking.id,
      aliasName: booking.aliasName,
      status: booking.status,
      createdAt: booking.createdAt,
      contact:
        booking.contactEnc && booking.contactIv && booking.contactTag
          ? decryptToString({
              ciphertext: Buffer.from(booking.contactEnc),
              iv: Buffer.from(booking.contactIv),
              tag: Buffer.from(booking.contactTag),
            })
          : null,
      slot: {
        startsAt: booking.slot.startsAt,
        endsAt: booking.slot.endsAt,
        mode: booking.slot.mode,
        counselor: booking.slot.counselor,
      },
    }));

    return NextResponse.json({ ok: true, data });
  } catch {
    return jsonError("Daftar booking belum bisa dimuat.", 500);
  }
}
