import { describe, expect, it } from "vitest";
import type { NormalizedMatch } from "@/domain/types";
import { formatScore } from "@/lib/format";

describe("score formatting", () => {
  it("shows penalty shootout scores for finished penalty matches", () => {
    expect(
      formatScore(
        makeMatch({
          homeTeam: "Germany",
          awayTeam: "Paraguay",
          homeScore: 1,
          awayScore: 1,
          penaltyScore: { home: 3, away: 4 },
          winner: "Paraguay",
        }),
      ),
    ).toBe("1 (3 pens) - 1 (4 pens)");
  });

  it("does not show penalty text for normal finished matches", () => {
    expect(
      formatScore(
        makeMatch({
          homeTeam: "France",
          awayTeam: "Sweden",
          homeScore: 3,
          awayScore: 0,
          winner: "France",
        }),
      ),
    ).toBe("3 - 0");
  });

  it("does not show penalty text for scheduled matches", () => {
    expect(
      formatScore(
        makeMatch({
          status: "scheduled",
          homeScore: null,
          awayScore: null,
          penaltyScore: null,
          winner: null,
        }),
      ),
    ).toBe("-");
  });
});

function makeMatch(overrides: Partial<NormalizedMatch> = {}): NormalizedMatch {
  return {
    externalId: "match-1",
    stage: "round_of_32",
    homeTeam: "Germany",
    awayTeam: "Paraguay",
    homeScore: 1,
    awayScore: 1,
    status: "finished",
    kickoffAt: "2026-06-29T20:30:00.000Z",
    winner: null,
    ...overrides,
  };
}
