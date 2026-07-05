import {
  formatWinMethodLabel,
  knockoutStages,
  resolveKnockoutOutcome,
  type BracketMatch,
} from "@/domain/bracket-builder";
import type { MatchStatus, NormalizedMatch } from "@/domain/types";
import { getTeamDisplayName } from "@/lib/team-flags";

export type DisplayMatchStatus = MatchStatus | "needs_review";

export function getDisplayMatchStatus(match: NormalizedMatch): DisplayMatchStatus {
  const outcome = resolveKnockoutOutcome(match);

  if (outcome.needsReview) {
    return "needs_review";
  }

  return match.status;
}

export function getWinMethodLabel(match: NormalizedMatch): string | null {
  if (match.status !== "finished" || !match.winner) {
    const outcome = resolveKnockoutOutcome(match);

    if (!outcome.winner) {
      return null;
    }

    return formatWinMethodLabel({
      ...match,
      slotIndex: 1,
      homeParticipant: { original: match.homeTeam, label: match.homeTeam },
      awayParticipant: { original: match.awayTeam, label: match.awayTeam },
      winner: outcome.winner,
      winMethod: outcome.winMethod,
      needsReview: outcome.needsReview,
      reviewReason: outcome.reviewReason,
      sourceDiagnostics: outcome.sourceDiagnostics,
    } satisfies BracketMatch);
  }

  const outcome = resolveKnockoutOutcome(match);
  const winner = getTeamDisplayName(outcome.winner ?? match.winner);

  if (outcome.winMethod === "penalties") {
    return `${winner} won on penalties`;
  }

  if (outcome.winMethod === "extra_time") {
    return `${winner} won after extra time`;
  }

  if (outcome.winMethod === "regular_time") {
    return `${winner} won in regular time`;
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
