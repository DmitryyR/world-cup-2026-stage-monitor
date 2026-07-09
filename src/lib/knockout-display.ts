import {
  formatWinMethodLabel,
  knockoutStages,
  resolveKnockoutOutcome,
  type BracketMatch,
} from "@/domain/bracket-builder";
import type { MatchStatus, NormalizedMatch } from "@/domain/types";
import { isStaleScheduledMatch } from "@/lib/match-staleness";
import { getTeamDisplayName } from "@/lib/team-flags";

export type DisplayMatchStatus = MatchStatus | "needs_review";

export function getDisplayMatchStatus(
  match: NormalizedMatch,
  now = new Date(),
): DisplayMatchStatus {
  if (isStaleScheduledMatch(match, now)) {
    return "needs_review";
  }

  const outcome = resolveKnockoutOutcome(match);

  if (outcome.needsReview) {
    return "needs_review";
  }

  return match.status;
}

export function getMatchReviewLabel(match: NormalizedMatch, now = new Date()): string | null {
  if (isStaleScheduledMatch(match, now)) {
    return "Scheduled time passed";
  }

  const outcome = resolveKnockoutOutcome(match);

  return outcome.needsReview ? "Needs winner review" : null;
}

export function getWinMethodLabel(match: NormalizedMatch): string | null {
  const outcome = resolveKnockoutOutcome(match);
  const winner = outcome.winner ?? match.winner;

  if (match.status !== "finished" || !winner) {
    return null;
  }

  return formatWinMethodLabel({
    ...match,
    slotIndex: 1,
    homeParticipant: { original: match.homeTeam, label: getTeamDisplayName(match.homeTeam) },
    awayParticipant: { original: match.awayTeam, label: getTeamDisplayName(match.awayTeam) },
    winner,
    winMethod: outcome.winMethod,
    homePenaltyScore: outcome.penaltyScore?.home ?? null,
    awayPenaltyScore: outcome.penaltyScore?.away ?? null,
    needsReview: outcome.needsReview,
    reviewReason: outcome.reviewReason,
    sourceDiagnostics: outcome.sourceDiagnostics,
  } satisfies BracketMatch);
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
