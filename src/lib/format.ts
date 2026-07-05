import type { NormalizedMatch, TournamentStage } from "@/domain/types";
import { formatKyivDateTime } from "@/lib/date-format";

const stageLabels: Record<TournamentStage, string> = {
  group_stage: "Group Stage",
  round_of_32: "Round of 32",
  round_of_16: "Round of 16",
  quarter_final: "Quarter-finals",
  semi_final: "Semi-finals",
  third_place: "Third Place",
  final: "Final",
  completed: "Completed",
};

export function formatStage(stage: TournamentStage): string {
  return stageLabels[stage];
}

export function formatDateTime(value: string): string {
  return formatKyivDateTime(value);
}

export function formatScore(match: NormalizedMatch): string {
  if (match.homeScore === null || match.awayScore === null) {
    return "-";
  }

  return `${match.homeScore} - ${match.awayScore}`;
}
