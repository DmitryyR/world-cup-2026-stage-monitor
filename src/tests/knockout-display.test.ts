import { describe, expect, it } from "vitest";
import type { NormalizedMatch } from "@/domain/types";
import {
  getDisplayMatchStatus,
  getMatchReviewLabel,
  getWinMethodLabel,
} from "@/lib/knockout-display";

describe("knockout display helpers", () => {
  it("uses full match context to display inferred tied knockout winners", () => {
    const source = makeMatch({
      externalId: "74",
      homeTeam: "Germany",
      awayTeam: "Paraguay",
      homeScore: 1,
      awayScore: 1,
      winner: null,
    });
    const next = makeMatch({
      externalId: "89",
      stage: "round_of_16",
      status: "scheduled",
      homeTeam: "Paraguay",
      awayTeam: "France",
      homeScore: null,
      awayScore: null,
      winner: null,
      rawPayload: {
        home_team_label: "Winner Match 74",
        away_team_label: "Winner Match 77",
      },
    });
    const matches = [source, next];

    expect(getDisplayMatchStatus(source, { matches })).toBe("finished");
    expect(getMatchReviewLabel(source, { matches })).toBeNull();
    expect(getWinMethodLabel(source, matches)).toBe("Paraguay advanced");
  });

  it("keeps a tied knockout match in review when no context resolves the winner", () => {
    const match = makeMatch({
      externalId: "74",
      homeTeam: "Germany",
      awayTeam: "Paraguay",
      homeScore: 1,
      awayScore: 1,
      winner: null,
    });

    expect(getDisplayMatchStatus(match)).toBe("needs_review");
    expect(getMatchReviewLabel(match)).toBe("Needs winner review");
  });
});

function makeMatch(overrides: Partial<NormalizedMatch> = {}): NormalizedMatch {
  return {
    externalId: "test-match",
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
