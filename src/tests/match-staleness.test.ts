import { describe, expect, it } from "vitest";
import type { NormalizedMatch } from "@/domain/types";
import {
  isFutureScheduledMatch,
  isStaleScheduledMatch,
} from "@/lib/match-staleness";
import { getDisplayMatchStatus, getMatchReviewLabel } from "@/lib/knockout-display";

describe("match staleness helpers", () => {
  it("marks scheduled matches past the grace window as needs review for display", () => {
    const match = makeMatch({
      kickoffAt: "2026-07-06T12:00:00.000Z",
      status: "scheduled",
    });
    const now = new Date("2026-07-07T12:00:00.000Z");

    expect(isStaleScheduledMatch(match, now)).toBe(true);
    expect(getDisplayMatchStatus(match, now)).toBe("needs_review");
    expect(getMatchReviewLabel(match, now)).toBe("Scheduled time passed");
  });

  it("keeps future scheduled matches eligible for next and upcoming cards", () => {
    const match = makeMatch({
      kickoffAt: "2026-07-10T12:00:00.000Z",
      status: "scheduled",
    });
    const now = new Date("2026-07-07T12:00:00.000Z");

    expect(isFutureScheduledMatch(match, now)).toBe(true);
    expect(isStaleScheduledMatch(match, now)).toBe(false);
    expect(getDisplayMatchStatus(match, now)).toBe("scheduled");
  });

  it("does not mark invalid dates as stale", () => {
    const match = makeMatch({
      kickoffAt: "not-a-date",
      status: "scheduled",
    });

    expect(isFutureScheduledMatch(match)).toBe(false);
    expect(isStaleScheduledMatch(match)).toBe(false);
  });
});

function makeMatch(overrides: Partial<NormalizedMatch> = {}): NormalizedMatch {
  return {
    externalId: "test-match",
    stage: "round_of_16",
    homeTeam: "Paraguay",
    awayTeam: "France",
    homeScore: null,
    awayScore: null,
    status: "scheduled",
    kickoffAt: "2026-07-10T12:00:00.000Z",
    winner: null,
    ...overrides,
  };
}
