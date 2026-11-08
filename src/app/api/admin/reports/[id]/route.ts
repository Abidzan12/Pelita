import { NextResponse } from "next/server";
import { jsonError, requireAdmin } from "@/lib/admin-api";
import { getReportDetail } from "@/lib/admin-reports";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAdmin();
  if ("response" in auth) {
    return auth.response;
  }

  const { id } = await params;
  const result = await getReportDetail(id, auth.admin);
  if (!result.ok) {
    return result.reason === "forbidden"
      ? jsonError("Kamu tidak memiliki akses ke laporan ini.", 403)
      : jsonError("Laporan tidak ditemukan.", 404);
  }

  return NextResponse.json({ ok: true, data: result.report });
}
