import type { DisplayMatchStatus } from "@/lib/knockout-display";

type StatusBadgeProps = {
  status: DisplayMatchStatus | "passed" | "failed";
};

const statusClasses: Record<StatusBadgeProps["status"], string> = {
  live: "bg-red-500/20 text-red-200 ring-red-400/40",
  finished: "bg-emerald-500/15 text-emerald-200 ring-emerald-400/30",
  scheduled: "bg-blue-500/15 text-blue-200 ring-blue-400/30",
  needs_review: "bg-amber-500/20 text-amber-200 ring-amber-400/40",
  passed: "bg-emerald-500/15 text-emerald-200 ring-emerald-400/30",
  failed: "bg-amber-500/20 text-amber-200 ring-amber-400/40",
};

const labels: Record<StatusBadgeProps["status"], string> = {
  live: "Live",
  finished: "Finished",
  scheduled: "Scheduled",
  needs_review: "Needs review",
  passed: "Passed",
  failed: "Needs review",
};

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex whitespace-nowrap rounded-md px-2 py-1 text-[11px] font-black uppercase ring-1 ${statusClasses[status]}`}
    >
      {labels[status]}
    </span>
  );
}
