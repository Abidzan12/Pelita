import Link from "next/link";
import { MapExperience } from "@/components/MapExperience";
import { prisma } from "@/lib/db";
import type { MapPoint } from "@/components/MapView";

export const dynamic = "force-dynamic";

function readCenter(): [number, number] {
  const configuredLat = Number(process.env.CAMPUS_MAP_LAT);
  const configuredLng = Number(process.env.CAMPUS_MAP_LNG);

  if (
    Number.isFinite(configuredLat) &&
    Number.isFinite(configuredLng) &&
    configuredLat !== 0 &&
    configuredLng !== 0
  ) {
    return [configuredLat, configuredLng];
  }

  return [-7.7713847, 110.3774998];
}

// Titik survei tim, disesuaikan dengan posisi denah FT, Hukum, FISIP, dan FEB.
const SURVEY_POINTS: MapPoint[] = [
  {
    id: "survey-1",
    lat: -7.7732,
    lng: 110.3862,
    category: "KANTIN",
    source: "SURVEY",
    description:
      "Kantin Jawara & Foodcourt FT: area ramai kantin dan foodcourt, minim pengawasan langsung di sudut tertentu.",
  },
  {
    id: "survey-2",
    lat: -7.772,
    lng: 110.387,
    category: "LAINNYA",
    source: "SURVEY",
    description:
      "GOR UNY & sekitarnya: area luas dan terbuka yang cenderung sepi di luar jam kegiatan olahraga.",
  },
  {
    id: "survey-3",
    lat: -7.774,
    lng: 110.3845,
    category: "PARKIRAN",
    source: "SURVEY",
    description:
      "Area parkir (samping IDB / FT): area terbuka luas yang sepi saat jam kuliah berlangsung.",
  },
  {
    id: "survey-4",
    lat: -7.7748,
    lng: 110.3855,
    category: "GEDUNG",
    source: "SURVEY",
    description:
      "Koridor Gedung LPTK & lab/bengkel FT: area gedung atas yang cukup sepi pada jam tertentu.",
  },
  {
    id: "survey-5",
    lat: -7.7762,
    lng: 110.385,
    category: "GEDUNG",
    source: "SURVEY",
    description:
      "Sekitar Fakultas Hukum & FISIP: lorong penghubung antargedung yang minim keramaian malam hari.",
  },
  {
    id: "survey-6",
    lat: -7.7753,
    lng: 110.3862,
    category: "LAINNYA",
    source: "SURVEY",
    description:
      "Jembatan Kemahasiswaan & KOPMA: titik transisi jalur pejalan kaki yang minim penerangan.",
  },
  {
    id: "survey-7",
    lat: -7.7765,
    lng: 110.3838,
    category: "LAINNYA",
    source: "SURVEY",
    description:
      "Depan Angkringan Felix: area komersial luar kampus tempat nongkrong larut malam.",
  },
];

function MapPlateArt() {
  return (
    <svg viewBox="0 0 420 340" aria-hidden="true" className="w-full max-w-[400px]">
      <g transform="rotate(-2 210 170)">
        <rect
          x="44"
          y="40"
          width="332"
          height="252"
          fill="#fff7e9"
          stroke="#c7c9ba"
          strokeWidth="1.5"
        />
        <path
          d="M44 118h332M44 214h332M140 40v252M266 40v252"
          stroke="#e9dfc7"
          strokeWidth="16"
        />
        <path
          d="M44 118h332M44 214h332M140 40v252M266 40v252"
          stroke="#c7c9ba"
          strokeWidth="1"
          strokeDasharray="7 6"
        />
        <g fill="#e6ede5" stroke="#bfd0c7">
          <rect x="50" y="46" width="76" height="58" />
          <rect x="154" y="46" width="98" height="58" />
          <rect x="154" y="126" width="98" height="74" />
          <rect x="280" y="126" width="90" height="74" />
          <rect x="50" y="222" width="76" height="64" />
        </g>
        <g fill="#f0e7d4" stroke="#d8cfb9">
          <rect x="280" y="46" width="90" height="58" />
          <rect x="154" y="222" width="98" height="64" />
        </g>
        <g fill="#ee8064" stroke="#fff7e9" strokeWidth="2">
          <circle cx="196" cy="78" r="7" />
          <circle cx="312" cy="168" r="7" />
        </g>
        <circle cx="96" cy="252" r="7" fill="#122744" stroke="#fff7e9" strokeWidth="2" />
        <circle
          cx="196"
          cy="168"
          r="23"
          fill="none"
          stroke="#d3543d"
          strokeWidth="1.2"
          strokeDasharray="4 5"
        />
        <circle cx="196" cy="168" r="13" fill="#f1c957" stroke="#122744" strokeWidth="2.5" />
      </g>
    </svg>
  );
}

export default async function MapPage() {
  const center = readCenter();

  const rawPoints = await prisma.hazardPoint
    .findMany({
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
    })
    .catch(() => null);

  const approvedPoints: MapPoint[] = (rawPoints ?? []).map((point) => ({
    ...point,
    source: "USULAN" as const,
  }));

  return (
    <div className="poster-page">
      <section className="poster-masthead">
        <div aria-hidden="true" className="poster-sun" />
        <div className="relative z-[1] mx-auto grid max-w-6xl gap-8 px-5 pt-12 pb-24 sm:px-8 sm:pt-14 lg:grid-cols-[1.08fr_.92fr] lg:items-center lg:gap-10 lg:px-10">
          <div>
            <h1 className="poster-title">
              Kenali <span className="hero-highlight">titik rawan</span> di kampus
            </h1>
            <p className="poster-lead">
              Lokasi umum yang perlu diwaspadai, misalnya area dengan penerangan minim atau
              jalur sepi. Titik rawan tidak terhubung ke laporan tertentu dan tidak memuat
              data pribadi.
            </p>
            <p className="report-alert-line">
              Dalam bahaya sekarang?{" "}
              <Link href="/darurat" className="report-alert-link">
                Lihat kontak darurat
              </Link>
            </p>
          </div>
          <div className="hidden lg:block">
            <MapPlateArt />
          </div>
        </div>
        <div className="hero-bottom-rule" aria-hidden="true">
          <span />
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-4 pb-16 sm:px-8 sm:pb-20 lg:px-10 lg:pb-24">
        <MapExperience
          center={center}
          points={[...SURVEY_POINTS, ...approvedPoints]}
          approvedUnavailable={rawPoints === null}
        />

        <p className="mt-10 max-w-[64ch] text-sm leading-relaxed text-[#465460]">
          Informasi titik rawan dapat berubah. Utamakan keselamatanmu: hindari area yang
          terasa tidak aman, dan pilih jalur yang terang serta ramai.
        </p>
      </div>
    </div>
  );
}
