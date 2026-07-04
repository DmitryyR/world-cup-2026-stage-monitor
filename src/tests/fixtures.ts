import type { NormalizedMatch, TournamentStage } from "@/domain/types";

type MatchOverrides = Partial<NormalizedMatch>;

export function makeMatch(overrides: MatchOverrides = {}): NormalizedMatch {
  const status = overrides.status ?? "scheduled";
  const homeTeam = overrides.homeTeam ?? "Home";
  const awayTeam = overrides.awayTeam ?? "Away";
  const defaultScores =
    status === "finished"
      ? {
          homeScore: 1,
          awayScore: 0,
        }
      : {
          homeScore: null,
          awayScore: null,
        };

  return {
    externalId: overrides.externalId ?? "match-1",
    stage: overrides.stage ?? "group_stage",
    homeTeam,
    awayTeam,
    homeScore:
      overrides.homeScore === undefined
        ? defaultScores.homeScore
        : overrides.homeScore,
    awayScore:
      overrides.awayScore === undefined
        ? defaultScores.awayScore
        : overrides.awayScore,
    status,
    kickoffAt: overrides.kickoffAt ?? "2026-06-11T19:00:00.000Z",
    winner:
      overrides.winner !== undefined
        ? overrides.winner
        : status === "finished"
          ? homeTeam
          : null,
  };
}

export function makeCompletedPriorStage(stage: TournamentStage): NormalizedMatch {
  return makeMatch({
    externalId: `${stage}-finished`,
    stage,
    status: "finished",
    homeTeam: `${stage} home`,
    awayTeam: `${stage} away`,
    winner: `${stage} home`,
  });
}
