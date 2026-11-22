import type { LucideIcon } from "lucide-react";

const tones = {
  default: "bg-secondary text-primary",
  new: "bg-[var(--status-new-bg)] text-[var(--status-new-ink)]",
  progress: "bg-[var(--status-progress-bg)] text-[var(--status-progress-ink)]",
  done: "bg-[var(--status-done-bg)] text-[var(--status-done-ink)]",
} as const;

export function AdminStat({
  label,
  value,
  icon: Icon,
  tone = "default",
  hint,
}: {
  label: string;
  value: number | string;
  icon: LucideIcon;
  tone?: keyof typeof tones;
  hint?: string;
}) {
  return (
    <div className="admin-card p-4">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <span
          aria-hidden="true"
          className={`grid size-8 shrink-0 place-items-center rounded-md ${tones[tone]}`}
        >
          <Icon className="size-4" />
        </span>
      </div>
      <p className="mt-3 text-3xl font-semibold tracking-tight tabular-nums">{value}</p>
      {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}
