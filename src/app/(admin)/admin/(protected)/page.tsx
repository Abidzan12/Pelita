import Link from "next/link";
import { getCurrentAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { ADMIN_ROLE_LABELS, CATEGORY_LABELS } from "@/lib/labels";
import { StatusBadge } from "@/components/admin/StatusBadge";

const dateFormatter = new Intl.DateTimeFormat("id-ID", { dateStyle: "medium" });

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

  const byStatus = new Map(statusCounts.map((row) => [row.status, row._count._all]));
  const newCount = byStatus.get("DITERIMA") ?? 0;
  const handlingCount = byStatus.get("DALAM_PENANGANAN") ?? 0;
  const doneCount = byStatus.get("SELESAI") ?? 0;

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-muted-foreground">
            {ADMIN_ROLE_LABELS[admin.role] ?? admin.role}
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">Dasbor</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {isCounselor
              ? "Ringkasan laporan yang ditugaskan kepadamu."
              : "Ringkasan laporan masuk tanpa menampilkan isi laporan."}
          </p>
        </div>
        <Link
          href="/admin/laporan"
          className="inline-flex min-h-11 items-center rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
        >
          Lihat semua laporan
        </Link>
      </div>

      <section
        aria-label="Ringkasan angka"
        className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4"
      >
        {[
          { label: "Total laporan", value: total },
          { label: "Baru diterima", value: newCount },
          { label: "Dalam penanganan", value: handlingCount },
          { label: "Selesai", value: doneCount },
        ].map((item) => (
          <div key={item.label} className="rounded-lg border border-border bg-card p-4">
            <p className="text-sm text-muted-foreground">{item.label}</p>
            <p className="mt-2 text-3xl font-semibold tabular-nums">{item.value}</p>
          </div>
        ))}
      </section>

      <div className="mt-8 grid gap-6 lg:grid-cols-[2fr_1fr]">
        <section
          aria-labelledby="terbaru-heading"
          className="rounded-lg border border-border bg-card"
        >
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <h2 id="terbaru-heading" className="font-semibold">
              Laporan terbaru
            </h2>
            <Link
              href="/admin/laporan"
              className="text-sm font-medium text-primary underline-offset-4 hover:underline"
            >
              Semua
            </Link>
          </div>
          {recent.length === 0 ? (
            <p className="px-4 py-8 text-sm text-muted-foreground">
              Belum ada laporan yang masuk.
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {recent.map((report) => (
                <li key={report.id}>
                  <Link
                    href={`/admin/laporan/${report.id}`}
                    className="flex flex-wrap items-center gap-x-4 gap-y-1 px-4 py-3 text-sm hover:bg-muted/50"
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

        <section
          aria-labelledby="kategori-heading"
          className="rounded-lg border border-border bg-card p-4"
        >
          <h2 id="kategori-heading" className="font-semibold">
            Per kategori
          </h2>
          {categoryCounts.length === 0 ? (
            <p className="mt-3 text-sm text-muted-foreground">Belum ada data.</p>
          ) : (
            <ul className="mt-3 space-y-2 text-sm">
              {categoryCounts.map((row) => (
                <li
                  key={row.category}
                  className="flex items-center justify-between gap-3"
                >
                  <span className="text-muted-foreground">
                    {CATEGORY_LABELS[row.category] ?? row.category}
                  </span>
                  <span className="font-semibold tabular-nums">{row._count._all}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
