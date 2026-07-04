import type { RawProviderMatch, RawProviderPayload, TournamentStage } from "@/domain/types";
import type {
  ApiFootballFixture,
  ApiFootballFixturesResponse,
} from "./api-football.schemas";

const scheduledStatuses = new Set([
  "TBD",
  "NS",
  "PST",
  "CANC",
  "ABD",
  "AWD",
  "WO",
]);
const liveStatuses = new Set([
  "1H",
  "HT",
  "2H",
  "ET",
  "BT",
  "P",
  "SUSP",
  "INT",
  "LIVE",
]);
const finishedStatuses = new Set(["FT", "AET", "PEN"]);

export function mapApiFootballResponseToRawProviderPayload(
  response: ApiFootballFixturesResponse,
  fetchedAt = new Date().toISOString(),
): RawProviderPayload {
  return {
    source: "api-football",
    fetchedAt,
    matches: response.response.map(mapApiFootballFixtureToRawProviderMatch),
    rawProviderPayload: response,
  };
}

export function mapApiFootballFixtureToRawProviderMatch(
  fixture: ApiFootballFixture,
): RawProviderMatch {
  const status = mapApiFootballStatus(fixture.fixture.status.short);
  const homeWinner = fixture.teams.home.winner === true;
  const awayWinner = fixture.teams.away.winner === true;
  const winner =
    status === "finished"
      ? getFinishedWinner({
          homeWinner,
          awayWinner,
          homeTeam: fixture.teams.home.name,
          awayTeam: fixture.teams.away.name,
          externalId: fixture.fixture.id,
        })
      : null;

  return {
    id: String(fixture.fixture.id),
    round: mapApiFootballRoundToInternalRound(fixture.league.round),
    home: fixture.teams.home.name,
    away: fixture.teams.away.name,
    homeScore: status === "scheduled" ? null : fixture.goals.home,
    awayScore: status === "scheduled" ? null : fixture.goals.away,
    status,
    kickoffAt: new Date(fixture.fixture.date).toISOString(),
    winner,
  };
}

export function mapApiFootballStatus(statusShort: string): RawProviderMatch["status"] {
  const normalizedStatus = statusShort.trim().toUpperCase();

  if (scheduledStatuses.has(normalizedStatus)) {
    return "scheduled";
  }

  if (liveStatuses.has(normalizedStatus)) {
    return "live";
  }

  if (finishedStatuses.has(normalizedStatus)) {
    return "finished";
  }

  throw new Error(`Unsupported API-Football fixture status: ${statusShort}`);
}

export function mapApiFootballRoundToInternalRound(round: string): TournamentStage {
  const normalizedRound = round.trim().toLowerCase();

  if (normalizedRound.includes("group")) {
    return "group_stage";
  }

  if (
    normalizedRound.includes("round of 32") ||
    normalizedRound.includes("1/16") ||
    normalizedRound.includes("16th finals")
  ) {
    return "round_of_32";
  }

  if (
    normalizedRound.includes("round of 16") ||
    normalizedRound.includes("1/8") ||
    normalizedRound.includes("8th finals")
  ) {
    return "round_of_16";
  }

  if (
    normalizedRound.includes("quarter") ||
    normalizedRound.includes("1/4")
  ) {
    return "quarter_final";
  }

  if (normalizedRound.includes("semi") || normalizedRound.includes("1/2")) {
    return "semi_final";
  }

  if (
    normalizedRound.includes("third place") ||
    normalizedRound.includes("3rd place")
  ) {
    return "third_place";
  }

  if (normalizedRound === "final" || normalizedRound.endsWith(": final")) {
    return "final";
  }

  throw new Error(`Unsupported API-Football fixture round: ${round}`);
}

function getFinishedWinner({
  homeWinner,
  awayWinner,
  homeTeam,
  awayTeam,
  externalId,
}: {
  homeWinner: boolean;
  awayWinner: boolean;
  homeTeam: string;
  awayTeam: string;
  externalId: number;
}): string | null {
  if (homeWinner && awayWinner) {
    throw new Error(`API-Football fixture ${externalId} has two winners`);
  }

  if (homeWinner) {
    return homeTeam;
  }

  if (awayWinner) {
    return awayTeam;
  }

  return null;
}
