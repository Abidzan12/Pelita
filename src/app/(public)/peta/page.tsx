import Link from "next/link";
import { MapExperience } from "@/components/MapExperience";
import { prisma } from "@/lib/db";
import { HAZARD_CATEGORY_LABELS } from "@/lib/labels";

export const dynamic = "force-dynamic";

function readCenter(): [number, number] | null {
  const latRaw = process.env.CAMPUS_MAP_LAT?.trim();
  const lngRaw = process.env.CAMPUS_MAP_LNG?.trim();
  if (!latRaw || !lngRaw) {
    return null;
  }
  const lat = Number(latRaw);
  const lng = Number(lngRaw);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return null;
  }
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    return null;
  }
  return [lat, lng];
}

export default async function MapPage() {
  const center = readCenter();

  const points = await prisma.hazardPoint.findMany({
    where: { status: "APPROVED" },
    orderBy: { createdAt: "desc" },
    take: 200,
    select: {
      id: true,
      lat: true,
      lng: true,
      category: true,
      description: true,
    },
  });

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <p className="text-sm font-semibold tracking-wide text-primary uppercase">
        Peta kampus
      </p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight">Titik rawan</h1>
      <p className="mt-3 max-w-2xl leading-relaxed text-muted-foreground">
        Lokasi umum yang perlu diwaspadai, misalnya area dengan penerangan minim atau
        jalur sepi. Titik rawan tidak terhubung ke laporan tertentu dan tidak memuat data
        pribadi.
      </p>

      <div className="mt-6">
        {center ? (
          <MapExperience center={center} points={points} />
        ) : (
          <div className="rounded-lg border border-border bg-card p-6">
            <h2 className="font-semibold">Peta belum tersedia</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Koordinat kampus belum diisi oleh tim, jadi peta belum dapat ditampilkan.
              Daftar titik rawan yang sudah disetujui tetap tersedia di bawah.
            </p>
          </div>
        )}
      </div>

      <section aria-labelledby="daftar-titik" className="mt-8">
        <h2 id="daftar-titik" className="text-lg font-semibold">
          Daftar titik disetujui
        </h2>
        {points.length === 0 ? (
          <p className="mt-2 rounded-lg border border-dashed border-border p-6 text-sm text-muted-foreground">
            Belum ada titik rawan yang disetujui.
          </p>
        ) : (
          <ul className="mt-3 divide-y divide-border border-y border-border text-sm">
            {points.map((point) => (
              <li key={point.id} className="py-3">
                <p className="font-medium">
                  {HAZARD_CATEGORY_LABELS[point.category] ?? point.category}
                </p>
                <p className="mt-1 text-muted-foreground">{point.description}</p>
                <p className="mt-1 font-mono text-xs text-muted-foreground">
                  {point.lat.toFixed(5)}, {point.lng.toFixed(5)}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <p className="mt-8 text-sm leading-relaxed text-muted-foreground">
        Informasi titik rawan dapat berubah. Utamakan keselamatanmu dan hindari area yang
        terasa tidak aman.{" "}
        <Link
          href="/darurat"
          className="font-medium text-primary underline-offset-4 hover:underline"
        >
          Butuh bantuan sekarang?
        </Link>
      </p>
    </div>
  );
}
