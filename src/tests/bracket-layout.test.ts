import { describe, expect, it } from "vitest";
import { buildBracketModel } from "@/domain/bracket-builder";
import { buildBracketLayout } from "@/domain/bracket-layout";
import type { NormalizedMatch, TournamentStage } from "@/domain/types";

describe("bracket layout", () => {
  it("splits the 32-team bracket into left and right halves", () => {
    const layout = buildBracketLayout(buildBracketModel(makeFullKnockoutMatches()));
    const leftR32 = layout.slots.filter(
      (slot) => slot.side === "left" && slot.round === "round_of_32",
    );
    const rightR32 = layout.slots.filter(
      (slot) => slot.side === "right" && slot.round === "round_of_32",
    );

    expect(leftR32).toHaveLength(8);
    expect(rightR32).toHaveLength(8);
    expect(leftR32[0]).toMatchObject({
      gridColumn: 1,
      gridRow: 1,
      match: expect.objectContaining({ externalId: "1" }),
    });
    expect(rightR32[0]).toMatchObject({
      gridColumn: 9,
      gridRow: 1,
      match: expect.objectContaining({ externalId: "9" }),
    });
  });

  it("positions later rounds between source match lanes", () => {
    const layout = buildBracketLayout(buildBracketModel(makeFullKnockoutMatches()));
    const leftR16 = layout.slots.filter(
      (slot) => slot.side === "left" && slot.round === "round_of_16",
    );
    const leftQuarterFinals = layout.slots.filter(
      (slot) => slot.side === "left" && slot.round === "quarter_final",
    );
    const leftSemiFinal = layout.slots.find(
      (slot) => slot.side === "left" && slot.round === "semi_final",
    );

    expect(leftR16.map((slot) => slot.gridRow)).toEqual([3, 11, 19, 27]);
    expect(leftQuarterFinals.map((slot) => slot.gridRow)).toEqual([7, 23]);
    expect(leftSemiFinal?.gridRow).toBe(15);
  });

  it("connects semifinals into the final and bronze final", () => {
    const layout = buildBracketLayout(buildBracketModel(makeFullKnockoutMatches()));
    const finalSlot = layout.slots.find((slot) => slot.id === "center-final-0");
    const bronzeSlot = layout.slots.find((slot) => slot.id === "center-third_place-0");

    expect(finalSlot?.sourceMatchIds).toEqual(["29", "30"]);
    expect(bronzeSlot?.sourceMatchIds).toEqual(["29", "30"]);
    expect(
      layout.connectors.some(
        (connector) =>
          connector.kind === "winner" &&
          connector.fromSlotId === "left-semi_final-0" &&
          connector.toSlotId === "center-final-0",
      ),
    ).toBe(true);
    expect(
      layout.connectors.some(
        (connector) =>
          connector.kind === "loser" &&
          connector.fromSlotId === "right-semi_final-0" &&
          connector.toSlotId === "center-third_place-0",
      ),
    ).toBe(true);
  });
});

function makeFullKnockoutMatches(): NormalizedMatch[] {
  return [
    ...makeStage("round_of_32", 1, 16),
    ...makeStage("round_of_16", 17, 8),
    ...makeStage("quarter_final", 25, 4),
    ...makeStage("semi_final", 29, 2),
    makeMatch("31", "third_place"),
    makeMatch("32", "final"),
  ];
}

function makeStage(
  stage: TournamentStage,
  startId: number,
  count: number,
): NormalizedMatch[] {
  return Array.from({ length: count }, (_, index) =>
    makeMatch(String(startId + index), stage),
  );
}

function makeMatch(externalId: string, stage: TournamentStage): NormalizedMatch {
  return {
    externalId,
    stage,
    homeTeam: `Home ${externalId}`,
    awayTeam: `Away ${externalId}`,
    homeScore: null,
    awayScore: null,
    status: "scheduled",
    kickoffAt: "2026-07-01T18:00:00.000Z",
    winner: null,
  };
}
