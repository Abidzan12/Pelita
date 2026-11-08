import argon2 from "argon2";
import { NextResponse } from "next/server";
import { verify as verifyTotp } from "otplib";
import { loginSchema } from "@/lib/admin-validators";
import {
  createSessionToken,
  isSameOrigin,
  SESSION_COOKIE,
  sessionCookieOptions,
  writeAuditLog,
} from "@/lib/auth";
import { prisma } from "@/lib/db";
import {
  clearFailures,
  limitRequest,
  peekFailures,
  recordFailure,
} from "@/lib/ratelimit";

export const runtime = "nodejs";

const ACCOUNT_WINDOW_MS = 15 * 60_000;
const ACCOUNT_FAILURE_LIMIT = 5;
const GENERIC_ERROR = "Email atau password salah.";

let dummyHashPromise: Promise<string> | null = null;

function dummyHash(): Promise<string> {
  dummyHashPromise ??= argon2.hash("pelita-dummy-password", {
    type: argon2.argon2id,
  });
  return dummyHashPromise;
}

export async function POST(request: Request) {
  if (!isSameOrigin(request)) {
    return NextResponse.json(
      { ok: false, error: "Permintaan ditolak." },
      { status: 403 },
    );
  }

  const ipLimit = limitRequest(request, "admin-login-ip", 20, ACCOUNT_WINDOW_MS);
  if (!ipLimit.allowed) {
    return NextResponse.json(
      { ok: false, error: "Terlalu banyak percobaan. Coba lagi nanti." },
      { status: 429, headers: { "Retry-After": String(ipLimit.retryAfterSeconds) } },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Permintaan tidak valid." },
      { status: 400 },
    );
  }

  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "Periksa email dan password." },
      { status: 400 },
    );
  }

  const { email, password, totp } = parsed.data;

  const blocked = peekFailures("admin-login-account", email, ACCOUNT_FAILURE_LIMIT);
  if (blocked.limited) {
    return NextResponse.json(
      { ok: false, error: "Terlalu banyak percobaan. Coba lagi nanti." },
      { status: 429, headers: { "Retry-After": String(blocked.retryAfterSeconds) } },
    );
  }

  try {
    const admin = await prisma.admin.findUnique({
      where: { email },
      select: {
        id: true,
        name: true,
        role: true,
        passwordHash: true,
        active: true,
        totpSecret: true,
      },
    });

    if (!admin || !admin.active) {
      await argon2.verify(await dummyHash(), password);
      recordFailure("admin-login-account", email, ACCOUNT_WINDOW_MS);
      return NextResponse.json({ ok: false, error: GENERIC_ERROR }, { status: 401 });
    }

    const passwordValid = await argon2
      .verify(admin.passwordHash, password)
      .catch(() => false);

    if (!passwordValid) {
      recordFailure("admin-login-account", email, ACCOUNT_WINDOW_MS);
      return NextResponse.json({ ok: false, error: GENERIC_ERROR }, { status: 401 });
    }

    if (admin.totpSecret) {
      if (!totp) {
        return NextResponse.json(
          { ok: false, error: "Masukkan kode 2FA.", totpRequired: true },
          { status: 401 },
        );
      }
      const totpResult = await verifyTotp({ secret: admin.totpSecret, token: totp });
      if (!totpResult.valid) {
        recordFailure("admin-login-account", email, ACCOUNT_WINDOW_MS);
        return NextResponse.json(
          { ok: false, error: "Kode 2FA tidak valid." },
          { status: 401 },
        );
      }
    }

    clearFailures("admin-login-account", email);

    const token = await createSessionToken(admin.id);
    const response = NextResponse.json({
      ok: true,
      data: { name: admin.name, role: admin.role },
    });
    response.cookies.set(SESSION_COOKIE, token, sessionCookieOptions());
    await writeAuditLog(admin.id, "LOGIN_SUCCESS");
    return response;
  } catch {
    return NextResponse.json(
      { ok: false, error: "Terjadi kesalahan. Coba lagi sebentar lagi." },
      { status: 500 },
    );
  }
}
