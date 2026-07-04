import { createProvider } from "@/providers/provider-factory";
import type { TournamentDataProvider } from "@/providers/provider";

export async function fetcherAgent(provider = createProvider()) {
  return provider.fetchTournamentData();
}

export { createProvider };
