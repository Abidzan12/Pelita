import { NextResponse } from "next/server";
import { getCurrentAdmin, isSameOrigin, SESSION_COOKIE, writeAuditLog } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!isSameOrigin(request)) {
    return NextResponse.json(
      { ok: false, error: "Permintaan ditolak." },
      { status: 403 },
    );
  }

  const admin = await getCurrentAdmin();
  const response = NextResponse.json({ ok: true });

  if (admin) {
    await writeAuditLog(admin.id, "LOGOUT");
  }

  response.cookies.set(SESSION_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 0,
  });
  return response;
}
