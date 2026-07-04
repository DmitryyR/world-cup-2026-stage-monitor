import type { ApiFootballFixture } from "@/providers/api-football.schemas";

export function makeApiFootballFixture(
  overrides: Partial<ApiFootballFixture> = {},
): ApiFootballFixture {
  return {
    fixture: {
      id: 1001,
      date: "2026-06-11T19:00:00+00:00",
      status: {
        short: "NS",
        long: "Not Started",
      },
      ...overrides.fixture,
    },
    league: {
      round: "Group Stage - 1",
      ...overrides.league,
    },
    teams: {
      home: {
        name: "Canada",
        winner: null,
        ...overrides.teams?.home,
      },
      away: {
        name: "Mexico",
        winner: null,
        ...overrides.teams?.away,
      },
    },
    goals: {
      home: null,
      away: null,
      ...overrides.goals,
    },
  };
}
