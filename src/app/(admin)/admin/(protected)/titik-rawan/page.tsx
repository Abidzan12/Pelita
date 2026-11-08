import { redirect } from "next/navigation";
import { HazardModerationButtons } from "@/components/admin/HazardModerationButtons";
import { getCurrentAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { HAZARD_CATEGORY_LABELS, MODERATION_LABELS } from "@/lib/labels";

const dateFormatter = new Intl.DateTimeFormat("id-ID", { dateStyle: "medium" });

export default async function AdminHazardPointsPage() {
  const admin = await getCurrentAdmin();
  if (!admin) {
    redirect("/admin/login");
  }
  if (admin.role !== "SATGAS" && admin.role !== "SUPER_ADMIN") {
    redirect("/admin");
  }

  const points = await prisma.hazardPoint.findMany({
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    take: 200,
    select: {
      id: true,
      lat: true,
      lng: true,
      category: true,
      description: true,
      status: true,
      createdAt: true,
    },
  });

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Titik rawan</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Usulan publik masuk sebagai pending. Hanya titik yang disetujui yang tampil di
        peta.
      </p>

      {points.length === 0 ? (
        <p className="mt-6 rounded-lg border border-dashed border-border p-8 text-sm text-muted-foreground">
          Belum ada usulan titik rawan.
        </p>
      ) : (
        <ul className="mt-6 divide-y divide-border rounded-lg border border-border bg-card">
          {points.map((point) => (
            <li key={point.id} className="px-4 py-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-medium">
                    {HAZARD_CATEGORY_LABELS[point.category] ?? point.category}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {point.description}
                  </p>
                  <p className="mt-1 font-mono text-xs text-muted-foreground">
                    {point.lat.toFixed(5)}, {point.lng.toFixed(5)} ·{" "}
                    {dateFormatter.format(point.createdAt)}
                  </p>
                </div>
                <span className="rounded-md border border-border bg-muted px-2 py-0.5 text-xs font-medium">
                  {MODERATION_LABELS[point.status] ?? point.status}
                </span>
              </div>
              <div className="mt-3">
                <HazardModerationButtons pointId={point.id} status={point.status} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
