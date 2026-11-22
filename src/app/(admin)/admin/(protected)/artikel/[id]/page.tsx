import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
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
      imageAlt: true,
      imageStorageKey: true,
    },
  });

  if (!article) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/artikel"
          className="inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-primary underline-offset-4 hover:underline"
        >
          <ArrowLeft aria-hidden="true" className="size-4" />
          Semua artikel
        </Link>
        <div className="mt-2">
          <AdminPageHeader title="Edit artikel" description={article.title} />
        </div>
      </div>
      <ArticleEditor article={article} />
    </div>
  );
}
