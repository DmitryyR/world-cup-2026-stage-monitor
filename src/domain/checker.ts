import { normalizedMatchesSchema, tournamentStateSchema } from "./schemas";
import { isStageRegression } from "./stage-order";
import type { CheckerResult, NormalizedMatch, TournamentStage, TournamentState } from "./types";

type CheckTournamentStateInput = {
  matches: NormalizedMatch[];
  proposedState: TournamentState;
  previousStage?: TournamentStage | null;
};

export function checkTournamentState({
  matches,
  proposedState,
  previousStage,
}: CheckTournamentStateInput): CheckerResult {
  const errors: string[] = [];
  const parsedMatches = normalizedMatchesSchema.safeParse(matches);
  const parsedState = tournamentStateSchema.safeParse(proposedState);

  if (!parsedMatches.success) {
    errors.push("normalized matches failed schema validation");
  }

  if (!parsedState.success) {
    errors.push("proposed tournament state failed schema validation");
  }

  if (matches.length > 104) {
    errors.push("tournament has more than 104 matches");
  }

  for (const match of matches) {
    errors.push(...checkMatch(match));
  }

  const finalMatch = matches.find((match) => match.stage === "final");
  const finalFinishedWithWinner =
    finalMatch?.status === "finished" && Boolean(finalMatch.winner);

  if (proposedState.champion && !finalFinishedWithWinner) {
    errors.push("champion is set before the final is finished");
  }

  if (finalMatch?.status === "finished" && !proposedState.champion) {
    errors.push("final match is finished but champion is null");
  }

  if (isStageRegression(proposedState.currentStage, previousStage)) {
    errors.push("current stage regresses from persisted stage");
  }

  if (errors.length > 0) {
    return {
      status: "failed",
      errors,
    };
  }

  return {
    status: "passed",
    errors: [],
  };
}

function checkMatch(match: NormalizedMatch): string[] {
  const errors: string[] = [];

  if (match.homeTeam === match.awayTeam) {
    errors.push(`${match.externalId}: home and away team are the same`);
  }

  if (
    match.status === "finished" &&
    (match.homeScore === null || match.awayScore === null)
  ) {
    errors.push(`${match.externalId}: finished match has no score`);
  }

  if (match.status === "scheduled" && match.winner) {
    errors.push(`${match.externalId}: scheduled match has a winner`);
  }

  if (match.status === "live" && match.winner) {
    errors.push(`${match.externalId}: live match has a final winner`);
  }

  if (
    match.winner &&
    match.winner !== match.homeTeam &&
    match.winner !== match.awayTeam
  ) {
    errors.push(`${match.externalId}: winner is not a match participant`);
  }

  return errors;
}
