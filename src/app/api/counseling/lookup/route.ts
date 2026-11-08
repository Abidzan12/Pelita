import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { limitRequest } from "@/lib/ratelimit";
import { hashBookingCode } from "@/lib/ticket";
import { counselingLookupSchema } from "@/lib/validators";

export const runtime = "nodejs";

const NOT_FOUND = { ok: false, error: "Kode booking tidak ditemukan." };
const MIN_RESPONSE_MS = 100;

async function respond(body: unknown, status: number, startedAt: number) {
  const elapsed = Date.now() - startedAt;
  if (elapsed < MIN_RESPONSE_MS) {
    await new Promise((resolve) => setTimeout(resolve, MIN_RESPONSE_MS - elapsed));
  }
  return NextResponse.json(body, { status });
}

export async function POST(request: Request) {
  const startedAt = Date.now();
  const limit = limitRequest(request, "counseling-lookup", 10, 60_000);
  if (!limit.allowed) {
    return NextResponse.json(
      { ok: false, error: "Terlalu banyak percobaan. Coba lagi nanti." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return respond(NOT_FOUND, 404, startedAt);
  }

  const parsed = counselingLookupSchema.safeParse(body);
  if (!parsed.success) {
    return respond(NOT_FOUND, 404, startedAt);
  }

  try {
    const booking = await prisma.counselingBooking.findUnique({
      where: { bookingHash: hashBookingCode(parsed.data.bookingCode) },
      select: {
        aliasName: true,
        status: true,
        createdAt: true,
        slot: { select: { startsAt: true, endsAt: true, mode: true } },
      },
    });

    if (!booking) {
      return respond(NOT_FOUND, 404, startedAt);
    }

    return respond(
      {
        ok: true,
        data: {
          aliasName: booking.aliasName,
          status: booking.status,
          createdAt: booking.createdAt,
          startsAt: booking.slot.startsAt,
          endsAt: booking.slot.endsAt,
          mode: booking.slot.mode,
        },
      },
      200,
      startedAt,
    );
  } catch {
    return respond(
      { ok: false, error: "Terjadi kesalahan. Coba lagi sebentar lagi." },
      500,
      startedAt,
    );
  }
}
