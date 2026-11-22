"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ARTICLE_CATEGORY_LABELS } from "@/lib/labels";

type ArticleInput = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  bodyMd: string;
  category: string;
  published: boolean;
  imageAlt: string | null;
  imageStorageKey: string | null;
};

export function ArticleEditor({ article }: { article?: ArticleInput }) {
  const router = useRouter();
  const [slug, setSlug] = useState(article?.slug ?? "");
  const [title, setTitle] = useState(article?.title ?? "");
  const [summary, setSummary] = useState(article?.summary ?? "");
  const [bodyMd, setBodyMd] = useState(article?.bodyMd ?? "");
  const [category, setCategory] = useState(article?.category ?? "UMUM");
  const [published, setPublished] = useState(article?.published ?? false);
  const [imageAlt, setImageAlt] = useState(article?.imageAlt ?? "");
  const [image, setImage] = useState<File | null>(null);
  const [removeImage, setRemoveImage] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  function selectImage(event: ChangeEvent<HTMLInputElement>) {
    const selected = event.target.files?.[0] ?? null;
    setImage(selected);
    setRemoveImage(false);
    setImagePreview(selected ? URL.createObjectURL(selected) : null);
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const form = new FormData();
      form.set("slug", slug);
      form.set("title", title);
      form.set("summary", summary);
      form.set("bodyMd", bodyMd);
      form.set("category", category);
      form.set("published", String(published));
      form.set("imageAlt", imageAlt);
      form.set("removeImage", String(removeImage));
      if (image) form.set("image", image);

      const response = await fetch(
        article ? `/api/admin/articles/${article.id}` : "/api/admin/articles",
        {
          method: article ? "PATCH" : "POST",
          body: form,
        },
      );
      const payload = (await response.json().catch(() => null)) as {
        ok: boolean;
        error?: string;
      } | null;

      if (!response.ok || !payload?.ok) {
        setError(payload?.error ?? "Artikel belum bisa disimpan.");
        return;
      }

      router.push("/admin/artikel");
      router.refresh();
    } catch {
      setError("Koneksi terputus. Artikel belum disimpan.");
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (!article) {
      return;
    }
    setDeleting(true);
    setError(null);
    try {
      const response = await fetch(`/api/admin/articles/${article.id}`, {
        method: "DELETE",
      });
      const payload = (await response.json().catch(() => null)) as {
        ok: boolean;
        error?: string;
      } | null;
      if (!response.ok || !payload?.ok) {
        setError(payload?.error ?? "Artikel belum bisa dihapus.");
        return;
      }
      router.push("/admin/artikel");
      router.refresh();
    } catch {
      setError("Koneksi terputus. Artikel belum dihapus.");
    } finally {
      setDeleting(false);
      setConfirmDelete(false);
    }
  }

  return (
    <form onSubmit={save} className="admin-card space-y-6 p-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="title">Judul</Label>
          <Input
            id="title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            required
            maxLength={200}
            className="mt-2 h-11 bg-background"
          />
        </div>
        <div>
          <Label htmlFor="slug">Slug URL</Label>
          <Input
            id="slug"
            value={slug}
            onChange={(event) => setSlug(event.target.value)}
            required
            maxLength={80}
            placeholder="contoh-cara-melapor"
            className="mt-2 h-11 bg-background font-mono text-sm"
          />
          <p className="mt-1 text-xs text-muted-foreground">
            Huruf kecil, angka, dan tanda hubung.
          </p>
        </div>
      </div>

      <div className="space-y-3 border-t border-border pt-6">
        <div>
          <Label htmlFor="article-image">Gambar artikel (opsional)</Label>
          <Input
            id="article-image"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={selectImage}
            className="mt-2 h-auto min-h-11 bg-background file:mr-3 file:rounded-md file:border-0 file:bg-secondary file:px-3 file:py-2 file:text-sm file:font-medium"
          />
          <p className="mt-1 text-xs text-muted-foreground">
            JPG, PNG, atau WebP; maksimal 5 MB. Metadata gambar akan dihapus saat
            diproses.
          </p>
        </div>
        <div>
          <Label htmlFor="imageAlt">Deskripsi gambar untuk pembaca layar</Label>
          <Input
            id="imageAlt"
            value={imageAlt}
            onChange={(event) => setImageAlt(event.target.value)}
            maxLength={200}
            required={Boolean(image || (article?.imageStorageKey && !removeImage))}
            placeholder="Jelaskan isi gambar secara singkat"
            className="mt-2 h-11 bg-background"
          />
        </div>
        {imagePreview || article?.imageStorageKey ? (
          <div className="max-w-sm">
            {!removeImage ? (
              imagePreview ? (
                // eslint-disable-next-line @next/next/no-img-element -- A local object URL is used for the selected-file preview.
                <img
                  src={imagePreview}
                  alt={imageAlt || "Pratinjau gambar artikel"}
                  className="aspect-[16/9] max-h-56 w-full rounded-md border border-border object-cover"
                />
              ) : article?.slug ? (
                <div className="relative aspect-[16/9] max-h-56 overflow-hidden rounded-md border border-border bg-muted">
                  <Image
                    src={`/api/articles/${article.slug}/image`}
                    alt={imageAlt || "Pratinjau gambar artikel"}
                    fill
                    sizes="384px"
                    className="object-cover"
                  />
                </div>
              ) : null
            ) : null}
            {article?.imageStorageKey ? (
              <label className="mt-2 flex min-h-11 items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={removeImage}
                  onChange={(event) => setRemoveImage(event.target.checked)}
                  className="size-4 accent-primary"
                />
                Hapus gambar saat menyimpan
              </label>
            ) : null}
          </div>
        ) : null}
      </div>

      <div className="border-t border-border pt-6">
        <Label htmlFor="summary">Ringkasan</Label>
        <Textarea
          id="summary"
          value={summary}
          onChange={(event) => setSummary(event.target.value)}
          required
          maxLength={500}
          rows={2}
          className="mt-2 bg-background"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="category">Kategori</Label>
          <select
            id="category"
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            className="admin-control mt-2"
          >
            {Object.entries(ARTICLE_CATEGORY_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-end">
          <label className="flex min-h-11 items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={published}
              onChange={(event) => setPublished(event.target.checked)}
              className="size-4 accent-primary"
            />
            Terbitkan artikel
          </label>
        </div>
      </div>

      <div className="border-t border-border pt-6">
        <Label htmlFor="bodyMd">Isi artikel (Markdown)</Label>
        <Textarea
          id="bodyMd"
          value={bodyMd}
          onChange={(event) => setBodyMd(event.target.value)}
          required
          rows={18}
          className="mt-2 bg-background font-mono text-sm"
        />
        <p className="mt-1 text-xs text-muted-foreground">
          Markdown akan disanitasi sebelum ditampilkan ke publik.
        </p>
      </div>

      {error ? (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      ) : null}

      <div className="flex flex-wrap items-center gap-3 border-t border-border pt-5">
        <Button type="submit" disabled={saving} className="h-11 px-5">
          {saving ? "Menyimpan..." : "Simpan artikel"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/admin/artikel")}
          className="h-11 px-5"
        >
          Batal
        </Button>

        {article ? (
          <span className="ml-auto">
            {confirmDelete ? (
              <span className="inline-flex items-center gap-2">
                <Button
                  type="button"
                  variant="destructive"
                  onClick={remove}
                  disabled={deleting}
                  className="h-11 px-4"
                >
                  {deleting ? "Menghapus..." : "Yakin hapus"}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setConfirmDelete(false)}
                  className="h-11 px-4"
                >
                  Batal
                </Button>
              </span>
            ) : (
              <Button
                type="button"
                variant="ghost"
                onClick={() => setConfirmDelete(true)}
                className="h-11 px-4 text-destructive"
              >
                Hapus artikel
              </Button>
            )}
          </span>
        ) : null}
      </div>
    </form>
  );
}
