import Link from "next/link";
import { redirect } from "next/navigation";
import { Plus } from "lucide-react";
import { AdminArticleDeleteButton } from "@/components/admin/AdminArticleDeleteButton";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
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
    <div className="space-y-6">
      <AdminPageHeader
        title="Artikel edukasi"
        description="Artikel terbit tampil di halaman edukasi publik."
      >
        <Link
          href="/admin/artikel/baru"
          className="inline-flex min-h-11 items-center gap-2 rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <Plus aria-hidden="true" className="size-4" />
          Tulis artikel
        </Link>
      </AdminPageHeader>

      {articles.length === 0 ? (
        <div className="admin-empty">
          <p className="font-medium">Belum ada artikel.</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Mulai dengan menulis artikel baru.
          </p>
        </div>
      ) : (
        <div className="admin-card overflow-x-auto">
          <table className="admin-table min-w-[640px]">
            <thead>
              <tr>
                <th scope="col">Judul</th>
                <th scope="col">Kategori</th>
                <th scope="col">Status</th>
                <th scope="col">Dibuat</th>
                <th scope="col" className="text-right">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody>
              {articles.map((article) => (
                <tr key={article.id}>
                  <td>
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
                  <td>{ARTICLE_CATEGORY_LABELS[article.category] ?? article.category}</td>
                  <td>
                    {article.published ? (
                      <span className="inline-flex items-center rounded-md border border-[#8fae9b] bg-[#e7f0e8] px-2 py-0.5 text-xs font-semibold text-[#2c4a3d]">
                        Terbit
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-md border border-border bg-muted px-2 py-0.5 text-xs font-semibold text-muted-foreground">
                        Draf
                      </span>
                    )}
                  </td>
                  <td className="text-xs whitespace-nowrap text-muted-foreground">
                    {dateFormatter.format(article.createdAt)}
                  </td>
                  <td className="text-right whitespace-nowrap">
                    <AdminArticleDeleteButton
                      articleId={article.id}
                      articleTitle={article.title}
                    />
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
