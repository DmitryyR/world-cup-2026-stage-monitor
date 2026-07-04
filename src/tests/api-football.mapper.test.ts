import { describe, expect, it } from "vitest";
import {
  mapApiFootballFixtureToRawProviderMatch,
  mapApiFootballResponseToRawProviderPayload,
  mapApiFootballRoundToInternalRound,
  mapApiFootballStatus,
} from "@/providers/api-football.mapper";
import { makeApiFootballFixture } from "./api-football.fixtures";

describe("api-football mapper", () => {
  it("converts scheduled status without fake score or winner", () => {
    const match = mapApiFootballFixtureToRawProviderMatch(
      makeApiFootballFixture({
        fixture: {
          id: 1,
          date: "2026-06-11T19:00:00+00:00",
          status: { short: "PST", long: "Postponed" },
        },
        goals: {
          home: 2,
          away: 1,
        },
      }),
    );

    expect(match.status).toBe("scheduled");
    expect(match.homeScore).toBeNull();
    expect(match.awayScore).toBeNull();
    expect(match.winner).toBeNull();
  });

  it("converts live status", () => {
    expect(mapApiFootballStatus("LIVE")).toBe("live");
    expect(mapApiFootballStatus("2H")).toBe("live");
  });

  it("converts finished status with winner", () => {
    const match = mapApiFootballFixtureToRawProviderMatch(
      makeApiFootballFixture({
        fixture: {
          id: 2,
          date: "2026-07-19T19:00:00+00:00",
          status: { short: "FT", long: "Match Finished" },
        },
        league: {
          round: "Final",
        },
        teams: {
          home: {
            name: "Brazil",
            winner: true,
          },
          away: {
            name: "France",
            winner: false,
          },
        },
        goals: {
          home: 2,
          away: 1,
        },
      }),
    );

    expect(match.status).toBe("finished");
    expect(match.round).toBe("final");
    expect(match.winner).toBe("Brazil");
    expect(match.homeScore).toBe(2);
    expect(match.awayScore).toBe(1);
  });

  it("maps common round names to internal stages", () => {
    expect(mapApiFootballRoundToInternalRound("Group Stage - 2")).toBe(
      "group_stage",
    );
    expect(mapApiFootballRoundToInternalRound("Round of 32")).toBe(
      "round_of_32",
    );
    expect(mapApiFootballRoundToInternalRound("Round of 16")).toBe(
      "round_of_16",
    );
    expect(mapApiFootballRoundToInternalRound("Quarter-finals")).toBe(
      "quarter_final",
    );
    expect(mapApiFootballRoundToInternalRound("Semi-finals")).toBe("semi_final");
    expect(mapApiFootballRoundToInternalRound("Third Place")).toBe("third_place");
    expect(mapApiFootballRoundToInternalRound("Final")).toBe("final");
  });

  it("throws on unknown round or status so the monitor does not publish it", () => {
    expect(() => mapApiFootballStatus("MYSTERY")).toThrow(
      "Unsupported API-Football fixture status",
    );
    expect(() => mapApiFootballRoundToInternalRound("Unknown Cup Round")).toThrow(
      "Unsupported API-Football fixture round",
    );
  });

  it("preserves raw API response for auditability", () => {
    const response = {
      response: [makeApiFootballFixture()],
    };

    const payload = mapApiFootballResponseToRawProviderPayload(
      response,
      "2026-07-04T12:00:00.000Z",
    );

    expect(payload.source).toBe("api-football");
    expect(payload.rawProviderPayload).toBe(response);
    expect(payload.matches).toHaveLength(1);
  });
});
