import { prisma } from "./db";

export type Semester = {
  year: number;
  term: 1 | 2;
};

const MONTH_LABELS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "Mei",
  "Jun",
  "Jul",
  "Agu",
  "Sep",
  "Okt",
  "Nov",
  "Des",
];

export function parseSemester(value: string | null | undefined): Semester | null {
  const match = /^(\d{4})-([12])$/.exec(value ?? "");
  if (!match) {
    return null;
  }
  const year = Number(match[1]);
  if (year < 2000 || year > 2100) {
    return null;
  }
  return { year, term: Number(match[2]) as 1 | 2 };
}

export function currentSemester(): Semester {
  const now = new Date();
  return { year: now.getUTCFullYear(), term: now.getUTCMonth() < 6 ? 1 : 2 };
}

export function semesterLabel(semester: Semester): string {
  return `${semester.year} · Semester ${semester.term}`;
}

function semesterRange(semester: Semester): { start: Date; end: Date } {
  if (semester.term === 1) {
    return {
      start: new Date(Date.UTC(semester.year, 0, 1)),
      end: new Date(Date.UTC(semester.year, 6, 1)),
    };
  }
  return {
    start: new Date(Date.UTC(semester.year, 6, 1)),
    end: new Date(Date.UTC(semester.year + 1, 0, 1)),
  };
}

export type SemesterStats = {
  total: number;
  repliedCount: number;
  averageResponseHours: number | null;
  byStatus: { key: string; count: number }[];
  byCategory: { key: string; count: number }[];
  byMonth: { month: number; label: string; count: number }[];
};

export async function getSemesterStats(semester: Semester): Promise<SemesterStats> {
  const { start, end } = semesterRange(semester);

  const reports = await prisma.report.findMany({
    where: { createdAt: { gte: start, lt: end } },
    select: {
      status: true,
      category: true,
      createdAt: true,
      messages: {
        where: { sender: "ADMIN" },
        orderBy: { createdAt: "asc" },
        take: 1,
        select: { createdAt: true },
      },
    },
  });

  const statusMap = new Map<string, number>();
  const categoryMap = new Map<string, number>();
  const monthMap = new Map<number, number>();
  let responseTotalMs = 0;
  let repliedCount = 0;

  for (const report of reports) {
    statusMap.set(report.status, (statusMap.get(report.status) ?? 0) + 1);
    categoryMap.set(report.category, (categoryMap.get(report.category) ?? 0) + 1);
    const month = report.createdAt.getUTCMonth();
    monthMap.set(month, (monthMap.get(month) ?? 0) + 1);

    const firstReply = report.messages[0];
    if (firstReply) {
      const difference = firstReply.createdAt.getTime() - report.createdAt.getTime();
      if (difference >= 0) {
        responseTotalMs += difference;
        repliedCount += 1;
      }
    }
  }

  const firstMonth = semester.term === 1 ? 0 : 6;
  const byMonth = Array.from({ length: 6 }, (_, index) => {
    const month = firstMonth + index;
    return {
      month: month + 1,
      label: `${MONTH_LABELS[month]} ${semester.year}`,
      count: monthMap.get(month) ?? 0,
    };
  });

  return {
    total: reports.length,
    repliedCount,
    averageResponseHours:
      repliedCount > 0
        ? Math.round((responseTotalMs / repliedCount / 3_600_000) * 10) / 10
        : null,
    byStatus: [...statusMap.entries()]
      .map(([key, count]) => ({ key, count }))
      .sort((a, b) => b.count - a.count),
    byCategory: [...categoryMap.entries()]
      .map(([key, count]) => ({ key, count }))
      .sort((a, b) => b.count - a.count),
    byMonth,
  };
}

export function buildStatsCsv(semester: Semester, stats: SemesterStats): string {
  const rows: string[] = [
    "PELITA - Statistik Agregat",
    `Semester,${semester.year}-${semester.term}`,
    `Total laporan,${stats.total}`,
    `Laporan dengan balasan admin,${stats.repliedCount}`,
    `Rata-rata waktu respons (jam),${stats.averageResponseHours ?? ""}`,
    "",
    "Status,Jumlah",
    ...stats.byStatus.map((row) => `${row.key},${row.count}`),
    "",
    "Kategori,Jumlah",
    ...stats.byCategory.map((row) => `${row.key},${row.count}`),
    "",
    "Bulan,Jumlah",
    ...stats.byMonth.map((row) => `${row.label},${row.count}`),
    "",
    "Catatan: file ini hanya memuat agregat, tanpa isi laporan atau data pribadi.",
  ];
  return rows.join("\n");
}
