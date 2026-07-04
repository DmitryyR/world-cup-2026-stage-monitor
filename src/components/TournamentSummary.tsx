import { CalendarClock, CheckCircle2, CircleDashed, Trophy } from "lucide-react";
import type { TournamentState } from "@/domain/types";
import { formatDateTime } from "@/lib/format";
import { StageBadge } from "./StageBadge";

type TournamentSummaryProps = {
  state: TournamentState | null;
};

export function TournamentSummary({ state }: TournamentSummaryProps) {
  const metrics = [
    {
      label: "Completed",
      value: state?.completedMatches ?? 0,
      icon: CheckCircle2,
    },
    {
      label: "Remaining",
      value: state?.remainingMatches ?? 0,
      icon: CircleDashed,
    },
    {
      label: "Champion",
      value: state?.champion ?? "Pending",
      icon: Trophy,
    },
    {
      label: "Last Check",
      value: state ? formatDateTime(state.lastCheckedAt) : "Not run",
      icon: CalendarClock,
    },
  ];

  return (
    <section className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-normal text-slate-950">
            Tournament Summary
          </h1>
          <div className="mt-3">
            <StageBadge stage={state?.currentStage} />
          </div>
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric) => {
          const Icon = metric.icon;

          return (
            <div
              key={metric.label}
              className="rounded-md border border-slate-200 bg-white p-4"
            >
              <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
                <Icon aria-hidden="true" size={17} />
                {metric.label}
              </div>
              <div className="mt-3 text-2xl font-semibold text-slate-950">
                {metric.value}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
