import type { RawProviderMatch, RawProviderPayload, TournamentStage } from "@/domain/types";
import type { WorldCup26Game, WorldCup26Response } from "./worldcup26.schemas";

type WorldCup26Diagnostics = {
  providerName: "worldcup26";
  rawGamesFetched: number;
  normalizedMatchesCount: number;
  countByStage: Partial<Record<TournamentStage, number>>;
  countByStatus: Partial<Record<RawProviderMatch["status"], number>>;
  unknownStages: string[];
  unknownStatuses: string[];
};

export function mapWorldCup26ResponseToRawProviderPayload(
  response: WorldCup26Response,
  fetchedAt = new Date().toISOString(),
): RawProviderPayload {
  if (response.games.length === 0) {
    throw new Error(
      formatWorldCup26Diagnostics({
        providerName: "worldcup26",
        rawGamesFetched: 0,
        normalizedMatchesCount: 0,
        countByStage: {},
        countByStatus: {},
        unknownStages: [],
        unknownStatuses: [],
      }, "WorldCup26Provider returned zero games"),
    );
  }

  const matches = response.games.map(mapWorldCup26GameToRawProviderMatch);

  return {
    source: "worldcup26",
    fetchedAt,
    matches,
    rawProviderPayload: response,
  };
}

export function mapWorldCup26GameToRawProviderMatch(
  game: WorldCup26Game,
): RawProviderMatch {
  const stage = mapWorldCup26TypeToStage(game.type);
  const status = mapWorldCup26Status(game);
  const homeScore = parseOptionalScore(game.home_score);
  const awayScore = parseOptionalScore(game.away_score);
  const homeTeam = getTeamName(game.home_team_name_en, game.home_team_label, "TBD Home");
  const awayTeam = getTeamName(game.away_team_name_en, game.away_team_label, "TBD Away");
  const hasBothScores = homeScore !== null && awayScore !== null;
  const safeStatus = status === "finished" && !hasBothScores ? "live" : status;

  return {
    id: getExternalId(game),
    round: stage,
    home: homeTeam,
    away: awayTeam,
    homeScore: safeStatus === "scheduled" ? null : homeScore,
    awayScore: safeStatus === "scheduled" ? null : awayScore,
    status: safeStatus,
    kickoffAt: parseWorldCup26LocalDate(game.local_date),
    winner:
      safeStatus === "finished" && hasBothScores
        ? getWinner(homeTeam, awayTeam, homeScore, awayScore)
        : null,
  };
}

export function mapWorldCup26TypeToStage(type: string): TournamentStage {
  const normalizedType = type.trim().toLowerCase();

  if (normalizedType === "group") {
    return "group_stage";
  }

  if (normalizedType === "r32") {
    return "round_of_32";
  }

  if (normalizedType === "r16") {
    return "round_of_16";
  }

  if (normalizedType === "qf") {
    return "quarter_final";
  }

  if (normalizedType === "sf") {
    return "semi_final";
  }

  if (normalizedType === "third" || normalizedType === "3rd") {
    return "third_place";
  }

  if (normalizedType === "final") {
    return "final";
  }

  throw new Error(
    formatWorldCup26Diagnostics(
      {
        providerName: "worldcup26",
        rawGamesFetched: 0,
        normalizedMatchesCount: 0,
        countByStage: {},
        countByStatus: {},
        unknownStages: [type],
        unknownStatuses: [],
      },
      `Unknown worldcup26 stage/type: ${type}`,
    ),
  );
}

export function mapWorldCup26Status(game: WorldCup26Game): RawProviderMatch["status"] {
  const finished = stringifyValue(game.finished).toLowerCase();
  const elapsed = stringifyValue(game.time_elapsed).trim().toLowerCase();

  if (finished === "true" || elapsed === "finished") {
    return "finished";
  }

  if (
    finished === "false" &&
    (elapsed === "" || elapsed === "notstarted" || elapsed === "not started")
  ) {
    return "scheduled";
  }

  if (
    finished === "false" &&
    (elapsed === "live" ||
      elapsed === "halftime" ||
      elapsed === "half-time" ||
      elapsed === "ht" ||
      /^\d+(\+\d+)?$/.test(elapsed))
  ) {
    return "live";
  }

  throw new Error(
    formatWorldCup26Diagnostics(
      {
        providerName: "worldcup26",
        rawGamesFetched: 0,
        normalizedMatchesCount: 0,
        countByStage: {},
        countByStatus: {},
        unknownStages: [],
        unknownStatuses: [`finished=${stringifyValue(game.finished)}, time_elapsed=${stringifyValue(game.time_elapsed)}`],
      },
      `Unknown worldcup26 status for game ${getExternalId(game)}`,
    ),
  );
}

export function buildWorldCup26Diagnostics(
  response: WorldCup26Response,
  matches: RawProviderMatch[] = [],
): WorldCup26Diagnostics {
  return {
    providerName: "worldcup26",
    rawGamesFetched: response.games.length,
    normalizedMatchesCount: matches.length,
    countByStage: countBy(matches, (match) => match.round as TournamentStage),
    countByStatus: countBy(matches, (match) => match.status),
    unknownStages: [],
    unknownStatuses: [],
  };
}

export function formatWorldCup26Diagnostics(
  diagnostics: WorldCup26Diagnostics,
  message: string,
): string {
  return `${message}; diagnostics=${JSON.stringify(diagnostics)}`;
}

function countBy<T extends string>(
  items: RawProviderMatch[],
  getKey: (item: RawProviderMatch) => T,
): Partial<Record<T, number>> {
  return items.reduce<Partial<Record<T, number>>>((counts, item) => {
    const key = getKey(item);
    counts[key] = (counts[key] ?? 0) + 1;
    return counts;
  }, {});
}

function parseOptionalScore(value: unknown): number | null {
  if (value === null || value === undefined || value === "" || value === "null") {
    return null;
  }

  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 0) {
    return null;
  }

  return parsed;
}

function parseWorldCup26LocalDate(value: string): string {
  const match = value.match(
    /^(?<month>\d{1,2})\/(?<day>\d{1,2})\/(?<year>\d{4}) (?<hour>\d{1,2}):(?<minute>\d{2})$/,
  );

  if (!match?.groups) {
    throw new Error(`Invalid worldcup26 local_date: ${value}`);
  }

  const month = Number(match.groups.month);
  const day = Number(match.groups.day);
  const year = Number(match.groups.year);
  const hour = Number(match.groups.hour);
  const minute = Number(match.groups.minute);

  return new Date(Date.UTC(year, month - 1, day, hour, minute)).toISOString();
}

function getTeamName(
  teamName: string | null | undefined,
  teamLabel: string | null | undefined,
  fallback: string,
): string {
  const candidate = teamName?.trim() || teamLabel?.trim() || fallback;
  return candidate;
}

function getExternalId(game: WorldCup26Game): string {
  const id = stringifyValue(game.id).trim();
  if (id) {
    return id;
  }

  if (game._id) {
    return game._id;
  }

  throw new Error("Worldcup26 game has no id");
}

function getWinner(
  homeTeam: string,
  awayTeam: string,
  homeScore: number,
  awayScore: number,
): string | null {
  if (homeScore > awayScore) {
    return homeTeam;
  }

  if (awayScore > homeScore) {
    return awayTeam;
  }

  return null;
}

function stringifyValue(value: unknown): string {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value);
}
