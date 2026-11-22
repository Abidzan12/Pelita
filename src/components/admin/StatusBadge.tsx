import { STATUS_LABELS } from "@/lib/labels";
import { cn } from "@/lib/utils";

const styles: Record<string, string> = {
  DITERIMA:
    "border-[var(--status-new-line)] bg-[var(--status-new-bg)] text-[var(--status-new-ink)]",
  DIVERIFIKASI:
    "border-[var(--status-verified-line)] bg-[var(--status-verified-bg)] text-[var(--status-verified-ink)]",
  DALAM_PENANGANAN:
    "border-[var(--status-progress-line)] bg-[var(--status-progress-bg)] text-[var(--status-progress-ink)]",
  SELESAI:
    "border-[var(--status-done-line)] bg-[var(--status-done-bg)] text-[var(--status-done-ink)]",
  DITOLAK:
    "border-[var(--status-rejected-line)] bg-[var(--status-rejected-bg)] text-[var(--status-rejected-ink)]",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-semibold whitespace-nowrap",
        styles[status] ?? "border-border bg-muted text-muted-foreground",
      )}
    >
      {STATUS_LABELS[status] ?? status}
    </span>
  );
}
