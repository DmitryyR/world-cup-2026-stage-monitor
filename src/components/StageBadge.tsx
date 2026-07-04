import type { TournamentStage } from "@/domain/types";
import { formatStage } from "@/lib/format";

type StageBadgeProps = {
  stage: TournamentStage | null | undefined;
};

export function StageBadge({ stage }: StageBadgeProps) {
  return (
    <span className="inline-flex items-center rounded-md bg-emerald-100 px-2.5 py-1 text-sm font-semibold text-emerald-800">
      {stage ? formatStage(stage) : "No accepted state"}
    </span>
  );
}
