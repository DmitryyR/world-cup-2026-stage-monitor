import { MockProvider } from "@/providers/mock-provider";
import type { TournamentDataProvider } from "@/providers/provider";

export function createProvider(): TournamentDataProvider {
  const providerName = process.env.DATA_PROVIDER ?? "mock";

  if (providerName === "mock") {
    return new MockProvider();
  }

  throw new Error(`Unsupported data provider: ${providerName}`);
}

export async function fetcherAgent(provider = createProvider()) {
  return provider.fetchTournamentData();
}
