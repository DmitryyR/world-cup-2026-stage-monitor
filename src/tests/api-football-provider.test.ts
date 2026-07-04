import { describe, expect, it, vi } from "vitest";
import { ApiFootballProvider } from "@/providers/api-football-provider";
import { makeApiFootballFixture } from "./api-football.fixtures";

describe("ApiFootballProvider", () => {
  it("requires API_FOOTBALL_KEY", async () => {
    const provider = new ApiFootballProvider({ apiKey: "" });

    await expect(provider.fetchTournamentData()).rejects.toThrow(
      "API_FOOTBALL_KEY is required when DATA_PROVIDER=api-football",
    );
  });

  it("fetches fixtures with configured query parameters and API key header", async () => {
    const fetchMock = vi.fn(
      async (_input: URL, _init?: RequestInit): Promise<Response> => {
      return new Response(
        JSON.stringify({
          response: [makeApiFootballFixture()],
        }),
        { status: 200 },
      );
      },
    );
    const fetchImpl = fetchMock as unknown as typeof fetch;
    const provider = new ApiFootballProvider({
      apiKey: "secret",
      baseUrl: "https://example.test",
      leagueId: "1",
      season: "2026",
      timeoutMs: 1000,
      fetchImpl,
    });

    const payload = await provider.fetchTournamentData();
    const [url, options] = fetchMock.mock.calls[0]!;

    expect(url.toString()).toBe(
      "https://example.test/fixtures?league=1&season=2026",
    );
    expect(options?.headers).toEqual({
      "x-apisports-key": "secret",
    });
    expect(payload.source).toBe("api-football");
    expect(payload.matches).toHaveLength(1);
  });
});
