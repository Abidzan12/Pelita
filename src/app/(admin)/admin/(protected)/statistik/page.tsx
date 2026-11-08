import Link from "next/link";
import { redirect } from "next/navigation";
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

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Statistik semester</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {semesterLabel(semester)} · hanya agregat, tanpa isi laporan atau data
            pribadi.
          </p>
        </div>
        <a
          href={`/api/admin/stats/export?semester=${semesterValue}`}
          className="inline-flex min-h-11 items-center rounded-md border border-border bg-background px-4 text-sm font-semibold hover:bg-muted"
        >
          Ekspor CSV
        </a>
      </div>

      <form
        method="get"
        className="mt-5 flex flex-wrap items-end gap-3 rounded-lg border border-border bg-card p-4"
      >
        <div>
          <label htmlFor="semester" className="text-xs font-medium text-muted-foreground">
            Semester
          </label>
          <input
            id="semester"
            name="semester"
            defaultValue={semesterValue}
            pattern="\d{4}-[12]"
            placeholder="2026-1"
            className="mt-1 h-11 w-40 rounded-lg border border-input bg-background px-3 font-mono text-sm"
          />
        </div>
        <button
          type="submit"
          className="inline-flex min-h-11 items-center rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
        >
          Tampilkan
        </button>
        <p className="text-xs text-muted-foreground">
          Format <code>YYYY-1</code> (Jan–Jun) atau <code>YYYY-2</code> (Jul–Des).
        </p>
      </form>

      <section aria-label="Ringkasan" className="mt-6 grid gap-3 sm:grid-cols-3">
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">Total laporan</p>
          <p className="mt-2 text-3xl font-semibold tabular-nums">{stats.total}</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">Dibalas admin</p>
          <p className="mt-2 text-3xl font-semibold tabular-nums">{stats.repliedCount}</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">Rata-rata respons</p>
          <p className="mt-2 text-3xl font-semibold tabular-nums">
            {stats.averageResponseHours === null
              ? "—"
              : `${stats.averageResponseHours} jam`}
          </p>
        </div>
      </section>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <section
          aria-labelledby="status-heading"
          className="rounded-lg border border-border bg-card p-4"
        >
          <h2 id="status-heading" className="font-semibold">
            Per status
          </h2>
          {stats.byStatus.length === 0 ? (
            <p className="mt-3 text-sm text-muted-foreground">Belum ada laporan.</p>
          ) : (
            <ul className="mt-3 space-y-2 text-sm">
              {stats.byStatus.map((row) => (
                <li key={row.key} className="flex items-center justify-between gap-3">
                  <span className="text-muted-foreground">
                    {STATUS_LABELS[row.key] ?? row.key}
                  </span>
                  <span className="font-semibold tabular-nums">{row.count}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section
          aria-labelledby="category-heading"
          className="rounded-lg border border-border bg-card p-4"
        >
          <h2 id="category-heading" className="font-semibold">
            Per kategori
          </h2>
          {stats.byCategory.length === 0 ? (
            <p className="mt-3 text-sm text-muted-foreground">Belum ada laporan.</p>
          ) : (
            <ul className="mt-3 space-y-2 text-sm">
              {stats.byCategory.map((row) => (
                <li key={row.key} className="flex items-center justify-between gap-3">
                  <span className="text-muted-foreground">
                    {CATEGORY_LABELS[row.key] ?? row.key}
                  </span>
                  <span className="font-semibold tabular-nums">{row.count}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <section
        aria-labelledby="bulan-heading"
        className="mt-6 rounded-lg border border-border bg-card p-4"
      >
        <h2 id="bulan-heading" className="font-semibold">
          Laporan per bulan
        </h2>
        <ul className="mt-4 space-y-2 text-sm">
          {stats.byMonth.map((row) => (
            <li
              key={row.month}
              className="grid grid-cols-[7rem_1fr_2.5rem] items-center gap-3"
            >
              <span className="text-muted-foreground">{row.label}</span>
              <span className="h-2.5 rounded-sm bg-muted">
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

      <p className="mt-6 text-xs leading-relaxed text-muted-foreground">
        Ekspor CSV dicatat di audit log.{" "}
        <Link
          href="/admin"
          className="underline underline-offset-4 hover:text-foreground"
        >
          Kembali ke dasbor
        </Link>
      </p>
    </div>
  );
}
