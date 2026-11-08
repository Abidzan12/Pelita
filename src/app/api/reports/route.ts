import { NextResponse } from "next/server";
import { toBytes } from "@/lib/bytes";
import { encrypt } from "@/lib/crypto";
import { prisma } from "@/lib/db";
import { collectEvidence, discardEvidence } from "@/lib/evidence-upload";
import { MAX_EVIDENCE_PER_REPORT } from "@/lib/evidence-limits";
import { limitRequest } from "@/lib/ratelimit";
import { generateTicket, hashTicket } from "@/lib/ticket";
import { createReportSchema, zodFieldErrors } from "@/lib/validators";

export const runtime = "nodejs";

const GENERIC_ERROR = "Terjadi kesalahan. Coba lagi sebentar lagi.";

function formText(form: FormData, name: string): string | undefined {
  const value = form.get(name);
  return typeof value === "string" && value.trim() !== "" ? value : undefined;
}

export async function POST(request: Request) {
  const limit = limitRequest(request, "reports", 5, 10 * 60_000);
  if (!limit.allowed) {
    return NextResponse.json(
      { ok: false, error: "Terlalu banyak laporan dikirim. Coba lagi nanti." },
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

  const parsed = createReportSchema.safeParse({
    reporterRole: formText(form, "reporterRole") ?? "",
    category: formText(form, "category") ?? "",
    incidentDate: formText(form, "incidentDate"),
    locationText: formText(form, "locationText"),
    description: formText(form, "description") ?? "",
  });

  if (!parsed.success) {
    return NextResponse.json(
      {
        ok: false,
        error: "Periksa kembali isianmu.",
        fields: zodFieldErrors(parsed.error),
      },
      { status: 400 },
    );
  }

  const collected = await collectEvidence(form, MAX_EVIDENCE_PER_REPORT);
  if (!collected.ok) {
    return NextResponse.json({ ok: false, error: collected.error }, { status: 400 });
  }

  const ticket = generateTicket();
  const description = encrypt(parsed.data.description);
  const ticketHash = hashTicket(ticket);

  try {
    await prisma.report.create({
      data: {
        ticketHash,
        reporterRole: parsed.data.reporterRole,
        category: parsed.data.category,
        incidentDate: parsed.data.incidentDate
          ? new Date(`${parsed.data.incidentDate}T00:00:00.000Z`)
          : null,
        locationText: parsed.data.locationText ?? null,
        descEnc: toBytes(description.ciphertext),
        descIv: toBytes(description.iv),
        descTag: toBytes(description.tag),
        evidences: {
          create: collected.stored.map((item) => ({
            storageKey: item.storageKey,
            mimeType: item.mimeType,
            sizeBytes: item.sizeBytes,
            iv: toBytes(item.iv),
            authTag: toBytes(item.authTag),
            sha256: item.sha256,
          })),
        },
      },
    });
  } catch {
    await discardEvidence(collected.stored);
    return NextResponse.json({ ok: false, error: GENERIC_ERROR }, { status: 500 });
  }

  return NextResponse.json({ ok: true, data: { ticket } }, { status: 201 });
}
