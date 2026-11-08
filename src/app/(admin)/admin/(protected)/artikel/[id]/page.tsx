import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArticleEditor } from "@/components/admin/ArticleEditor";
import { getCurrentAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";

export default async function EditArticlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    redirect("/admin/login");
  }
  if (admin.role !== "SATGAS" && admin.role !== "SUPER_ADMIN") {
    redirect("/admin");
  }

  const { id } = await params;
  const article = await prisma.article.findUnique({
    where: { id },
    select: {
      id: true,
      slug: true,
      title: true,
      summary: true,
      bodyMd: true,
      category: true,
      published: true,
    },
  });

  if (!article) {
    notFound();
  }

  return (
    <div>
      <Link
        href="/admin/artikel"
        className="text-sm font-medium text-primary underline-offset-4 hover:underline"
      >
        ← Semua artikel
      </Link>
      <h1 className="mt-3 text-2xl font-semibold tracking-tight">Edit artikel</h1>
      <p className="mt-1 text-sm text-muted-foreground">{article.title}</p>
      <div className="mt-6">
        <ArticleEditor article={article} />
      </div>
    </div>
  );
}
