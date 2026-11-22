import Link from "next/link";
import { redirect } from "next/navigation";
import { Download, FileText, MessageSquare, Timer } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminStat } from "@/components/admin/AdminStat";
import { getCurrentAdmin } from "@/lib/auth";
import { CATEGORY_LABELS, STATUS_LABELS } from "@/lib/labels";
import {
  currentSemester,
  getSemesterStats,
  parseSemester,
  semesterLabel,
} from "@/lib/stats";

export default async function AdminStatsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    redirect("/admin/login");
  }
  if (admin.role !== "SATGAS" && admin.role !== "SUPER_ADMIN") {
    redirect("/admin");
  }

  const params = await searchParams;
  const requested = typeof params.semester === "string" ? params.semester : undefined;
  const semester = parseSemester(requested) ?? currentSemester();
  const semesterValue = `${semester.year}-${semester.term}`;
  const stats = await getSemesterStats(semester);
  const maxMonth = Math.max(1, ...stats.byMonth.map((row) => row.count));
  const maxStatus = Math.max(1, ...stats.byStatus.map((row) => row.count));
  const maxCategory = Math.max(1, ...stats.byCategory.map((row) => row.count));

  return (
    <div className="space-y-6">
      <AdminPageHeader title="Statistik semester" description={`${semesterLabel(semester)} · hanya agregat, tanpa isi laporan atau data pribadi.`}>
        <a
          href={`/api/admin/stats/export?semester=${semesterValue}`}
          className="inline-flex min-h-11 items-center gap-2 rounded-md border border-border bg-card px-4 text-sm font-semibold transition-colors hover:bg-muted"
        >
          <Download aria-hidden="true" className="size-4" />
          Ekspor CSV
        </a>
      </AdminPageHeader>

      <form
        method="get"
        className="admin-card flex flex-wrap items-end gap-3 p-4"
      >
        <div>
          <label
            htmlFor="semester"
            className="text-xs font-semibold text-muted-foreground"
          >
            Semester
          </label>
          <input
            id="semester"
            name="semester"
            defaultValue={semesterValue}
            pattern="\d{4}-[12]"
            placeholder="2026-1"
            className="admin-control mt-1.5 w-40 font-mono"
          />
        </div>
        <button
          type="submit"
          className="inline-flex min-h-11 items-center rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Tampilkan
        </button>
        <p className="pb-2 text-xs text-muted-foreground">
          Format <code className="font-mono">YYYY-1</code> (Jan–Jun) atau{" "}
          <code className="font-mono">YYYY-2</code> (Jul–Des).
        </p>
      </form>

      <section aria-label="Ringkasan" className="grid gap-3 sm:grid-cols-3">
        <AdminStat label="Total laporan" value={stats.total} icon={FileText} />
        <AdminStat label="Dibalas admin" value={stats.repliedCount} icon={MessageSquare} />
        <AdminStat
          label="Rata-rata respons"
          value={
            stats.averageResponseHours === null
              ? "—"
              : `${stats.averageResponseHours} jam`
          }
          icon={Timer}
          hint="Dihitung dari laporan yang sudah dibalas."
        />
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section aria-labelledby="status-heading" className="admin-card p-5">
          <h2 id="status-heading" className="font-semibold">
            Per status
          </h2>
          {stats.byStatus.length === 0 ? (
            <p className="mt-3 text-sm text-muted-foreground">Belum ada laporan.</p>
          ) : (
            <ul className="mt-4 space-y-3 text-sm">
              {stats.byStatus.map((row) => (
                <li key={row.key}>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-muted-foreground">
                      {STATUS_LABELS[row.key] ?? row.key}
                    </span>
                    <span className="font-semibold tabular-nums">{row.count}</span>
                  </div>
                  <div aria-hidden="true" className="mt-1.5 h-1.5 rounded-sm bg-muted">
                    <div
                      className="h-full rounded-sm bg-primary"
                      style={{ width: `${(row.count / maxStatus) * 100}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section aria-labelledby="category-heading" className="admin-card p-5">
          <h2 id="category-heading" className="font-semibold">
            Per kategori
          </h2>
          {stats.byCategory.length === 0 ? (
            <p className="mt-3 text-sm text-muted-foreground">Belum ada laporan.</p>
          ) : (
            <ul className="mt-4 space-y-3 text-sm">
              {stats.byCategory.map((row) => (
                <li key={row.key}>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-muted-foreground">
                      {CATEGORY_LABELS[row.key] ?? row.key}
                    </span>
                    <span className="font-semibold tabular-nums">{row.count}</span>
                  </div>
                  <div aria-hidden="true" className="mt-1.5 h-1.5 rounded-sm bg-muted">
                    <div
                      className="h-full rounded-sm bg-primary"
                      style={{ width: `${(row.count / maxCategory) * 100}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <section aria-labelledby="bulan-heading" className="admin-card p-5">
        <h2 id="bulan-heading" className="font-semibold">
          Laporan per bulan
        </h2>
        <ul className="mt-4 space-y-2.5 text-sm">
          {stats.byMonth.map((row) => (
            <li
              key={row.month}
              className="grid grid-cols-[7rem_minmax(0,1fr)_2.5rem] items-center gap-3"
            >
              <span className="text-muted-foreground">{row.label}</span>
              <span aria-hidden="true" className="h-2.5 rounded-sm bg-muted">
                <span
                  className="block h-full rounded-sm bg-primary"
                  style={{ width: `${(row.count / maxMonth) * 100}%` }}
                />
              </span>
              <span className="text-right font-semibold tabular-nums">{row.count}</span>
            </li>
          ))}
        </ul>
      </section>

      <p className="text-xs leading-relaxed text-muted-foreground">
        Ekspor CSV dicatat di audit log.{" "}
        <Link
          href="/admin"
          className="font-medium underline underline-offset-4 hover:text-foreground"
        >
          Kembali ke dasbor
        </Link>
      </p>
    </div>
  );
}
