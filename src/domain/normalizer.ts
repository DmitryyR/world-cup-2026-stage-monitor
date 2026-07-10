import { rawProviderPayloadSchema, normalizedMatchesSchema } from "./schemas";
import { extractPenaltyScore } from "./penalty-score";
import type { NormalizedMatch, RawProviderPayload, TournamentStage } from "./types";

const roundToStage: Record<string, TournamentStage> = {
  group: "group_stage",
  group_stage: "group_stage",
  "round of 32": "round_of_32",
  round_of_32: "round_of_32",
  "round of 16": "round_of_16",
  round_of_16: "round_of_16",
  "quarter-final": "quarter_final",
  "quarter-finals": "quarter_final",
  quarter_final: "quarter_final",
  "semi-final": "semi_final",
  "semi-finals": "semi_final",
  semi_final: "semi_final",
  "third place": "third_place",
  third_place: "third_place",
  final: "final",
};

export function normalizeProviderPayload(
  rawPayload: RawProviderPayload,
): NormalizedMatch[] {
  const parsedPayload = rawProviderPayloadSchema.parse(rawPayload);

  const normalized = parsedPayload.matches.map((match) => {
    const stage = roundToStage[match.round.trim().toLowerCase()];
    const sourceMatch = findRawProviderMatch(parsedPayload.rawProviderPayload, match.id);

    if (!stage) {
      throw new Error(`Unsupported match round: ${match.round}`);
    }

    const penaltyScore = match.penaltyScore ?? extractPenaltyScore(sourceMatch);

    return {
      externalId: match.id,
      stage,
      homeTeam: match.home,
      awayTeam: match.away,
      homeScore: match.homeScore ?? null,
      awayScore: match.awayScore ?? null,
      status: match.status,
      kickoffAt: match.kickoffAt,
      winner: match.winner ?? null,
      penaltyScore,
      ...(sourceMatch ? { rawPayload: sourceMatch } : {}),
    } satisfies NormalizedMatch;
  });

  return normalizedMatchesSchema.parse(normalized);
}

function findRawProviderMatch(rawProviderPayload: unknown, matchId: string): unknown | null {
  const games = getRawGames(rawProviderPayload);

  return (
    games.find((game) => {
      if (!isRecord(game)) {
        return false;
      }

      return sameMatchId(game.id, matchId) || sameMatchId(game._id, matchId);
    }) ?? null
  );
}

function getRawGames(rawProviderPayload: unknown): unknown[] {
  if (Array.isArray(rawProviderPayload)) {
    return rawProviderPayload;
  }

  if (!isRecord(rawProviderPayload)) {
    return [];
  }

  if (Array.isArray(rawProviderPayload.games)) {
    return rawProviderPayload.games;
  }

  const response = rawProviderPayload.response;
  if (isRecord(response) && Array.isArray(response.games)) {
    return response.games;
  }

  return [];
}

function sameMatchId(left: unknown, right: string): boolean {
  const leftValue = stringify(left);

  return leftValue === right || extractDigits(leftValue) === extractDigits(right);
}

function extractDigits(value: string): string {
  return value.match(/\d+/g)?.join("") ?? value;
}

function stringify(value: unknown): string {
  return value === null || value === undefined ? "" : String(value);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
