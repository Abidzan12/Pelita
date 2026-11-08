import { STATUS_LABELS } from "@/lib/labels";
import { cn } from "@/lib/utils";

const styles: Record<string, string> = {
  DITERIMA: "border-primary/30 bg-secondary text-secondary-foreground",
  DIVERIFIKASI: "border-sky-300 bg-sky-50 text-sky-800",
  DALAM_PENANGANAN: "border-amber-300 bg-amber-50 text-amber-900",
  SELESAI: "border-emerald-300 bg-emerald-50 text-emerald-800",
  DITOLAK: "border-destructive/30 bg-destructive/5 text-destructive",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium",
        styles[status] ?? "border-border bg-muted text-muted-foreground",
      )}
    >
      {STATUS_LABELS[status] ?? status}
    </span>
  );
}
