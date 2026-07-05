import type { NormalizedMatch, TournamentStage } from "@/domain/types";
import { formatKyivDate } from "./date-format";

export type MatchFilter = "all" | "live" | "today" | "finished" | "scheduled" | "current";

export type MatchFilterCounts = Record<MatchFilter, number>;

export function getMatchFilterCounts(
  matches: NormalizedMatch[],
  currentStage: TournamentStage | null,
  today: string = formatKyivDate(new Date()),
): MatchFilterCounts {
  return {
    all: matches.length,
    live: matches.filter((match) => match.status === "live").length,
    today: matches.filter((match) => formatKyivDate(match.kickoffAt) === today).length,
    finished: matches.filter((match) => match.status === "finished").length,
    scheduled: matches.filter((match) => match.status === "scheduled").length,
    current: currentStage
      ? matches.filter((match) => match.stage === currentStage).length
      : matches.length,
  };
}

export function filterMatches({
  matches,
  activeFilter,
  currentStage,
  searchQuery,
  today = formatKyivDate(new Date()),
}: {
  matches: NormalizedMatch[];
  activeFilter: MatchFilter;
  currentStage: TournamentStage | null;
  searchQuery: string;
  today?: string;
}): NormalizedMatch[] {
  const normalizedSearch = searchQuery.trim().toLowerCase();

  return matches.filter((match) => {
    const matchesFilter =
      activeFilter === "all" ||
      (activeFilter === "today" && formatKyivDate(match.kickoffAt) === today) ||
      (activeFilter === "current" && (currentStage ? match.stage === currentStage : true)) ||
      match.status === activeFilter;

    if (!matchesFilter) {
      return false;
    }

    if (!normalizedSearch) {
      return true;
    }

    return (
      match.homeTeam.toLowerCase().includes(normalizedSearch) ||
      match.awayTeam.toLowerCase().includes(normalizedSearch)
    );
  });
}

export function getEmptyMatchMessage(activeFilter: MatchFilter, searchQuery: string): string {
  if (searchQuery.trim()) {
    return "No matches found for that team search.";
  }

  if (activeFilter === "live") {
    return "No live matches are accepted right now.";
  }

  if (activeFilter === "today") {
    return "No matches are scheduled for today.";
  }

  if (activeFilter === "current") {
    return "No matches found for the current stage.";
  }

  return "No matches found for this filter.";
}

export function formatPlural(count: number, singular: string, plural?: string): string {
  return `${count} ${count === 1 ? singular : plural ?? defaultPlural(singular)}`;
}

function defaultPlural(singular: string): string {
  if (/(s|x|z|ch|sh)$/i.test(singular)) {
    return `${singular}es`;
  }

  return `${singular}s`;
}
