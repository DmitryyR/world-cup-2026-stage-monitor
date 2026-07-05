import { describe, expect, it } from "vitest";
import type { NormalizedMatch } from "@/domain/types";
import { getTeamSummaries } from "@/lib/team-directory";

describe("team directory helpers", () => {
  it("normalizes team names and excludes future placeholders", () => {
    const summaries = getTeamSummaries([
      makeMatch({
        homeTeam: "JO Jordan",
        awayTeam: "Winner Match 93",
        status: "scheduled",
      }),
      makeMatch({
        externalId: "2",
        homeTeam: "PA Panama",
        awayTeam: "UZ Uzbekistan",
        status: "finished",
        homeScore: 1,
        awayScore: 0,
        winner: "PA Panama",
      }),
    ]);

    expect(summaries.map((summary) => summary.displayName)).toEqual([
      "Jordan",
      "Panama",
      "Uzbekistan",
    ]);
    expect(summaries.some((summary) => summary.displayName.startsWith("Winner"))).toBe(false);
  });
});

function makeMatch(overrides: Partial<NormalizedMatch> = {}): NormalizedMatch {
  return {
    externalId: "1",
    stage: "round_of_16",
    homeTeam: "Brazil",
    awayTeam: "Norway",
    homeScore: null,
    awayScore: null,
    status: "scheduled",
    kickoffAt: "2026-07-05T18:00:00.000Z",
    winner: null,
    ...overrides,
  };
}
