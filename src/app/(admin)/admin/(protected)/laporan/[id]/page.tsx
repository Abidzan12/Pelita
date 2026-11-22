import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, Download, MessageSquare, Paperclip } from "lucide-react";
import { AdminReplyForm } from "@/components/admin/AdminReplyForm";
import { AdminReportActions } from "@/components/admin/AdminReportActions";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { getReportDetail, listAssignableAdmins } from "@/lib/admin-reports";
import { getCurrentAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { CATEGORY_LABELS, REPORTER_ROLE_LABELS } from "@/lib/labels";
import { canManageReports } from "@/lib/rbac";

const dateFormatter = new Intl.DateTimeFormat("id-ID", {
  dateStyle: "medium",
  timeStyle: "short",
});

const shortDateFormatter = new Intl.DateTimeFormat("id-ID", { dateStyle: "medium" });

export default async function AdminReportDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    redirect("/admin/login");
  }

  const { id } = await params;
  const result = await getReportDetail(id, admin);

  if (!result.ok) {
    return (
      <div className="admin-card p-8">
        <h1 className="text-xl font-semibold">Laporan tidak tersedia</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Laporan tidak ditemukan atau kamu tidak memiliki akses ke laporan ini.
        </p>
        <Link
          href="/admin/laporan"
          className="mt-4 inline-flex min-h-11 items-center text-sm font-semibold text-primary underline-offset-4 hover:underline"
        >
          Kembali ke daftar laporan
        </Link>
      </div>
    );
  }

  const report = result.report;
  const canManage = canManageReports(admin.role);
  const assignableAdmins = canManage ? await listAssignableAdmins() : [];

  const adminIds = [
    ...new Set(
      report.messages
        .map((message) => message.adminId)
        .filter((value): value is string => Boolean(value)),
    ),
  ];
  const messageAdmins =
    adminIds.length > 0
      ? await prisma.admin.findMany({
          where: { id: { in: adminIds } },
          select: { id: true, name: true },
        })
      : [];
  const adminNames = new Map(messageAdmins.map((item) => [item.id, item.name]));

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/laporan"
          className="inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-primary underline-offset-4 hover:underline"
        >
          <ArrowLeft aria-hidden="true" className="size-4" />
          Kembali ke daftar
        </Link>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-semibold tracking-tight">
            Laporan
            <span className="ml-2 font-mono text-lg text-muted-foreground">
              #{report.id.slice(-6)}
            </span>
          </h1>
          <StatusBadge status={report.status} />
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Diterima {dateFormatter.format(report.createdAt)} · Terakhir diperbarui{" "}
          {dateFormatter.format(report.updatedAt)}
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)]">
        <div className="space-y-6">
          <section aria-labelledby="info-heading" className="admin-card p-5">
            <h2 id="info-heading" className="text-lg font-semibold">
              Informasi laporan
            </h2>
            <dl className="mt-4 grid gap-x-6 gap-y-4 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-xs font-semibold tracking-[0.1em] text-muted-foreground uppercase">
                  Pelapor
                </dt>
                <dd className="mt-1 font-medium">
                  {REPORTER_ROLE_LABELS[report.reporterRole] ?? report.reporterRole}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold tracking-[0.1em] text-muted-foreground uppercase">
                  Kategori
                </dt>
                <dd className="mt-1 font-medium">
                  {CATEGORY_LABELS[report.category] ?? report.category}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold tracking-[0.1em] text-muted-foreground uppercase">
                  Tanggal kejadian
                </dt>
                <dd className="mt-1">
                  {report.incidentDate
                    ? shortDateFormatter.format(report.incidentDate)
                    : "Tidak diisi"}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold tracking-[0.1em] text-muted-foreground uppercase">
                  Lokasi
                </dt>
                <dd className="mt-1 whitespace-pre-wrap">
                  {report.locationText ?? "Tidak diisi"}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold tracking-[0.1em] text-muted-foreground uppercase">
                  Ditugaskan kepada
                </dt>
                <dd className="mt-1">{report.assignedTo?.name ?? "Belum ditugaskan"}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold tracking-[0.1em] text-muted-foreground uppercase">
                  Terakhir diperbarui
                </dt>
                <dd className="mt-1">{dateFormatter.format(report.updatedAt)}</dd>
              </div>
            </dl>
          </section>

          <section aria-labelledby="kronologi-heading" className="admin-card p-5">
            <h2 id="kronologi-heading" className="text-lg font-semibold">
              Kronologi
            </h2>
            <p className="mt-3 max-w-[70ch] text-sm leading-relaxed whitespace-pre-wrap">
              {report.description}
            </p>
          </section>

          <section aria-labelledby="bukti-heading" className="admin-card p-5">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <h2 id="bukti-heading" className="text-lg font-semibold">
                Bukti digital
              </h2>
              <span className="inline-flex items-center gap-1.5 rounded-md border border-border bg-muted/60 px-2 py-1 text-xs font-medium text-muted-foreground">
                <Paperclip aria-hidden="true" className="size-3.5" />
                {report.evidences.length} berkas
              </span>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              Nama berkas asli tidak pernah disimpan.
            </p>

            {!canManage ? (
              <p className="mt-4 rounded-md bg-muted p-3 text-sm text-muted-foreground">
                Hanya Satgas PPKS dan Super Admin yang dapat membuka isi bukti.
              </p>
            ) : report.evidences.length === 0 ? (
              <p className="mt-4 text-sm text-muted-foreground">
                Tidak ada bukti terlampir.
              </p>
            ) : (
              <ul className="mt-4 divide-y divide-border border-y border-border">
                {report.evidences.map((evidence) => (
                  <li
                    key={evidence.id}
                    className="flex flex-wrap items-center gap-x-4 gap-y-2 py-3 text-sm"
                  >
                    <span className="font-medium">{evidence.mimeType}</span>
                    <span className="text-muted-foreground">
                      {(evidence.sizeBytes / 1024).toFixed(1)} KB
                    </span>
                    <span className="font-mono text-xs text-muted-foreground">
                      sha256 {evidence.sha256.slice(0, 12)}…
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {dateFormatter.format(evidence.createdAt)}
                    </span>
                    <a
                      href={`/api/admin/reports/${report.id}/evidence/${evidence.id}`}
                      className="ml-auto inline-flex min-h-11 items-center gap-1.5 rounded-md border border-border px-3 text-sm font-semibold text-primary transition-colors hover:bg-muted"
                    >
                      <Download aria-hidden="true" className="size-3.5" />
                      Unduh
                    </a>
                  </li>
                ))}
              </ul>
            )}
            <p className="mt-3 text-xs text-muted-foreground">
              Setiap unduhan bukti tercatat di audit log.
            </p>
          </section>

          <section aria-labelledby="chat-heading" className="admin-card p-5">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <h2 id="chat-heading" className="text-lg font-semibold">
                Percakapan
              </h2>
              <span className="inline-flex items-center gap-1.5 rounded-md border border-border bg-muted/60 px-2 py-1 text-xs font-medium text-muted-foreground">
                <MessageSquare aria-hidden="true" className="size-3.5" />
                {report.messages.length} pesan
              </span>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              Balasan dienkripsi sebelum disimpan.
            </p>

            <div
              role="log"
              aria-label="Riwayat percakapan"
              className="mt-4 max-h-96 space-y-3 overflow-y-auto rounded-lg bg-muted/40 p-4"
            >
              {report.messages.length === 0 ? (
                <p className="py-6 text-center text-sm text-muted-foreground">
                  Belum ada pesan dari pelapor.
                </p>
              ) : (
                <ul className="space-y-3">
                  {report.messages.map((message) => {
                    const isAdmin = message.sender === "ADMIN";
                    const senderName = isAdmin
                      ? message.adminId === admin.id
                        ? "Kamu"
                        : ((message.adminId ? adminNames.get(message.adminId) : null) ??
                          "Petugas")
                      : "Pelapor";
                    return (
                      <li
                        key={message.id}
                        className={`max-w-[85%] rounded-lg px-3.5 py-2.5 text-sm ${
                          isAdmin
                            ? "ml-auto bg-primary text-primary-foreground"
                            : "mr-auto border border-border bg-card"
                        }`}
                      >
                        <p className="break-words whitespace-pre-wrap">{message.body}</p>
                        <p
                          className={`mt-1 text-xs ${
                            isAdmin
                              ? "text-primary-foreground/70"
                              : "text-muted-foreground"
                          }`}
                        >
                          {senderName} · {dateFormatter.format(message.createdAt)}
                        </p>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            <AdminReplyForm reportId={report.id} />
          </section>
        </div>

        <div className="space-y-6 xl:sticky xl:top-6 xl:self-start">
          {canManage ? (
            <AdminReportActions
              reportId={report.id}
              currentStatus={report.status}
              assignedToId={report.assignedTo?.id ?? null}
              admins={assignableAdmins}
            />
          ) : (
            <section className="admin-card p-5">
              <h2 className="font-semibold">Tindakan</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Perubahan status dan penugasan hanya dapat dilakukan oleh Satgas PPKS
                atau Super Admin.
              </p>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
