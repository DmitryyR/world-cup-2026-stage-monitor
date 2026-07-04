import { describe, expect, it, vi } from "vitest";
import { WorldCup26Provider } from "@/providers/worldcup26-provider";
import { makeWorldCup26Game } from "./worldcup26.fixtures";

describe("WorldCup26Provider", () => {
  it("does not require an API key and fetches games from /get/games", async () => {
    const fetchMock = vi.fn(
      async (_input: URL, _init?: RequestInit): Promise<Response> => {
        return new Response(
          JSON.stringify({
            games: [makeWorldCup26Game()],
          }),
          { status: 200 },
        );
      },
    );
    const provider = new WorldCup26Provider({
      baseUrl: "https://example.test",
      timeoutMs: 1000,
      fetchImpl: fetchMock as unknown as typeof fetch,
    });

    const payload = await provider.fetchTournamentData();
    const [url] = fetchMock.mock.calls[0]!;

    expect(url.toString()).toBe("https://example.test/get/games");
    expect(payload.source).toBe("worldcup26");
    expect(payload.matches).toHaveLength(1);
  });

  it("fails when response has zero games", async () => {
    const fetchMock = vi.fn(
      async (_input: URL, _init?: RequestInit): Promise<Response> => {
        return new Response(JSON.stringify({ games: [] }), { status: 200 });
      },
    );
    const provider = new WorldCup26Provider({
      baseUrl: "https://example.test",
      fetchImpl: fetchMock as unknown as typeof fetch,
    });

    await expect(provider.fetchTournamentData()).rejects.toThrow(
      "WorldCup26Provider returned zero games",
    );
  });
});
