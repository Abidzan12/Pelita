import { NextResponse } from "next/server";
import { jsonError, requireAdmin } from "@/lib/admin-api";
import { listReports } from "@/lib/admin-reports";
import { reportListQuerySchema } from "@/lib/admin-validators";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const auth = await requireAdmin(["SATGAS", "SUPER_ADMIN"]);
  if ("response" in auth) {
    return auth.response;
  }

  const url = new URL(request.url);
  const parsed = reportListQuerySchema.safeParse({
    status: url.searchParams.get("status") ?? undefined,
    category: url.searchParams.get("category") ?? undefined,
    q: url.searchParams.get("q") ?? undefined,
  });

  if (!parsed.success) {
    return jsonError("Filter tidak valid.", 400);
  }

  const reports = await listReports(parsed.data);
  return NextResponse.json({ ok: true, data: reports });
}
