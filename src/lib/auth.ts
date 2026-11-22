import { randomUUID } from "node:crypto";
import type { AdminRole } from "@prisma/client";
import { jwtVerify, SignJWT } from "jose";
import { cookies } from "next/headers";
import { prisma } from "./db";

export const SESSION_COOKIE = "pelita_session";
export const SESSION_MAX_AGE_SECONDS = 8 * 60 * 60;
const JWT_ISSUER = "pelita";
const JWT_AUDIENCE = "pelita-admin";

export type SessionAdmin = {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
};

function sessionKey(): Uint8Array {
  const raw = process.env.SESSION_SECRET;
  if (!raw) {
    throw new Error("SESSION_SECRET belum diatur.");
  }
  const key = Buffer.from(raw, "base64");
  if (key.length !== 32) {
    throw new Error("SESSION_SECRET harus berupa 32 byte base64.");
  }
  return new Uint8Array(key);
}

export async function createSessionToken(
  adminId: string,
  tokenVersion = 0,
): Promise<string> {
  return new SignJWT({ ver: tokenVersion })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(adminId)
    .setIssuer(JWT_ISSUER)
    .setAudience(JWT_AUDIENCE)
    .setJti(randomUUID())
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE_SECONDS}s`)
    .sign(sessionKey());
}

export function sessionCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict" as const,
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  };
}

export async function getCurrentAdmin(): Promise<SessionAdmin | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) {
    return null;
  }

  try {
    const { payload } = await jwtVerify(token, sessionKey(), {
      algorithms: ["HS256"],
      issuer: JWT_ISSUER,
      audience: JWT_AUDIENCE,
    });
    if (!payload.sub || typeof payload.ver !== "number") {
      return null;
    }
    const admin = await prisma.admin.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        active: true,
        tokenVersion: true,
      },
    });
    if (!admin?.active || admin.tokenVersion !== payload.ver) {
      return null;
    }
    return {
      id: admin.id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
    };
  } catch {
    return null;
  }
}

export async function revokeAdminSessions(adminId: string): Promise<void> {
  await prisma.admin.update({
    where: { id: adminId },
    data: { tokenVersion: { increment: 1 } },
  });
}

export function isSameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) {
    return false;
  }
  try {
    const expected = process.env.APP_URL
      ? new URL(process.env.APP_URL).origin
      : new URL(request.url).origin;
    return origin === expected;
  } catch {
    return false;
  }
}

export async function writeAuditLog(
  adminId: string,
  action: string,
  targetId?: string,
): Promise<void> {
  await prisma.auditLog.create({
    data: { adminId, action, targetId: targetId ?? null },
  });
}
