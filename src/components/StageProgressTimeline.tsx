import { CheckCircle2, Circle, Trophy } from "lucide-react";
import type { NormalizedMatch, TournamentStage } from "@/domain/types";
import { getStageRank } from "@/domain/stage-order";
import { formatStage } from "@/lib/format";

const timelineStages: TournamentStage[] = [
  "group_stage",
  "round_of_32",
  "round_of_16",
  "quarter_final",
  "semi_final",
  "final",
];

type StageProgressTimelineProps = {
  currentStage: TournamentStage | null | undefined;
  matches: NormalizedMatch[];
};

export function StageProgressTimeline({
  currentStage,
  matches,
}: StageProgressTimelineProps) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-6">
        {timelineStages.map((stage) => {
          const stageMatches = matches.filter((match) => match.stage === stage);
          const completed = stageMatches.filter(
            (match) => match.status === "finished",
          ).length;
          const total = stageMatches.length;
          const isCurrent = currentStage === stage;
          const isCompleted =
            total > 0 && completed === total && getStageRank(stage) < getStageRank(currentStage ?? "group_stage");
          const isFuture =
            currentStage && getStageRank(stage) > getStageRank(currentStage);
          const Icon = stage === "final" ? Trophy : isCompleted ? CheckCircle2 : Circle;

          return (
            <div
              key={stage}
              className={
                isCurrent
                  ? "rounded-md border border-emerald-300 bg-emerald-50 p-3 text-emerald-800"
                  : isCompleted
                    ? "rounded-md border border-emerald-100 bg-white p-3 text-slate-900"
                    : isFuture
                      ? "rounded-md border border-slate-100 bg-slate-50 p-3 text-slate-400"
                      : "rounded-md border border-slate-100 bg-white p-3 text-slate-600"
              }
            >
              <div className="flex items-center gap-2">
                <Icon
                  aria-hidden="true"
                  className={isCompleted || isCurrent ? "text-emerald-600" : ""}
                  size={18}
                />
                <span className="text-sm font-bold">{formatStage(stage)}</span>
              </div>
              <div className="mt-2 text-sm font-medium">
                {completed}/{total || 0}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
