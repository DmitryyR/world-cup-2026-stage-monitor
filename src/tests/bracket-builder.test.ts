import { describe, expect, it } from "vitest";
import {
  buildBracketModel,
  formatParticipantLabel,
  formatWinMethodLabel,
  resolveKnockoutOutcome,
} from "@/domain/bracket-builder";
import type { NormalizedMatch, TournamentStage } from "@/domain/types";

const kickoffAt = "2026-07-01T18:00:00.000Z";

describe("bracket builder", () => {
  it("formats raw placeholder participant labels", () => {
    expect(formatParticipantLabel("WO Winner of Portugal vs Spain")).toBe(
      "Winner of Portugal vs Spain",
    );
    expect(formatParticipantLabel("LO Loser of Semi-final 1")).toBe(
      "Loser of Semi-final 1",
    );
    expect(formatParticipantLabel("WM Winner Match 93")).toBe("Winner of Match 93");
    expect(formatParticipantLabel("LM Loser Match 101")).toBe("Loser of Match 101");
  });

  it("resolves finished knockout match with non-tied score as regular time", () => {
    const match = makeMatch({
      homeTeam: "France",
      awayTeam: "Japan",
      homeScore: 2,
      awayScore: 1,
      winner: "France",
    });

    expect(resolveKnockoutOutcome(match)).toMatchObject({
      winner: "France",
      winMethod: "regular_time",
      needsReview: false,
    });
  });

  it("resolves tied finished match from penalty fields", () => {
    const match = makeMatch({
      homeTeam: "Germany",
      awayTeam: "Paraguay",
      homeScore: 1,
      awayScore: 1,
      rawPayload: {
        home_penalty_score: "3",
        away_penalty_score: "4",
      },
    });

    expect(resolveKnockoutOutcome(match)).toMatchObject({
      winner: "Paraguay",
      winMethod: "penalties",
      needsReview: false,
    });
  });

  it("resolves tied finished match from alternate provider penalty field names", () => {
    const match = makeMatch({
      homeTeam: "Australia",
      awayTeam: "Egypt",
      homeScore: 1,
      awayScore: 1,
      rawPayload: {
        home_penalties: "3",
        away_penalties: "5",
      },
    });

    expect(resolveKnockoutOutcome(match)).toMatchObject({
      winner: "Egypt",
      winMethod: "penalties",
      needsReview: false,
    });
  });

  it("resolves tied finished match from provider side winner flags", () => {
    const match = makeMatch({
      homeTeam: "Switzerland",
      awayTeam: "Colombia",
      homeScore: 0,
      awayScore: 0,
      rawPayload: {
        home_winner: false,
        away_winner: true,
      },
    });

    expect(resolveKnockoutOutcome(match)).toMatchObject({
      winner: "Colombia",
      winMethod: "unknown",
      needsReview: false,
    });
  });

  it("resolves tied finished match from provider penalty note", () => {
    const match = makeMatch({
      homeTeam: "Netherlands",
      awayTeam: "Morocco",
      homeScore: 1,
      awayScore: 1,
      rawPayload: {
        result_description: "Morocco won on penalties",
      },
    });

    expect(resolveKnockoutOutcome(match)).toMatchObject({
      winner: "Morocco",
      winMethod: "penalties",
      needsReview: false,
    });
  });

  it("resolves tied finished match from provider extra-time note", () => {
    const match = makeMatch({
      homeTeam: "Australia",
      awayTeam: "Egypt",
      homeScore: 1,
      awayScore: 1,
      rawPayload: {
        result_note: "Egypt won after extra time",
      },
    });

    expect(resolveKnockoutOutcome(match)).toMatchObject({
      winner: "Egypt",
      winMethod: "extra_time",
      needsReview: false,
    });
  });

  it("resolves tied finished match with explicit winner and unknown method", () => {
    const match = makeMatch({
      homeTeam: "Portugal",
      awayTeam: "Spain",
      homeScore: 2,
      awayScore: 2,
      rawPayload: {
        qualified_team_name_en: "Spain",
      },
    });

    expect(resolveKnockoutOutcome(match)).toMatchObject({
      winner: "Spain",
      winMethod: "unknown",
      needsReview: false,
    });
  });

  it("marks tied finished match without resolvable winner as needs review", () => {
    const match = makeMatch({
      homeTeam: "Brazil",
      awayTeam: "Norway",
      homeScore: 1,
      awayScore: 1,
    });

    expect(resolveKnockoutOutcome(match)).toMatchObject({
      winner: null,
      winMethod: "unknown",
      needsReview: true,
      reviewReason: "Finished tied knockout match has no resolvable winner",
    });
  });

  it("infers tied match winner from dependent next-round raw label", () => {
    const source = makeMatch({
      externalId: "74",
      homeTeam: "Germany",
      awayTeam: "Paraguay",
      homeScore: 1,
      awayScore: 1,
    });
    const next = makeMatch({
      externalId: "89",
      stage: "round_of_16",
      status: "scheduled",
      homeTeam: "Paraguay",
      awayTeam: "France",
      homeScore: null,
      awayScore: null,
      rawPayload: {
        home_team_label: "Winner Match 74",
        away_team_label: "Winner Match 77",
      },
    });

    expect(resolveKnockoutOutcome(source, [source, next])).toMatchObject({
      winner: "Paraguay",
      winMethod: "inferred_from_next_round",
      needsReview: false,
    });
  });

  it("infers tied match winner from the next bracket slot when dependency labels are missing", () => {
    const first = makeMatch({
      externalId: "73",
      homeTeam: "Portugal",
      awayTeam: "Croatia",
      homeScore: 2,
      awayScore: 0,
      winner: "Portugal",
    });
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
      homeTeam: "Portugal",
      awayTeam: "Paraguay",
      homeScore: null,
      awayScore: null,
      winner: null,
    });

    expect(resolveKnockoutOutcome(source, [first, source, next])).toMatchObject({
      winner: "Paraguay",
      winMethod: "inferred_from_next_round",
      needsReview: false,
    });
  });

  it("shows user-friendly dependency labels for scheduled future matches", () => {
    const r16a = makeMatch({
      externalId: "89",
      stage: "round_of_16",
      status: "live",
      homeTeam: "Paraguay",
      awayTeam: "France",
      homeScore: 0,
      awayScore: 0,
    });
    const r16b = makeMatch({
      externalId: "90",
      stage: "round_of_16",
      homeTeam: "Canada",
      awayTeam: "Morocco",
      homeScore: 0,
      awayScore: 3,
      winner: "Morocco",
    });
    const qf = makeMatch({
      externalId: "97",
      stage: "quarter_final",
      status: "scheduled",
      homeTeam: "Winner Match 89",
      awayTeam: "Winner Match 90",
      homeScore: null,
      awayScore: null,
    });

    const model = buildBracketModel([r16a, r16b, qf]);
    const qfMatch = model.rounds
      .find((round) => round.stage === "quarter_final")
      ?.matches.find((match) => match.externalId === "97");

    expect(qfMatch?.homeParticipant.label).toBe("Winner of Paraguay vs France");
    expect(qfMatch?.awayParticipant.label).toBe("Morocco");
    expect(qfMatch?.homeParticipant.label).not.toContain("Match 89");
  });

  it("orders rounds by dependency tree before falling back to match number", () => {
    const matches = [
      makeMatch({ externalId: "90", stage: "round_of_16" }),
      makeMatch({ externalId: "89", stage: "round_of_16" }),
      makeMatch({
        externalId: "97",
        stage: "quarter_final",
        status: "scheduled",
        homeTeam: "Winner Match 89",
        awayTeam: "Winner Match 90",
        homeScore: null,
        awayScore: null,
      }),
    ];

    const model = buildBracketModel(matches);
    const orderedR16 = model.rounds
      .find((round) => round.stage === "round_of_16")
      ?.matches.map((match) => match.externalId);

    expect(orderedR16).toEqual(["89", "90"]);
  });

  it("does not display a finished knockout as normal without winner or review", () => {
    const model = buildBracketModel([
      makeMatch({
        externalId: "88",
        homeTeam: "Australia",
        awayTeam: "Egypt",
        homeScore: 1,
        awayScore: 1,
      }),
    ]);
    const match = model.rounds[0].matches[0];

    expect(match.status).toBe("finished");
    expect(match.winner ?? match.needsReview).toBeTruthy();
  });

  it("reports scheduled knockout matches whose kickoff time has passed", () => {
    const model = buildBracketModel([
      makeMatch({
        externalId: "89",
        stage: "round_of_16",
        status: "scheduled",
        homeScore: null,
        awayScore: null,
        kickoffAt: "2020-07-01T18:00:00.000Z",
      }),
    ]);

    expect(model.validation.staleScheduledMatches).toBe(1);
    expect(model.validation.needsReviewMatches).toBe(1);
    expect(model.validation.affectedMatches[0]).toMatchObject({
      externalId: "89",
      reason: "Scheduled match kickoff time has passed without live or finished status",
    });
  });

  it("formats win method labels", () => {
    const model = buildBracketModel([
      makeMatch({
        homeTeam: "Germany",
        awayTeam: "Paraguay",
        homeScore: 1,
        awayScore: 1,
        rawPayload: {
          home_penalty_score: "3",
          away_penalty_score: "4",
        },
      }),
    ]);

    expect(formatWinMethodLabel(model.rounds[0].matches[0])).toBe(
      "Paraguay won 4 - 3 on penalties",
    );
  });

  it("formats regular-time winner labels explicitly", () => {
    const model = buildBracketModel([
      makeMatch({
        homeTeam: "Morocco",
        awayTeam: "Canada",
        homeScore: 3,
        awayScore: 0,
        winner: "Morocco",
      }),
    ]);

    expect(formatWinMethodLabel(model.rounds[0].matches[0])).toBe(
      "Morocco won in regular time",
    );
  });

  it("formats winner labels with normalized team names", () => {
    const model = buildBracketModel([
      makeMatch({
        homeTeam: "JO Jordan",
        awayTeam: "PA Panama",
        homeScore: 2,
        awayScore: 1,
        winner: "JO Jordan",
      }),
    ]);

    expect(formatWinMethodLabel(model.rounds[0].matches[0])).toBe(
      "Jordan won in regular time",
    );
  });
});

function makeMatch(overrides: Partial<NormalizedMatch> = {}): NormalizedMatch {
  return {
    externalId: "1",
    stage: "round_of_32" as TournamentStage,
    homeTeam: "Home",
    awayTeam: "Away",
    homeScore: 1,
    awayScore: 0,
    status: "finished",
    kickoffAt,
    winner: null,
    ...overrides,
  };
}
