import type { NormalizedMatch, MatchStatus, TournamentStage } from "@/domain/types";
import { formatTeamName } from "./team-flags";

export type TeamSummary = {
  team: string;
  displayName: string;
  played: number;
  finished: number;
  live: number;
  scheduled: number;
  latestStage: TournamentStage | null;
  nextMatch: NormalizedMatch | null;
  lastMatch: NormalizedMatch | null;
  status: MatchStatus | "idle";
};

export function getTeamSummaries(matches: NormalizedMatch[]): TeamSummary[] {
  const teams = new Map<string, NormalizedMatch[]>();

  for (const match of matches) {
    for (const team of [match.homeTeam, match.awayTeam]) {
      const displayName = formatTeamName(team);

      if (isPlaceholderTeam(displayName) || displayName === "Unknown team") {
        continue;
      }

      const existing = teams.get(team) ?? [];
      existing.push(match);
      teams.set(team, existing);
    }
  }

  return [...teams.entries()]
    .map(([team, teamMatches]) => toTeamSummary(team, teamMatches))
    .sort((first, second) => first.displayName.localeCompare(second.displayName));
}

function toTeamSummary(team: string, matches: NormalizedMatch[]): TeamSummary {
  const orderedMatches = [...matches].sort((first, second) =>
    first.kickoffAt.localeCompare(second.kickoffAt),
  );
  const finishedMatches = orderedMatches.filter((match) => match.status === "finished");
  const nextMatch =
    orderedMatches.find((match) => match.status === "live" || match.status === "scheduled") ??
    null;
  const lastMatch = finishedMatches.at(-1) ?? null;
  const latestReference = nextMatch ?? lastMatch;
  const live = orderedMatches.filter((match) => match.status === "live").length;
  const scheduled = orderedMatches.filter((match) => match.status === "scheduled").length;

  return {
    team,
    displayName: formatTeamName(team),
    played: orderedMatches.length,
    finished: finishedMatches.length,
    live,
    scheduled,
    latestStage: latestReference?.stage ?? null,
    nextMatch,
    lastMatch,
    status: live > 0 ? "live" : scheduled > 0 ? "scheduled" : lastMatch ? "finished" : "idle",
  };
}

function isPlaceholderTeam(value: string): boolean {
  return /^(winner|loser) of /i.test(value) || value === "TBD";
}
