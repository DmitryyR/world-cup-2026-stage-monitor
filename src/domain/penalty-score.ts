export type PenaltyScore = {
  home: number;
  away: number;
};

const homePenaltyKeys = [
  "home_penalty_score",
  "home_penalties",
  "home_penalty",
  "home_penalty_goals",
  "home_score_penalties",
  "home_team_penalties",
  "homePenaltyScore",
  "homePenalties",
  "homePenalty",
];

const awayPenaltyKeys = [
  "away_penalty_score",
  "away_penalties",
  "away_penalty",
  "away_penalty_goals",
  "away_score_penalties",
  "away_team_penalties",
  "awayPenaltyScore",
  "awayPenalties",
  "awayPenalty",
];

export function extractPenaltyScore(value: unknown): PenaltyScore | null {
  const direct = extractPenaltyPair(value);
  if (direct) {
    return direct;
  }

  if (!isRecord(value)) {
    return null;
  }

  for (const key of ["penaltyScore", "penalties", "penalty", "shootout"]) {
    const nested = extractPenaltyPair(value[key]);
    if (nested) {
      return nested;
    }
  }

  const score = value.score;
  if (isRecord(score)) {
    for (const key of ["penaltyScore", "penalties", "penalty", "shootout"]) {
      const nested = extractPenaltyPair(score[key]);
      if (nested) {
        return nested;
      }
    }
  }

  return null;
}

function extractPenaltyPair(value: unknown): PenaltyScore | null {
  if (!isRecord(value)) {
    return null;
  }

  const home = parseFirstOptionalNumber(value, homePenaltyKeys) ?? parseOptionalNumber(value.home);
  const away = parseFirstOptionalNumber(value, awayPenaltyKeys) ?? parseOptionalNumber(value.away);

  if (home === null || away === null) {
    return null;
  }

  return { home, away };
}

function parseFirstOptionalNumber(
  value: Record<string, unknown>,
  keys: string[],
): number | null {
  for (const key of keys) {
    const parsed = parseOptionalNumber(value[key]);

    if (parsed !== null) {
      return parsed;
    }
  }

  return null;
}

function parseOptionalNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === "" || value === "null") {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
