import { redirect } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { HazardModerationButtons } from "@/components/admin/HazardModerationButtons";
import { getCurrentAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { HAZARD_CATEGORY_LABELS, MODERATION_LABELS } from "@/lib/labels";

const dateFormatter = new Intl.DateTimeFormat("id-ID", { dateStyle: "medium" });

const moderationStyles: Record<string, string> = {
  PENDING: "border-[#c9a53f] bg-[#f7dc85] text-[#3f3110]",
  APPROVED: "border-[#8fae9b] bg-[#e7f0e8] text-[#2c4a3d]",
  REJECTED: "border-[#c9a29a] bg-[#f6e2de] text-[#8a2f1d]",
};

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

  const pendingCount = points.filter((point) => point.status === "PENDING").length;

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Titik rawan"
        description="Usulan publik masuk sebagai pending. Hanya titik yang disetujui yang tampil di peta."
      >
        <p className="rounded-md border border-border bg-card px-3 py-2 text-sm text-muted-foreground">
          <span className="font-semibold text-foreground tabular-nums">
            {pendingCount}
          </span>{" "}
          menunggu moderasi
        </p>
      </AdminPageHeader>

      {points.length === 0 ? (
        <div className="admin-empty">
          <p className="text-sm text-muted-foreground">Belum ada usulan titik rawan.</p>
        </div>
      ) : (
        <ul className="admin-card divide-y divide-border">
          {points.map((point) => (
            <li key={point.id} className="px-5 py-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold">
                      {HAZARD_CATEGORY_LABELS[point.category] ?? point.category}
                    </p>
                    <span
                      className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-semibold whitespace-nowrap ${
                        moderationStyles[point.status] ??
                        "border-border bg-muted text-muted-foreground"
                      }`}
                    >
                      {MODERATION_LABELS[point.status] ?? point.status}
                    </span>
                  </div>
                  <p className="mt-1.5 max-w-[70ch] text-sm leading-relaxed text-muted-foreground">
                    {point.description}
                  </p>
                  <p className="mt-1.5 font-mono text-xs text-muted-foreground">
                    {point.lat.toFixed(5)}, {point.lng.toFixed(5)} ·{" "}
                    {dateFormatter.format(point.createdAt)}
                  </p>
                </div>
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
