import Link from "next/link";
import type { ReportStatus } from "@prisma/client";
import { CheckCircle2, FileText, Inbox, LoaderCircle } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminStat } from "@/components/admin/AdminStat";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { getCurrentAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { CATEGORY_LABELS, STATUS_LABELS } from "@/lib/labels";

const dateFormatter = new Intl.DateTimeFormat("id-ID", { dateStyle: "medium" });

const statusDot: Record<string, string> = {
  DITERIMA: "bg-[#c9a53f]",
  DIVERIFIKASI: "bg-[#7f9cb3]",
  DALAM_PENANGANAN: "bg-[#163456]",
  SELESAI: "bg-[#6f947c]",
  DITOLAK: "bg-[#b34e3c]",
};

export default async function AdminDashboardPage() {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return null;
  }

  const isCounselor = admin.role === "KONSELOR";

  const [statusCounts, categoryCounts, recent, total] = await Promise.all([
    prisma.report.groupBy({
      by: ["status"],
      where: isCounselor ? { assignedToId: admin.id } : {},
      _count: { _all: true },
    }),
    prisma.report.groupBy({
      by: ["category"],
      where: isCounselor ? { assignedToId: admin.id } : {},
      _count: { _all: true },
    }),
    prisma.report.findMany({
      where: isCounselor ? { assignedToId: admin.id } : {},
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        category: true,
        status: true,
        createdAt: true,
        assignedTo: { select: { name: true } },
      },
    }),
    prisma.report.count({ where: isCounselor ? { assignedToId: admin.id } : {} }),
  ]);

  const byStatus = new Map<ReportStatus, number>(
    statusCounts.map((row) => [row.status, row._count._all]),
  );
  const sortedCategories = [...categoryCounts].sort(
    (a, b) => b._count._all - a._count._all,
  );
  const newCount = byStatus.get("DITERIMA") ?? 0;
  const handlingCount = byStatus.get("DALAM_PENANGANAN") ?? 0;
  const doneCount = byStatus.get("SELESAI") ?? 0;
  const maxCategory = Math.max(1, ...sortedCategories.map((row) => row._count._all));

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="Dasbor"
        description={
          isCounselor
            ? "Ringkasan laporan yang ditugaskan kepadamu."
            : "Ringkasan laporan masuk tanpa menampilkan isi laporan."
        }
      >
        <Link
          href="/admin/laporan"
          className="inline-flex min-h-11 items-center gap-2 rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <FileText aria-hidden="true" className="size-4" />
          Lihat semua laporan
        </Link>
      </AdminPageHeader>

      <section
        aria-label="Ringkasan angka"
        className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"
      >
        <AdminStat label="Total laporan" value={total} icon={FileText} />
        <AdminStat label="Baru diterima" value={newCount} icon={Inbox} tone="new" />
        <AdminStat
          label="Dalam penanganan"
          value={handlingCount}
          icon={LoaderCircle}
          tone="progress"
        />
        <AdminStat label="Selesai" value={doneCount} icon={CheckCircle2} tone="done" />
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)]">
        <section aria-labelledby="terbaru-heading" className="admin-card overflow-hidden">
          <div className="admin-card-head">
            <div>
              <h2 id="terbaru-heading" className="font-semibold">
                Laporan terbaru
              </h2>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Lima laporan terakhir yang masuk.
              </p>
            </div>
            <Link
              href="/admin/laporan"
              className="text-sm font-semibold text-primary underline-offset-4 hover:underline"
            >
              Semua laporan
            </Link>
          </div>

          {recent.length === 0 ? (
            <p className="px-5 py-12 text-center text-sm text-muted-foreground">
              Belum ada laporan yang masuk.
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {recent.map((report) => (
                <li key={report.id}>
                  <Link
                    href={`/admin/laporan/${report.id}`}
                    className="flex flex-wrap items-center gap-x-4 gap-y-1.5 px-5 py-3.5 text-sm transition-colors hover:bg-muted/60"
                  >
                    <span className="font-mono text-xs text-muted-foreground">
                      #{report.id.slice(-6)}
                    </span>
                    <span className="font-medium">
                      {CATEGORY_LABELS[report.category] ?? report.category}
                    </span>
                    <StatusBadge status={report.status} />
                    <span className="ml-auto text-xs text-muted-foreground">
                      {dateFormatter.format(report.createdAt)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <div className="space-y-6">
          <section aria-labelledby="kategori-heading" className="admin-card p-5">
            <h2 id="kategori-heading" className="font-semibold">
              Per kategori
            </h2>
            {categoryCounts.length === 0 ? (
              <p className="mt-3 text-sm text-muted-foreground">Belum ada data.</p>
            ) : (
              <ul className="mt-4 space-y-3 text-sm">
                {sortedCategories.map((row) => (
                  <li key={row.category}>
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-muted-foreground">
                        {CATEGORY_LABELS[row.category] ?? row.category}
                      </span>
                      <span className="font-semibold tabular-nums">
                        {row._count._all}
                      </span>
                    </div>
                    <div aria-hidden="true" className="mt-1.5 h-1.5 rounded-sm bg-muted">
                      <div
                        className="h-full rounded-sm bg-primary"
                        style={{ width: `${(row._count._all / maxCategory) * 100}%` }}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section aria-labelledby="status-heading" className="admin-card p-5">
            <h2 id="status-heading" className="font-semibold">
              Status laporan
            </h2>
            <ul className="mt-4 space-y-2.5 text-sm">
              {Object.entries(STATUS_LABELS).map(([key, label]) => (
                <li key={key} className="flex items-center justify-between gap-3">
                  <span className="flex items-center gap-2 text-muted-foreground">
                    <span
                      aria-hidden="true"
                      className={`size-2 rounded-full ${statusDot[key] ?? "bg-muted-foreground"}`}
                    />
                    {label}
                  </span>
                  <span className="font-semibold tabular-nums">
                    {byStatus.get(key as ReportStatus) ?? 0}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
