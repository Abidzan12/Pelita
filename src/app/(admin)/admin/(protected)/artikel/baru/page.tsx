import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { ArticleEditor } from "@/components/admin/ArticleEditor";
import { getCurrentAdmin } from "@/lib/auth";

export default async function NewArticlePage() {
  const admin = await getCurrentAdmin();
  if (!admin) {
    redirect("/admin/login");
  }
  if (admin.role !== "SATGAS" && admin.role !== "SUPER_ADMIN") {
    redirect("/admin");
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
          <AdminPageHeader
            title="Tulis artikel"
            description="Gunakan bahasa yang tenang dan tidak menghakimi."
          />
        </div>
      </div>
      <ArticleEditor />
    </div>
  );
}
