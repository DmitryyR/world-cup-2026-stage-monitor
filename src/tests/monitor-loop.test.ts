import { describe, expect, it } from "vitest";
import { runMonitorLoop, runMonitorWithPayload } from "@/agents/monitor-loop";
import { InMemoryTournamentRepository } from "@/lib/in-memory-repository";
import type { TournamentDataProvider } from "@/providers/provider";
import type { RawProviderPayload } from "@/domain/types";

function makePayload(
  matches: RawProviderPayload["matches"],
  source = "test-provider",
): RawProviderPayload {
  return {
    source,
    fetchedAt: "2026-07-04T12:00:00.000Z",
    matches,
  };
}

describe("runMonitorLoop", () => {
  it("updates public state for valid provider data", async () => {
    const repository = new InMemoryTournamentRepository();

    const result = await runMonitorWithPayload(
      makePayload([
        {
          id: "group-1",
          round: "group_stage",
          home: "Canada",
          away: "Mexico",
          homeScore: 2,
          awayScore: 1,
          status: "finished",
          kickoffAt: "2026-06-11T19:00:00.000Z",
          winner: "Canada",
        },
        {
          id: "r32-1",
          round: "round_of_32",
          home: "Brazil",
          away: "Germany",
          status: "scheduled",
          kickoffAt: "2026-06-28T19:00:00.000Z",
          winner: null,
        },
      ]),
      repository,
    );

    const latestState = await repository.getLatestState();
    const runs = await repository.getAgentRuns();

    expect(result.status).toBe("passed");
    expect(latestState?.currentStage).toBe("round_of_32");
    expect(runs[0]?.checkerResult).toBe("passed");
  });

  it("logs failed runs for invalid provider data", async () => {
    const repository = new InMemoryTournamentRepository();

    const result = await runMonitorWithPayload(
      makePayload([
        {
          id: "group-1",
          round: "group_stage",
          home: "Canada",
          away: "Mexico",
          status: "scheduled",
          kickoffAt: "2026-06-11T19:00:00.000Z",
          winner: "Canada",
        },
      ]),
      repository,
    );

    const runs = await repository.getAgentRuns();

    expect(result.status).toBe("failed");
    expect(runs).toHaveLength(1);
    expect(runs[0]?.checkerResult).toBe("failed");
    expect(runs[0]?.errorMessage).toContain("scheduled match has a winner");
  });

  it("does not update public state when provider data is invalid", async () => {
    const repository = new InMemoryTournamentRepository();

    await runMonitorWithPayload(
      makePayload([
        {
          id: "final-1",
          round: "final",
          home: "Brazil",
          away: "France",
          homeScore: 2,
          awayScore: 1,
          status: "finished",
          kickoffAt: "2026-07-19T19:00:00.000Z",
          winner: "Brazil",
        },
      ]),
      repository,
    );

    const acceptedState = await repository.getLatestState();

    await runMonitorWithPayload(
      makePayload([
        {
          id: "group-1",
          round: "group_stage",
          home: "Canada",
          away: "Mexico",
          status: "scheduled",
          kickoffAt: "2026-06-11T19:00:00.000Z",
          winner: "Canada",
        },
      ]),
      repository,
    );

    const latestState = await repository.getLatestState();
    const runs = await repository.getAgentRuns();

    expect(acceptedState?.currentStage).toBe("completed");
    expect(latestState).toEqual(acceptedState);
    expect(runs[0]?.checkerResult).toBe("failed");
  });

  it("logs failed provider runs and keeps previous public state", async () => {
    const repository = new InMemoryTournamentRepository();

    await runMonitorWithPayload(
      makePayload([
        {
          id: "final-1",
          round: "final",
          home: "Brazil",
          away: "France",
          homeScore: 2,
          awayScore: 1,
          status: "finished",
          kickoffAt: "2026-07-19T19:00:00.000Z",
          winner: "Brazil",
        },
      ]),
      repository,
    );

    const acceptedState = await repository.getLatestState();
    const acceptedMatches = await repository.getMatches();
    const failingProvider: TournamentDataProvider = {
      name: "api-football",
      source: "api-football",
      async fetchTournamentData() {
        throw new Error("provider unavailable");
      },
    };

    const failedResult = await runMonitorLoop({
      provider: failingProvider,
      repository,
    });
    const latestState = await repository.getLatestState();
    const latestMatches = await repository.getMatches();
    const runs = await repository.getAgentRuns();

    expect(failedResult.status).toBe("failed");
    expect(latestState).toEqual(acceptedState);
    expect(latestMatches).toEqual(acceptedMatches);
    expect(runs[0]?.source).toBe("api-football");
    expect(runs[0]?.checkerResult).toBe("failed");
    expect(runs[0]?.errorMessage).toBe("provider unavailable");
  });

  it("persists valid worldcup26 fixture data", async () => {
    const repository = new InMemoryTournamentRepository();
    const provider: TournamentDataProvider = {
      name: "worldcup26",
      source: "worldcup26",
      async fetchTournamentData() {
        return makePayload(
          [
            {
              id: "1",
              round: "group_stage",
              home: "Mexico",
              away: "South Africa",
              homeScore: 2,
              awayScore: 0,
              status: "finished",
              kickoffAt: "2026-06-11T13:00:00.000Z",
              winner: "Mexico",
            },
          ],
          "worldcup26",
        );
      },
    };

    const result = await runMonitorLoop({ provider, repository });
    const matches = await repository.getMatches();

    expect(result.status).toBe("passed");
    expect(matches).toHaveLength(1);
    expect(matches[0]?.externalId).toBe("1");
  });
});
