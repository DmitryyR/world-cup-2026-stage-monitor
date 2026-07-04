import { detectTournamentState } from "@/domain/tournament-stage";
import type { NormalizedMatch, TournamentStage } from "@/domain/types";

export function stageDetectorAgent(
  matches: NormalizedMatch[],
  previousStage?: TournamentStage | null,
) {
  return detectTournamentState(matches, { previousStage });
}
