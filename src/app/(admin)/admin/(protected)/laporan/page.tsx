import Link from "next/link";
import { redirect } from "next/navigation";
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
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Laporan</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {admin.role === "KONSELOR"
              ? "Hanya laporan yang ditugaskan kepadamu."
              : "Daftar laporan tanpa menampilkan isi kronologi."}
          </p>
        </div>
        <p className="text-sm text-muted-foreground">
          {reports.length} laporan ditampilkan
        </p>
      </div>

      <form
        method="get"
        className="mt-5 flex flex-wrap items-end gap-3 rounded-lg border border-border bg-card p-4"
      >
        <div className="min-w-40 flex-1">
          <label htmlFor="status" className="text-xs font-medium text-muted-foreground">
            Status
          </label>
          <select
            id="status"
            name="status"
            defaultValue={filters.status ?? ""}
            className="mt-1 h-11 w-full rounded-lg border border-input bg-background px-3 text-sm"
          >
            <option value="">Semua status</option>
            {Object.entries(STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <div className="min-w-40 flex-1">
          <label htmlFor="category" className="text-xs font-medium text-muted-foreground">
            Kategori
          </label>
          <select
            id="category"
            name="category"
            defaultValue={filters.category ?? ""}
            className="mt-1 h-11 w-full rounded-lg border border-input bg-background px-3 text-sm"
          >
            <option value="">Semua kategori</option>
            {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <div className="min-w-48 flex-[2]">
          <label htmlFor="q" className="text-xs font-medium text-muted-foreground">
            Cari
          </label>
          <input
            id="q"
            name="q"
            defaultValue={filters.q ?? ""}
            maxLength={100}
            placeholder="ID laporan atau lokasi"
            className="mt-1 h-11 w-full rounded-lg border border-input bg-background px-3 text-sm"
          />
        </div>

        <button
          type="submit"
          className="inline-flex min-h-11 items-center rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
        >
          Terapkan
        </button>
        <Link
          href="/admin/laporan"
          className="inline-flex min-h-11 items-center px-2 text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          Reset
        </Link>
      </form>

      {reports.length === 0 ? (
        <div className="mt-8 rounded-lg border border-dashed border-border p-10 text-center">
          <p className="font-medium">Tidak ada laporan yang cocok.</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Coba ubah filter atau kosongkan pencarian.
          </p>
        </div>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-lg border border-border bg-card">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="border-b border-border bg-muted/50 text-xs text-muted-foreground">
              <tr>
                <th scope="col" className="px-4 py-3 font-medium">
                  Laporan
                </th>
                <th scope="col" className="px-4 py-3 font-medium">
                  Kategori
                </th>
                <th scope="col" className="px-4 py-3 font-medium">
                  Status
                </th>
                <th scope="col" className="hidden px-4 py-3 font-medium md:table-cell">
                  Ditugaskan
                </th>
                <th scope="col" className="hidden px-4 py-3 font-medium lg:table-cell">
                  Aktivitas
                </th>
                <th scope="col" className="px-4 py-3 font-medium">
                  Tanggal
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {reports.map((report) => (
                <tr key={report.id} className="hover:bg-muted/40">
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/laporan/${report.id}`}
                      className="font-mono text-xs font-medium text-primary underline-offset-4 hover:underline"
                    >
                      #{report.id.slice(-6)}
                    </Link>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {REPORTER_ROLE_LABELS[report.reporterRole] ?? report.reporterRole}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    {CATEGORY_LABELS[report.category] ?? report.category}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={report.status} />
                    {report.status === "DITERIMA" ? (
                      <span className="mt-1 block text-xs font-medium text-primary">
                        Baru
                      </span>
                    ) : null}
                  </td>
                  <td className="hidden px-4 py-3 text-muted-foreground md:table-cell">
                    {report.assignedTo?.name ?? "Belum ditugaskan"}
                  </td>
                  <td className="hidden px-4 py-3 text-xs text-muted-foreground lg:table-cell">
                    {report._count.messages} pesan · {report._count.evidences} bukti
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
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
