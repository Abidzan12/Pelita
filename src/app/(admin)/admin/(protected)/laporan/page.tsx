import Link from "next/link";
import { redirect } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { listReports } from "@/lib/admin-reports";
import { reportListQuerySchema } from "@/lib/admin-validators";
import { getCurrentAdmin } from "@/lib/auth";
import { CATEGORY_LABELS, REPORTER_ROLE_LABELS, STATUS_LABELS } from "@/lib/labels";

const dateFormatter = new Intl.DateTimeFormat("id-ID", { dateStyle: "medium" });

function single(value: string | string[] | undefined): string | undefined {
  return typeof value === "string" && value !== "" ? value : undefined;
}

export default async function AdminReportsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    redirect("/admin/login");
  }

  const params = await searchParams;
  const parsed = reportListQuerySchema.safeParse({
    status: single(params.status),
    category: single(params.category),
    q: single(params.q),
  });
  const filters = parsed.success ? parsed.data : {};

  const reports = await listReports(
    filters,
    admin.role === "KONSELOR" ? { assignedToId: admin.id } : {},
  );

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Laporan"
        description={
          admin.role === "KONSELOR"
            ? "Hanya laporan yang ditugaskan kepadamu."
            : "Daftar laporan tanpa menampilkan isi kronologi."
        }
      >
        <p className="rounded-md border border-border bg-card px-3 py-2 text-sm text-muted-foreground">
          <span className="font-semibold text-foreground tabular-nums">
            {reports.length}
          </span>{" "}
          laporan ditampilkan
        </p>
      </AdminPageHeader>

      <form
        method="get"
        className="admin-card grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1.4fr)_auto] lg:items-end"
      >
        <div>
          <label htmlFor="status" className="text-xs font-semibold text-muted-foreground">
            Status
          </label>
          <select
            id="status"
            name="status"
            defaultValue={filters.status ?? ""}
            className="admin-control mt-1.5"
          >
            <option value="">Semua status</option>
            {Object.entries(STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="category" className="text-xs font-semibold text-muted-foreground">
            Kategori
          </label>
          <select
            id="category"
            name="category"
            defaultValue={filters.category ?? ""}
            className="admin-control mt-1.5"
          >
            <option value="">Semua kategori</option>
            {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="q" className="text-xs font-semibold text-muted-foreground">
            Cari
          </label>
          <input
            id="q"
            name="q"
            defaultValue={filters.q ?? ""}
            maxLength={100}
            placeholder="ID laporan atau lokasi"
            className="admin-control mt-1.5"
          />
        </div>

        <div className="flex items-center gap-2 sm:col-span-2 lg:col-span-1">
          <button
            type="submit"
            className="inline-flex min-h-11 items-center rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Terapkan
          </button>
          <Link
            href="/admin/laporan"
            className="inline-flex min-h-11 items-center rounded-md px-3 text-sm font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            Reset
          </Link>
        </div>
      </form>

      {reports.length === 0 ? (
        <div className="admin-empty">
          <p className="font-medium">Tidak ada laporan yang cocok.</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Coba ubah filter atau kosongkan pencarian.
          </p>
        </div>
      ) : (
        <div className="admin-card overflow-x-auto">
          <table className="admin-table min-w-[760px]">
            <thead>
              <tr>
                <th scope="col">Laporan</th>
                <th scope="col">Kategori</th>
                <th scope="col">Status</th>
                <th scope="col" className="hidden md:table-cell">
                  Ditugaskan
                </th>
                <th scope="col" className="hidden lg:table-cell">
                  Aktivitas
                </th>
                <th scope="col">Tanggal</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((report) => (
                <tr key={report.id}>
                  <td>
                    <Link
                      href={`/admin/laporan/${report.id}`}
                      className="font-mono text-xs font-semibold text-primary underline-offset-4 hover:underline"
                    >
                      #{report.id.slice(-6)}
                    </Link>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {REPORTER_ROLE_LABELS[report.reporterRole] ?? report.reporterRole}
                    </p>
                  </td>
                  <td className="font-medium">
                    {CATEGORY_LABELS[report.category] ?? report.category}
                  </td>
                  <td>
                    <StatusBadge status={report.status} />
                  </td>
                  <td className="hidden text-muted-foreground md:table-cell">
                    {report.assignedTo?.name ?? "Belum ditugaskan"}
                  </td>
                  <td className="hidden text-xs text-muted-foreground lg:table-cell">
                    {report._count.messages} pesan · {report._count.evidences} bukti
                  </td>
                  <td className="text-xs whitespace-nowrap text-muted-foreground">
                    {dateFormatter.format(report.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
