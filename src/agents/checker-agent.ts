import { checkTournamentState } from "@/domain/checker";
import type { NormalizedMatch, TournamentStage, TournamentState } from "@/domain/types";

export function checkerAgent(
  matches: NormalizedMatch[],
  proposedState: TournamentState,
  previousStage?: TournamentStage | null,
) {
  return checkTournamentState({ matches, proposedState, previousStage });
}
