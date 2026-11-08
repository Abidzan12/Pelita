import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";

export async function GET() {
  try {
    const slots = await prisma.counselingSlot.findMany({
      where: {
        startsAt: { gt: new Date() },
        booking: { is: null },
      },
      orderBy: { startsAt: "asc" },
      take: 50,
      select: { id: true, startsAt: true, endsAt: true, mode: true },
    });

    return NextResponse.json({ ok: true, data: slots });
  } catch {
    return NextResponse.json(
      { ok: false, error: "Jadwal belum bisa dimuat. Coba lagi." },
      { status: 500 },
    );
  }
}
