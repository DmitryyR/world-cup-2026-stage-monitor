import type { NormalizedMatch, TournamentStage } from "@/domain/types";

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
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

export function formatScore(match: NormalizedMatch): string {
  if (match.homeScore === null || match.awayScore === null) {
    return "-";
  }

  return `${match.homeScore}-${match.awayScore}`;
}
