import { ApiFootballProvider } from "./api-football-provider";
import { MockProvider } from "./mock-provider";
import type { TournamentDataProvider } from "./provider";
import { WorldCup26Provider } from "./worldcup26-provider";

export type ProviderName = "api-football" | "mock" | "worldcup26";

export function createProvider(
  providerName = process.env.DATA_PROVIDER ?? "worldcup26",
): TournamentDataProvider {
  const normalizedProviderName = providerName.trim().toLowerCase();

  if (normalizedProviderName === "mock") {
    return new MockProvider();
  }

  if (normalizedProviderName === "api-football") {
    return new ApiFootballProvider();
  }

  if (normalizedProviderName === "worldcup26") {
    return new WorldCup26Provider();
  }

  throw new Error(
    `Unsupported data provider: ${providerName}. Expected worldcup26, api-football, or mock.`,
  );
}
