import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { limitRequest } from "@/lib/ratelimit";
import { hazardPointSchema } from "@/lib/validators";

export const runtime = "nodejs";

export async function GET() {
  try {
    const points = await prisma.hazardPoint.findMany({
      where: { status: "APPROVED" },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        lat: true,
        lng: true,
        category: true,
        description: true,
      },
    });
    return NextResponse.json({ ok: true, data: points });
  } catch {
    return NextResponse.json(
      { ok: false, error: "Titik rawan belum bisa dimuat." },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  const limit = limitRequest(request, "hazard-points", 10, 60 * 60_000);
  if (!limit.allowed) {
    return NextResponse.json(
      { ok: false, error: "Terlalu banyak usulan. Coba lagi nanti." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Permintaan tidak valid." },
      { status: 400 },
    );
  }

  const parsed = hazardPointSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: parsed.error.issues[0]?.message ?? "Usulan tidak valid." },
      { status: 400 },
    );
  }

  try {
    const point = await prisma.hazardPoint.create({
      data: { ...parsed.data, status: "PENDING" },
      select: { id: true },
    });
    return NextResponse.json(
      {
        ok: true,
        data: { id: point.id, message: "Usulan terkirim dan menunggu moderasi." },
      },
      { status: 201 },
    );
  } catch {
    return NextResponse.json(
      { ok: false, error: "Usulan belum bisa dikirim. Coba lagi." },
      { status: 500 },
    );
  }
}
