import { NextResponse } from "next/server";
import { jsonError, requireAdmin } from "@/lib/admin-api";
import { getSemesterStats, parseSemester } from "@/lib/stats";

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
    return NextResponse.json({ ok: true, data: { semester, ...stats } });
  } catch {
    return jsonError("Statistik belum bisa dimuat.", 500);
  }
}
