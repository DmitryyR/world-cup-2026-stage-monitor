import { describe, expect, it } from "vitest";
import { detectTournamentState } from "@/domain/tournament-stage";
import { makeCompletedPriorStage, makeMatch } from "./fixtures";

describe("detectTournamentState", () => {
  it("detects active group stage", () => {
    const state = detectTournamentState([
      makeMatch({ externalId: "group-active", stage: "group_stage" }),
    ]);

    expect(state.currentStage).toBe("group_stage");
    expect(state.completedMatches).toBe(0);
    expect(state.remainingMatches).toBe(1);
  });

  it("detects active Round of 32", () => {
    const state = detectTournamentState([
      makeCompletedPriorStage("group_stage"),
      makeMatch({ externalId: "r32-active", stage: "round_of_32" }),
    ]);

    expect(state.currentStage).toBe("round_of_32");
  });

  it("detects active Round of 16", () => {
    const state = detectTournamentState([
      makeCompletedPriorStage("round_of_32"),
      makeMatch({ externalId: "r16-active", stage: "round_of_16" }),
    ]);

    expect(state.currentStage).toBe("round_of_16");
  });

  it("detects active quarter-final", () => {
    const state = detectTournamentState([
      makeCompletedPriorStage("round_of_16"),
      makeMatch({ externalId: "qf-active", stage: "quarter_final" }),
    ]);

    expect(state.currentStage).toBe("quarter_final");
  });

  it("detects active semi-final", () => {
    const state = detectTournamentState([
      makeCompletedPriorStage("quarter_final"),
      makeMatch({ externalId: "sf-active", stage: "semi_final" }),
    ]);

    expect(state.currentStage).toBe("semi_final");
  });

  it("detects final when final exists and is not completed", () => {
    const state = detectTournamentState([
      makeCompletedPriorStage("semi_final"),
      makeMatch({ externalId: "final-scheduled", stage: "final" }),
    ]);

    expect(state.currentStage).toBe("final");
    expect(state.champion).toBeNull();
  });

  it("uses earliest unresolved stage when full future schedule exists", () => {
    const state = detectTournamentState([
      makeCompletedPriorStage("round_of_32"),
      makeMatch({
        externalId: "r16-finished",
        stage: "round_of_16",
        status: "finished",
      }),
      makeMatch({ externalId: "r16-scheduled-1", stage: "round_of_16" }),
      makeMatch({ externalId: "r16-scheduled-2", stage: "round_of_16" }),
      makeMatch({ externalId: "qf-future", stage: "quarter_final" }),
      makeMatch({ externalId: "sf-future", stage: "semi_final" }),
      makeMatch({ externalId: "final-future", stage: "final" }),
    ]);

    expect(state.currentStage).toBe("round_of_16");
  });

  it("detects quarter-final when only quarter-finals and later are unresolved", () => {
    const state = detectTournamentState([
      makeCompletedPriorStage("round_of_16"),
      makeMatch({ externalId: "qf-future", stage: "quarter_final" }),
      makeMatch({ externalId: "sf-future", stage: "semi_final" }),
      makeMatch({ externalId: "final-future", stage: "final" }),
    ]);

    expect(state.currentStage).toBe("quarter_final");
  });

  it("detects semi-final when only semi-finals and later are unresolved", () => {
    const state = detectTournamentState([
      makeCompletedPriorStage("quarter_final"),
      makeMatch({ externalId: "sf-future", stage: "semi_final" }),
      makeMatch({ externalId: "final-future", stage: "final" }),
    ]);

    expect(state.currentStage).toBe("semi_final");
  });

  it("detects completed tournament when final is finished with winner", () => {
    const state = detectTournamentState([
      makeMatch({
        externalId: "final-finished",
        stage: "final",
        status: "finished",
        homeTeam: "Brazil",
        awayTeam: "France",
        homeScore: 2,
        awayScore: 1,
        winner: "Brazil",
      }),
    ]);

    expect(state.currentStage).toBe("completed");
    expect(state.champion).toBe("Brazil");
  });

  it("does not regress below a previously persisted stage", () => {
    const state = detectTournamentState(
      [makeMatch({ externalId: "late-group", stage: "group_stage" })],
      { previousStage: "quarter_final" },
    );

    expect(state.currentStage).toBe("quarter_final");
  });
});
