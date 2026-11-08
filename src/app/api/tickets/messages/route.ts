import { NextResponse } from "next/server";
import { toBytes } from "@/lib/bytes";
import { encrypt } from "@/lib/crypto";
import { prisma } from "@/lib/db";
import { limitRequest } from "@/lib/ratelimit";
import { hashTicket } from "@/lib/ticket";
import { ticketMessageSchema } from "@/lib/validators";

export const runtime = "nodejs";

const GENERIC_ERROR = "Terjadi kesalahan. Coba lagi sebentar lagi.";

export async function POST(request: Request) {
  const limit = limitRequest(request, "tickets-messages", 20, 60_000);
  if (!limit.allowed) {
    return NextResponse.json(
      { ok: false, error: "Terlalu banyak pesan dikirim. Coba lagi nanti." },
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

  const parsed = ticketMessageSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: parsed.error.issues[0]?.message ?? "Pesan tidak valid." },
      { status: 400 },
    );
  }

  try {
    const report = await prisma.report.findUnique({
      where: { ticketHash: hashTicket(parsed.data.ticket) },
      select: { id: true },
    });

    if (!report) {
      return NextResponse.json(
        { ok: false, error: "Tiket tidak ditemukan." },
        { status: 404 },
      );
    }

    const encrypted = encrypt(parsed.data.body);
    const message = await prisma.message.create({
      data: {
        reportId: report.id,
        sender: "PELAPOR",
        bodyEnc: toBytes(encrypted.ciphertext),
        iv: toBytes(encrypted.iv),
        tag: toBytes(encrypted.tag),
      },
      select: { id: true, createdAt: true },
    });

    return NextResponse.json(
      { ok: true, data: { id: message.id, createdAt: message.createdAt } },
      { status: 201 },
    );
  } catch {
    return NextResponse.json({ ok: false, error: GENERIC_ERROR }, { status: 500 });
  }
}
