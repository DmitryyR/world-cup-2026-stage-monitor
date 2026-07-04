import { describe, expect, it } from "vitest";
import { checkTournamentState } from "@/domain/checker";
import { detectTournamentState } from "@/domain/tournament-stage";
import type { NormalizedMatch } from "@/domain/types";
import { makeMatch } from "./fixtures";

function check(matches: NormalizedMatch[]) {
  return checkTournamentState({
    matches,
    proposedState: detectTournamentState(matches),
  });
}

describe("checkTournamentState", () => {
  it("rejects a finished match without score", () => {
    const result = check([
      makeMatch({
        status: "finished",
        homeScore: null,
        awayScore: 1,
        winner: "Home",
      }),
    ]);

    expect(result.status).toBe("failed");
    expect(result.errors).toContain("match-1: finished match has no score");
  });

  it("rejects a scheduled match with winner", () => {
    const result = check([
      makeMatch({
        status: "scheduled",
        winner: "Home",
      }),
    ]);

    expect(result.status).toBe("failed");
    expect(result.errors).toContain("match-1: scheduled match has a winner");
  });

  it("rejects a live match with winner", () => {
    const result = check([
      makeMatch({
        status: "live",
        winner: "Home",
      }),
    ]);

    expect(result.status).toBe("failed");
    expect(result.errors).toContain("match-1: live match has a final winner");
  });

  it("rejects champion before final is finished", () => {
    const matches = [
      makeMatch({
        externalId: "final-scheduled",
        stage: "final",
        status: "scheduled",
        homeTeam: "Argentina",
        awayTeam: "Spain",
      }),
    ];
    const proposedState = {
      ...detectTournamentState(matches),
      champion: "Argentina",
    };

    const result = checkTournamentState({ matches, proposedState });

    expect(result.status).toBe("failed");
    expect(result.errors).toContain("champion is set before the final is finished");
  });

  it("rejects winner not in match participants", () => {
    const result = check([
      makeMatch({
        status: "finished",
        homeTeam: "Portugal",
        awayTeam: "Uruguay",
        winner: "Ghana",
      }),
    ]);

    expect(result.status).toBe("failed");
    expect(result.errors).toContain("match-1: winner is not a match participant");
  });

  it("rejects stage regression", () => {
    const matches = [
      makeMatch({
        stage: "round_of_16",
        status: "scheduled",
      }),
    ];

    const result = checkTournamentState({
      matches,
      proposedState: detectTournamentState(matches),
      previousStage: "quarter_final",
    });

    expect(result.status).toBe("failed");
    expect(result.errors).toContain("current stage regresses from persisted stage");
  });

  it("rejects more than 104 matches", () => {
    const matches = Array.from({ length: 105 }, (_, index) =>
      makeMatch({ externalId: `match-${index}` }),
    );

    const result = check(matches);

    expect(result.status).toBe("failed");
    expect(result.errors).toContain("tournament has more than 104 matches");
  });

  it("rejects same home and away team", () => {
    const result = check([
      makeMatch({
        homeTeam: "Canada",
        awayTeam: "Canada",
      }),
    ]);

    expect(result.status).toBe("failed");
    expect(result.errors).toContain("match-1: home and away team are the same");
  });

  it("rejects finished final without champion", () => {
    const matches = [
      makeMatch({
        stage: "final",
        status: "finished",
        homeTeam: "Brazil",
        awayTeam: "France",
        homeScore: 1,
        awayScore: 1,
        winner: null,
      }),
    ];

    const result = checkTournamentState({
      matches,
      proposedState: detectTournamentState(matches),
    });

    expect(result.status).toBe("failed");
    expect(result.errors).toContain("final match is finished but champion is null");
  });

  it("accepts a valid completed final", () => {
    const matches = [
      makeMatch({
        stage: "final",
        status: "finished",
        homeTeam: "Brazil",
        awayTeam: "France",
        homeScore: 2,
        awayScore: 1,
        winner: "Brazil",
      }),
    ];

    const result = check(matches);

    expect(result).toEqual({ status: "passed", errors: [] });
  });
});
