import type { TournamentStage } from "@/domain/types";
import { formatStage } from "@/lib/format";

type StageBadgeProps = {
  stage: TournamentStage | null | undefined;
};

export function StageBadge({ stage }: StageBadgeProps) {
  return (
    <span className="inline-flex items-center rounded-md bg-emerald-600 px-3 py-1.5 text-sm font-black uppercase text-white shadow-sm">
      {stage ? formatStage(stage) : "No accepted state"}
    </span>
  );
}
