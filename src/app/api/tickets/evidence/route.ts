import { NextResponse } from "next/server";
import { toBytes } from "@/lib/bytes";
import { prisma } from "@/lib/db";
import { collectEvidence, discardEvidence } from "@/lib/evidence-upload";
import { MAX_EVIDENCE_PER_REPORT } from "@/lib/evidence-limits";
import { limitRequest } from "@/lib/ratelimit";
import { hashTicket } from "@/lib/ticket";
import { ticketLookupSchema } from "@/lib/validators";

export const runtime = "nodejs";

const GENERIC_ERROR = "Terjadi kesalahan. Coba lagi sebentar lagi.";

export async function POST(request: Request) {
  const limit = limitRequest(request, "tickets-evidence", 10, 10 * 60_000);
  if (!limit.allowed) {
    return NextResponse.json(
      { ok: false, error: "Terlalu banyak unggahan. Coba lagi nanti." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } },
    );
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Permintaan tidak valid." },
      { status: 400 },
    );
  }

  const ticket = form.get("ticket");
  const parsed = ticketLookupSchema.safeParse({
    ticket: typeof ticket === "string" ? ticket : "",
  });

  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "Tiket tidak ditemukan." },
      { status: 404 },
    );
  }

  try {
    const report = await prisma.report.findUnique({
      where: { ticketHash: hashTicket(parsed.data.ticket) },
      select: { id: true, _count: { select: { evidences: true } } },
    });

    if (!report) {
      return NextResponse.json(
        { ok: false, error: "Tiket tidak ditemukan." },
        { status: 404 },
      );
    }

    const remaining = MAX_EVIDENCE_PER_REPORT - report._count.evidences;
    const collected = await collectEvidence(form, remaining);
    if (!collected.ok) {
      return NextResponse.json({ ok: false, error: collected.error }, { status: 400 });
    }

    if (collected.stored.length === 0) {
      return NextResponse.json(
        { ok: false, error: "Pilih berkas yang ingin diunggah." },
        { status: 400 },
      );
    }

    try {
      await prisma.evidence.createMany({
        data: collected.stored.map((item) => ({
          reportId: report.id,
          storageKey: item.storageKey,
          mimeType: item.mimeType,
          sizeBytes: item.sizeBytes,
          iv: toBytes(item.iv),
          authTag: toBytes(item.authTag),
          sha256: item.sha256,
        })),
      });
    } catch {
      await discardEvidence(collected.stored);
      return NextResponse.json({ ok: false, error: GENERIC_ERROR }, { status: 500 });
    }

    return NextResponse.json(
      {
        ok: true,
        data: {
          added: collected.stored.length,
          evidenceCount: report._count.evidences + collected.stored.length,
        },
      },
      { status: 201 },
    );
  } catch {
    return NextResponse.json({ ok: false, error: GENERIC_ERROR }, { status: 500 });
  }
}
