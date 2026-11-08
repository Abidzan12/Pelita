import Link from "next/link";
import { redirect } from "next/navigation";
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
    <div>
      <Link
        href="/admin/artikel"
        className="text-sm font-medium text-primary underline-offset-4 hover:underline"
      >
        ← Semua artikel
      </Link>
      <h1 className="mt-3 text-2xl font-semibold tracking-tight">Tulis artikel</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Gunakan bahasa yang tenang dan tidak menghakimi.
      </p>
      <div className="mt-6">
        <ArticleEditor />
      </div>
    </div>
  );
}
