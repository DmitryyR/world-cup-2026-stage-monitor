import { CalendarClock, CheckCircle2, CircleDashed, Trophy } from "lucide-react";
import type { TournamentState } from "@/domain/types";
import { formatDateTime } from "@/lib/format";
import { getTeamDisplayName } from "@/lib/team-flags";

type TournamentSummaryProps = {
  state: TournamentState | null;
};

const toneClasses = {
  emerald: "bg-emerald-600 text-white",
  blue: "bg-blue-600 text-white",
  amber: "bg-amber-500 text-white",
  violet: "bg-violet-600 text-white",
};

export function TournamentSummary({ state }: TournamentSummaryProps) {
  const metrics = [
    {
      label: "Completed",
      value: state?.completedMatches ?? 0,
      icon: CheckCircle2,
      tone: "emerald",
    },
    {
      label: "Remaining",
      value: state?.remainingMatches ?? 0,
      icon: CircleDashed,
      tone: "blue",
    },
    {
      label: "Champion",
      value: state?.champion ? getTeamDisplayName(state.champion) : "Pending",
      icon: Trophy,
      tone: "amber",
    },
    {
      label: "Last Check",
      value: state ? formatDateTime(state.lastCheckedAt) : "Not run",
      icon: CalendarClock,
      tone: "violet",
    },
  ];

  return (
    <section className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          const toneClass = toneClasses[metric.tone as keyof typeof toneClasses];

          return (
            <div
              key={metric.label}
              className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-center gap-4">
                <span
                  className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full ${toneClass}`}
                >
                  <Icon aria-hidden="true" size={27} />
                </span>
                <div>
                  <div className="text-sm font-bold uppercase text-slate-500">
                    {metric.label}
                  </div>
                  <div className="mt-1 text-3xl font-bold text-slate-950">
                    {metric.value}
                  </div>
                  {metric.label === "Champion" ? (
                    <div className="text-sm text-slate-500">
                      {state?.champion ? "Winner" : "Pending"}
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
