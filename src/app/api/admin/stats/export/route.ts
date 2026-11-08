import { NextResponse } from "next/server";
import { jsonError, requireAdmin } from "@/lib/admin-api";
import { writeAuditLog } from "@/lib/auth";
import { buildStatsCsv, getSemesterStats, parseSemester } from "@/lib/stats";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const auth = await requireAdmin(["SATGAS", "SUPER_ADMIN"]);
  if ("response" in auth) {
    return auth.response;
  }

  const url = new URL(request.url);
  const semester = parseSemester(url.searchParams.get("semester"));
  if (!semester) {
    return jsonError("Format semester harus YYYY-1 atau YYYY-2.", 400);
  }

  try {
    const stats = await getSemesterStats(semester);
    const csv = buildStatsCsv(semester, stats);
    await writeAuditLog(
      auth.admin.id,
      "EXPORT_STATS",
      `${semester.year}-${semester.term}`,
    );

    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="pelita-statistik-${semester.year}-${semester.term}.csv"`,
        "Cache-Control": "no-store, max-age=0",
      },
    });
  } catch {
    return jsonError("Statistik belum bisa diekspor.", 500);
  }
}
