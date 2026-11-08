import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { ARTICLE_CATEGORY_LABELS } from "@/lib/labels";

const dateFormatter = new Intl.DateTimeFormat("id-ID", { dateStyle: "medium" });

export default async function AdminArticlesPage() {
  const admin = await getCurrentAdmin();
  if (!admin) {
    redirect("/admin/login");
  }
  if (admin.role !== "SATGAS" && admin.role !== "SUPER_ADMIN") {
    redirect("/admin");
  }

  const articles = await prisma.article.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      slug: true,
      title: true,
      category: true,
      published: true,
      createdAt: true,
    },
  });

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Artikel edukasi</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Artikel terbit tampil di halaman edukasi publik.
          </p>
        </div>
        <Link
          href="/admin/artikel/baru"
          className="inline-flex min-h-11 items-center rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
        >
          Tulis artikel
        </Link>
      </div>

      {articles.length === 0 ? (
        <p className="mt-6 rounded-lg border border-dashed border-border p-8 text-sm text-muted-foreground">
          Belum ada artikel. Mulai dengan menulis artikel baru.
        </p>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-lg border border-border bg-card">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b border-border bg-muted/50 text-xs text-muted-foreground">
              <tr>
                <th scope="col" className="px-4 py-3 font-medium">
                  Judul
                </th>
                <th scope="col" className="px-4 py-3 font-medium">
                  Kategori
                </th>
                <th scope="col" className="px-4 py-3 font-medium">
                  Status
                </th>
                <th scope="col" className="px-4 py-3 font-medium">
                  Dibuat
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {articles.map((article) => (
                <tr key={article.id} className="hover:bg-muted/40">
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/artikel/${article.id}`}
                      className="font-medium text-primary underline-offset-4 hover:underline"
                    >
                      {article.title}
                    </Link>
                    <p className="font-mono text-xs text-muted-foreground">
                      /{article.slug}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    {ARTICLE_CATEGORY_LABELS[article.category] ?? article.category}
                  </td>
                  <td className="px-4 py-3">
                    {article.published ? (
                      <span className="rounded-md border border-emerald-300 bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-800">
                        Terbit
                      </span>
                    ) : (
                      <span className="rounded-md border border-border bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                        Draf
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {dateFormatter.format(article.createdAt)}
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
