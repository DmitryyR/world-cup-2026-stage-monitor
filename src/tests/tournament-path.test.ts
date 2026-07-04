import { describe, expect, it } from "vitest";
import type { TournamentState } from "@/domain/types";
import {
  buildTournamentPath,
  collectUniqueTeamsForStage,
  getPlaceholderCount,
  getTournamentPathStatus,
} from "@/lib/tournament-path";
import { makeMatch } from "./fixtures";

describe("tournament path helpers", () => {
  it("collects unique known teams for a stage", () => {
    const matches = [
      makeMatch({
        externalId: "r16-1",
        stage: "round_of_16",
        homeTeam: "Canada",
        awayTeam: "Morocco",
      }),
      makeMatch({
        externalId: "r16-2",
        stage: "round_of_16",
        homeTeam: "Canada",
        awayTeam: "France",
      }),
      makeMatch({
        externalId: "qf-1",
        stage: "quarter_final",
        homeTeam: "Winner Match 101",
        awayTeam: "Winner Match 102",
      }),
    ];

    expect(collectUniqueTeamsForStage(matches, "round_of_16")).toEqual([
      "Canada",
      "Morocco",
      "France",
    ]);
    expect(collectUniqueTeamsForStage(matches, "quarter_final")).toEqual([]);
  });

  it("fills remaining slots with placeholders", () => {
    expect(getPlaceholderCount(16, 3)).toBe(13);
    expect(getPlaceholderCount(2, 4)).toBe(0);
  });

  it("keeps champion pending when no champion exists", () => {
    const path = buildTournamentPath([], makeState({ champion: null }));
    const champion = path.find((stage) => stage.id === "champion");

    expect(champion?.teams).toEqual([]);
    expect(champion?.placeholderCount).toBe(1);
  });

  it("marks previous, current, and future stages from current stage", () => {
    expect(getTournamentPathStatus("round_of_32", "round_of_16")).toBe(
      "completed",
    );
    expect(getTournamentPathStatus("round_of_16", "round_of_16")).toBe(
      "current",
    );
    expect(getTournamentPathStatus("quarter_final", "round_of_16")).toBe(
      "future",
    );
  });
});

function makeState(overrides: Partial<TournamentState> = {}): TournamentState {
  return {
    currentStage: "round_of_16",
    completedMatches: 0,
    remainingMatches: 104,
    champion: null,
    lastCheckedAt: "2026-07-04T19:00:00.000Z",
    checkerStatus: "passed",
    ...overrides,
  };
}
