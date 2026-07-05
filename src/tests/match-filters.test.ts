import { describe, expect, it } from "vitest";
import type { NormalizedMatch } from "@/domain/types";
import {
  filterMatches,
  formatPlural,
  getEmptyMatchMessage,
  getMatchFilterCounts,
} from "@/lib/match-filters";

const today = "Jul 5, 2026";

describe("match filter helpers", () => {
  it("counts matches for filter tabs", () => {
    const matches = [
      makeMatch({ status: "finished", stage: "round_of_16" }),
      makeMatch({ externalId: "2", status: "scheduled", stage: "round_of_16" }),
      makeMatch({ externalId: "3", status: "live", stage: "quarter_final" }),
    ];

    expect(getMatchFilterCounts(matches, "round_of_16", today)).toMatchObject({
      all: 3,
      live: 1,
      finished: 1,
      scheduled: 1,
      current: 2,
    });
  });

  it("filters by team search and status", () => {
    const matches = [
      makeMatch({ homeTeam: "Paraguay", awayTeam: "France", status: "live" }),
      makeMatch({
        externalId: "2",
        homeTeam: "Brazil",
        awayTeam: "Norway",
        status: "scheduled",
      }),
    ];

    expect(
      filterMatches({
        activeFilter: "scheduled",
        currentStage: "round_of_16",
        matches,
        searchQuery: "brazil",
        today,
      }).map((match) => match.externalId),
    ).toEqual(["2"]);
  });

  it("searches by normalized display team names", () => {
    const matches = [
      makeMatch({
        homeTeam: "JO Jordan",
        awayTeam: "PA Panama",
        status: "scheduled",
      }),
    ];

    expect(
      filterMatches({
        activeFilter: "all",
        currentStage: "round_of_16",
        matches,
        searchQuery: "uzbekistan",
        today,
      }),
    ).toEqual([]);

    expect(
      filterMatches({
        activeFilter: "all",
        currentStage: "round_of_16",
        matches,
        searchQuery: "jordan",
        today,
      }).map((match) => match.externalId),
    ).toEqual(["1"]);
  });

  it("formats empty states and plurals", () => {
    expect(getEmptyMatchMessage("live", "")).toBe(
      "No live matches are accepted right now.",
    );
    expect(getEmptyMatchMessage("all", "France")).toBe(
      "No matches found for that team search.",
    );
    expect(getEmptyMatchMessage("scheduled", "")).toBe(
      "No scheduled matches are accepted right now.",
    );
    expect(formatPlural(1, "match")).toBe("1 match");
    expect(formatPlural(2, "match")).toBe("2 matches");
    expect(formatPlural(2, "match", "matches")).toBe("2 matches");
  });
});

function makeMatch(overrides: Partial<NormalizedMatch> = {}): NormalizedMatch {
  return {
    externalId: "1",
    stage: "round_of_16",
    homeTeam: "Paraguay",
    awayTeam: "France",
    homeScore: null,
    awayScore: null,
    status: "scheduled",
    kickoffAt: "2026-07-05T18:00:00.000Z",
    winner: null,
    ...overrides,
  };
}
