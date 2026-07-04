import { maxStage } from "./stage-order";
import type { NormalizedMatch, TournamentStage, TournamentState } from "./types";

type DetectOptions = {
  lastCheckedAt?: string;
  previousStage?: TournamentStage | null;
};

const unresolvedStagePriority: TournamentStage[] = [
  "group_stage",
  "round_of_32",
  "round_of_16",
  "quarter_final",
  "semi_final",
  "third_place",
  "final",
];

export function detectTournamentState(
  matches: NormalizedMatch[],
  options: DetectOptions = {},
): TournamentState {
  const lastCheckedAt = options.lastCheckedAt ?? new Date().toISOString();
  const finalMatch = matches.find((match) => match.stage === "final");

  const completedMatches = matches.filter(
    (match) => match.status === "finished",
  ).length;
  const remainingMatches = matches.length - completedMatches;

  let currentStage = detectCurrentStage(matches, finalMatch);
  if (options.previousStage) {
    currentStage = maxStage(currentStage, options.previousStage);
  }

  return {
    currentStage,
    completedMatches,
    remainingMatches,
    champion:
      finalMatch?.status === "finished" && finalMatch.winner
        ? finalMatch.winner
        : null,
    lastCheckedAt,
    checkerStatus: "passed",
  };
}

function detectCurrentStage(
  matches: NormalizedMatch[],
  finalMatch: NormalizedMatch | undefined,
): TournamentStage {
  if (finalMatch?.status === "finished" && finalMatch.winner) {
    return "completed";
  }

  for (const stage of unresolvedStagePriority) {
    const hasUnresolvedMatch = matches.some(
      (match) =>
        match.stage === stage &&
        (match.status === "scheduled" || match.status === "live"),
    );

    if (hasUnresolvedMatch) {
      return stage;
    }
  }

  return highestKnownStage(matches);
}

function highestKnownStage(matches: NormalizedMatch[]): TournamentStage {
  return matches.reduce<TournamentStage>(
    (highest, match) => maxStage(highest, match.stage),
    "group_stage",
  );
}
