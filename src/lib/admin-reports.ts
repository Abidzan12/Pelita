import type { Prisma } from "@prisma/client";
import { writeAuditLog, type SessionAdmin } from "./auth";
import { decryptToString } from "./crypto";
import { prisma } from "./db";
import { canAccessReport } from "./rbac";
import type { reportListQuerySchema } from "./admin-validators";
import type { z } from "zod";

export type ReportFilters = z.infer<typeof reportListQuerySchema>;

export async function listReports(
  filters: ReportFilters,
  options: { assignedToId?: string } = {},
) {
  const where: Prisma.ReportWhereInput = {};
  if (options.assignedToId) {
    where.assignedToId = options.assignedToId;
  }
  if (filters.status) {
    where.status = filters.status;
  }
  if (filters.category) {
    where.category = filters.category;
  }
  if (filters.q) {
    where.OR = [
      { id: { contains: filters.q, mode: "insensitive" } },
      { locationText: { contains: filters.q, mode: "insensitive" } },
    ];
  }

  return prisma.report.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 100,
    select: {
      id: true,
      status: true,
      category: true,
      reporterRole: true,
      incidentDate: true,
      createdAt: true,
      updatedAt: true,
      assignedTo: { select: { id: true, name: true, role: true } },
      _count: { select: { messages: true, evidences: true } },
    },
  });
}

export type ReportDetailResult =
  | {
      ok: true;
      report: NonNullable<Awaited<ReturnType<typeof buildReportDetail>>>;
    }
  | { ok: false; reason: "not_found" | "forbidden" };

async function buildReportDetail(id: string) {
  const report = await prisma.report.findUnique({
    where: { id },
    select: {
      id: true,
      status: true,
      category: true,
      reporterRole: true,
      incidentDate: true,
      locationText: true,
      descEnc: true,
      descIv: true,
      descTag: true,
      createdAt: true,
      updatedAt: true,
      assignedTo: { select: { id: true, name: true, role: true } },
      evidences: {
        orderBy: { createdAt: "asc" },
        select: {
          id: true,
          mimeType: true,
          sizeBytes: true,
          sha256: true,
          createdAt: true,
        },
      },
      messages: {
        orderBy: { createdAt: "asc" },
        select: {
          id: true,
          sender: true,
          bodyEnc: true,
          iv: true,
          tag: true,
          readAt: true,
          createdAt: true,
          adminId: true,
        },
      },
    },
  });

  if (!report) {
    return null;
  }

  const { descEnc, descIv, descTag, messages, ...rest } = report;

  return {
    ...rest,
    description: decryptToString({
      ciphertext: Buffer.from(descEnc),
      iv: Buffer.from(descIv),
      tag: Buffer.from(descTag),
    }),
    messages: messages.map((message) => ({
      id: message.id,
      sender: message.sender,
      adminId: message.adminId,
      body: decryptToString({
        ciphertext: Buffer.from(message.bodyEnc),
        iv: Buffer.from(message.iv),
        tag: Buffer.from(message.tag),
      }),
      readAt: message.readAt,
      createdAt: message.createdAt,
    })),
  };
}

export async function getReportDetail(
  id: string,
  admin: SessionAdmin,
  options: { audit?: boolean } = {},
): Promise<ReportDetailResult> {
  const report = await prisma.report.findUnique({
    where: { id },
    select: { assignedToId: true },
  });

  if (!report) {
    return { ok: false, reason: "not_found" };
  }

  if (!canAccessReport(admin.role, admin.id, report.assignedToId)) {
    return { ok: false, reason: "forbidden" };
  }

  const detail = await buildReportDetail(id);
  if (!detail) {
    return { ok: false, reason: "not_found" };
  }

  if (options.audit !== false) {
    await writeAuditLog(admin.id, "VIEW_REPORT", id);
  }

  return { ok: true, report: detail };
}

export async function listAssignableAdmins() {
  return prisma.admin.findMany({
    where: { active: true, role: { in: ["SATGAS", "KONSELOR", "SUPER_ADMIN"] } },
    orderBy: { name: "asc" },
    select: { id: true, name: true, role: true },
  });
}
