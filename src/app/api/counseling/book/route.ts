import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { readJson, RequestTooLargeError } from "@/lib/request-body";
import { toBytes } from "@/lib/bytes";
import { encrypt } from "@/lib/crypto";
import { prisma } from "@/lib/db";
import { limitRequest } from "@/lib/ratelimit";
import { generateBookingCode, hashBookingCode } from "@/lib/ticket";
import { counselingBookingSchema } from "@/lib/validators";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const limit = limitRequest(request, "counseling-book", 5, 60 * 60_000);
  if (!limit.allowed) {
    return NextResponse.json(
      { ok: false, error: "Terlalu banyak pemesanan. Coba lagi nanti." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } },
    );
  }

  let body: unknown;
  try {
    body = await readJson(request);
  } catch (error) {
    if (error instanceof RequestTooLargeError) {
      return NextResponse.json(
        { ok: false, error: "Permintaan terlalu besar." },
        { status: 413 },
      );
    }
    return NextResponse.json(
      { ok: false, error: "Permintaan tidak valid." },
      { status: 400 },
    );
  }

  const parsed = counselingBookingSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: parsed.error.issues[0]?.message ?? "Permintaan tidak valid." },
      { status: 400 },
    );
  }

  try {
    const bookingCode = generateBookingCode();
    const contact = parsed.data.contact?.trim() || null;
    const encrypted = contact ? encrypt(contact) : null;

    const slot = await prisma.$transaction(async (tx) => {
      // Kunci baris slot agar tidak bertabrakan dengan PATCH/DELETE konselor.
      await tx.$queryRaw`SELECT id FROM "CounselingSlot" WHERE id = ${parsed.data.slotId} FOR UPDATE`;
      const available = await tx.counselingSlot.findFirst({
        where: {
          id: parsed.data.slotId,
          startsAt: { gt: new Date() },
          booking: { is: null },
          counselor: { active: true },
        },
        select: { id: true, startsAt: true, endsAt: true, mode: true },
      });

      if (!available) {
        return null;
      }

      await tx.counselingBooking.create({
        data: {
          slotId: available.id,
          bookingHash: hashBookingCode(bookingCode),
          aliasName: parsed.data.aliasName?.trim() || null,
          contactEnc: encrypted ? toBytes(encrypted.ciphertext) : null,
          contactIv: encrypted ? toBytes(encrypted.iv) : null,
          contactTag: encrypted ? toBytes(encrypted.tag) : null,
        },
      });

      return available;
    });

    if (!slot) {
      return NextResponse.json(
        { ok: false, error: "Slot tidak tersedia atau sudah dipesan." },
        { status: 404 },
      );
    }

    return NextResponse.json(
      {
        ok: true,
        data: {
          bookingCode,
          slot: { startsAt: slot.startsAt, endsAt: slot.endsAt, mode: slot.mode },
        },
      },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json(
        { ok: false, error: "Slot sudah dipesan orang lain. Pilih slot lain." },
        { status: 409 },
      );
    }
    return NextResponse.json(
      { ok: false, error: "Terjadi kesalahan. Coba lagi sebentar lagi." },
      { status: 500 },
    );
  }
}
