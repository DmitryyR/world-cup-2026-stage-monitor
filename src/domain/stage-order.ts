import type { TournamentStage } from "./types";

export const stageOrder: TournamentStage[] = [
  "group_stage",
  "round_of_32",
  "round_of_16",
  "quarter_final",
  "semi_final",
  "third_place",
  "final",
  "completed",
];

export function getStageRank(stage: TournamentStage): number {
  return stageOrder.indexOf(stage);
}

export function isStageRegression(
  proposedStage: TournamentStage,
  previousStage: TournamentStage | null | undefined,
): boolean {
  if (!previousStage) {
    return false;
  }

  return getStageRank(proposedStage) < getStageRank(previousStage);
}

export function maxStage(
  first: TournamentStage,
  second: TournamentStage,
): TournamentStage {
  return getStageRank(first) >= getStageRank(second) ? first : second;
}
