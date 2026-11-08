import { NextResponse } from "next/server";
import { decryptToString } from "@/lib/crypto";
import { prisma } from "@/lib/db";
import { limitRequest } from "@/lib/ratelimit";
import { hashTicket } from "@/lib/ticket";
import { ticketLookupSchema } from "@/lib/validators";

export const runtime = "nodejs";

const NOT_FOUND = { ok: false, error: "Tiket tidak ditemukan." };
const MIN_RESPONSE_MS = 120;

async function respond(body: unknown, status: number, startedAt: number) {
  const elapsed = Date.now() - startedAt;
  if (elapsed < MIN_RESPONSE_MS) {
    await new Promise((resolve) => setTimeout(resolve, MIN_RESPONSE_MS - elapsed));
  }
  return NextResponse.json(body, { status });
}

export async function POST(request: Request) {
  const startedAt = Date.now();
  const limit = limitRequest(request, "tickets-lookup", 10, 60_000);
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

  const parsed = ticketLookupSchema.safeParse(body);
  if (!parsed.success) {
    return respond(NOT_FOUND, 404, startedAt);
  }

  try {
    const report = await prisma.report.findUnique({
      where: { ticketHash: hashTicket(parsed.data.ticket) },
      select: {
        id: true,
        status: true,
        category: true,
        createdAt: true,
        updatedAt: true,
        _count: { select: { evidences: true } },
        messages: {
          orderBy: { createdAt: "asc" },
          select: {
            id: true,
            sender: true,
            bodyEnc: true,
            iv: true,
            tag: true,
            readAt: true,
            createdAt: true,
          },
        },
      },
    });

    if (!report) {
      return respond(NOT_FOUND, 404, startedAt);
    }

    const now = new Date();
    const hasUnreadAdminMessage = report.messages.some(
      (message) => message.sender === "ADMIN" && message.readAt === null,
    );
    if (hasUnreadAdminMessage) {
      await prisma.message.updateMany({
        where: { reportId: report.id, sender: "ADMIN", readAt: null },
        data: { readAt: now },
      });
    }

    const messages = report.messages.map((message) => ({
      id: message.id,
      sender: message.sender,
      body: decryptToString({
        ciphertext: Buffer.from(message.bodyEnc),
        iv: Buffer.from(message.iv),
        tag: Buffer.from(message.tag),
      }),
      readAt: message.readAt,
      createdAt: message.createdAt,
    }));

    return respond(
      {
        ok: true,
        data: {
          status: report.status,
          category: report.category,
          createdAt: report.createdAt,
          updatedAt: report.updatedAt,
          evidenceCount: report._count.evidences,
          messages,
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
