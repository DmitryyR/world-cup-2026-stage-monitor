import type { MatchStatus, NormalizedMatch, TournamentStage } from "@/domain/types";
import { getTeamDisplayName } from "@/lib/team-flags";

export type DisplayMatchStatus = MatchStatus | "needs_review";

export const knockoutStages: TournamentStage[] = [
  "round_of_32",
  "round_of_16",
  "quarter_final",
  "semi_final",
  "third_place",
  "final",
];

const knockoutStageSet = new Set<TournamentStage>(knockoutStages);

export function getDisplayMatchStatus(match: NormalizedMatch): DisplayMatchStatus {
  if (isKnockoutStage(match.stage) && match.status === "finished" && !match.winner) {
    return "needs_review";
  }

  return match.status;
}

export function getWinMethodLabel(match: NormalizedMatch): string | null {
  if (match.status !== "finished" || !match.winner) {
    return null;
  }

  const winner = getTeamDisplayName(match.winner);

  if (
    match.homeScore !== null &&
    match.awayScore !== null &&
    match.homeScore === match.awayScore
  ) {
    return `${winner} won on penalties`;
  }

  return `${winner} advanced`;
}

export function resolveTeamNameForDisplay(
  teamName: string,
  matches: NormalizedMatch[],
): string {
  const winnerMatch = teamName.match(/^winner match (\d+)$/i);
  const loserMatch = teamName.match(/^loser match (\d+)$/i);

  if (winnerMatch) {
    return resolveDependentTeamLabel("Winner", winnerMatch[1], matches);
  }

  if (loserMatch) {
    return resolveDependentTeamLabel("Loser", loserMatch[1], matches);
  }

  return getTeamDisplayName(teamName);
}

export function isKnockoutStage(stage: TournamentStage): boolean {
  return knockoutStageSet.has(stage);
}

function resolveDependentTeamLabel(
  dependency: "Winner" | "Loser",
  matchNumber: string,
  matches: NormalizedMatch[],
): string {
  const sourceMatch = findMatchByNumber(matchNumber, matches);

  if (!sourceMatch) {
    return `${dependency} of Match ${matchNumber}`;
  }

  if (sourceMatch.status === "finished" && sourceMatch.winner) {
    if (dependency === "Winner") {
      return getTeamDisplayName(sourceMatch.winner);
    }

    const loser =
      sourceMatch.winner === sourceMatch.homeTeam
        ? sourceMatch.awayTeam
        : sourceMatch.homeTeam;

    return getTeamDisplayName(loser);
  }

  return `${dependency} of ${getTeamDisplayName(sourceMatch.homeTeam)} / ${getTeamDisplayName(
    sourceMatch.awayTeam,
  )}`;
}

function findMatchByNumber(
  matchNumber: string,
  matches: NormalizedMatch[],
): NormalizedMatch | undefined {
  return matches.find((match) => {
    const idDigits = match.externalId.match(/\d+/g)?.join("");

    return idDigits === matchNumber || match.externalId === matchNumber;
  });
}
