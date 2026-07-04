import { afterEach, describe, expect, it, vi } from "vitest";
import { fetcherAgent } from "@/agents/fetcher-agent";
import { MockProvider } from "@/providers/mock-provider";
import { ApiFootballProvider } from "@/providers/api-football-provider";
import { createProvider } from "@/providers/provider-factory";
import { WorldCup26Provider } from "@/providers/worldcup26-provider";

describe("createProvider", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("returns MockProvider when DATA_PROVIDER=mock", () => {
    vi.stubEnv("DATA_PROVIDER", "mock");

    expect(createProvider()).toBeInstanceOf(MockProvider);
  });

  it("returns ApiFootballProvider when DATA_PROVIDER=api-football", () => {
    vi.stubEnv("DATA_PROVIDER", "api-football");

    expect(createProvider()).toBeInstanceOf(ApiFootballProvider);
  });

  it("returns WorldCup26Provider when DATA_PROVIDER=worldcup26", () => {
    vi.stubEnv("DATA_PROVIDER", "worldcup26");

    expect(createProvider()).toBeInstanceOf(WorldCup26Provider);
  });

  it("fails safely when api-football is selected without API_FOOTBALL_KEY", async () => {
    vi.stubEnv("DATA_PROVIDER", "api-football");
    vi.stubEnv("API_FOOTBALL_KEY", "");

    await expect(fetcherAgent()).rejects.toThrow(
      "API_FOOTBALL_KEY is required when DATA_PROVIDER=api-football",
    );
  });
});
