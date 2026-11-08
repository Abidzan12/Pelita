import { NextResponse } from "next/server";
import { jsonError, requireAdmin } from "@/lib/admin-api";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";

export async function GET() {
  const auth = await requireAdmin(["SATGAS", "SUPER_ADMIN"]);
  if ("response" in auth) {
    return auth.response;
  }

  try {
    const points = await prisma.hazardPoint.findMany({
      orderBy: [{ status: "asc" }, { createdAt: "desc" }],
      take: 200,
      select: {
        id: true,
        lat: true,
        lng: true,
        category: true,
        description: true,
        status: true,
        createdAt: true,
      },
    });
    return NextResponse.json({ ok: true, data: points });
  } catch {
    return jsonError("Titik rawan belum bisa dimuat.", 500);
  }
}
