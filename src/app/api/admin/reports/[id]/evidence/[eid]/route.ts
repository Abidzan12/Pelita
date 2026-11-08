import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { jsonError, requireAdmin } from "@/lib/admin-api";
import { writeAuditLog } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { readEvidence } from "@/lib/storage";

export const runtime = "nodejs";

const EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "application/pdf": "pdf",
  "audio/mpeg": "mp3",
  "audio/mp4": "m4a",
  "video/mp4": "mp4",
};

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string; eid: string }> },
) {
  const auth = await requireAdmin(["SATGAS", "SUPER_ADMIN"]);
  if ("response" in auth) {
    return auth.response;
  }

  const { id, eid } = await params;

  try {
    const evidence = await prisma.evidence.findFirst({
      where: { id: eid, reportId: id },
      select: {
        id: true,
        storageKey: true,
        mimeType: true,
        iv: true,
        authTag: true,
        sha256: true,
      },
    });

    if (!evidence) {
      return jsonError("Bukti tidak ditemukan.", 404);
    }

    await writeAuditLog(auth.admin.id, "VIEW_EVIDENCE", evidence.id);

    const file = await readEvidence(
      evidence.storageKey,
      Buffer.from(evidence.iv),
      Buffer.from(evidence.authTag),
    );

    const digest = createHash("sha256").update(file).digest("hex");
    if (digest !== evidence.sha256) {
      return jsonError("Integritas bukti tidak cocok. Hubungi pengelola sistem.", 500);
    }

    const extension = EXTENSIONS[evidence.mimeType] ?? "bin";
    return new NextResponse(new Uint8Array(file), {
      status: 200,
      headers: {
        "Content-Type": evidence.mimeType,
        "Content-Disposition": `attachment; filename="bukti-${evidence.id.slice(-8)}.${extension}"`,
        "Cache-Control": "no-store, max-age=0",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return jsonError("Terjadi kesalahan saat membuka bukti.", 500);
  }
}
