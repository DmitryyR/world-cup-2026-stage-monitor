import sampleData from "@/data/worldcup-2026-sample.json";
import { rawProviderPayloadSchema } from "@/domain/schemas";
import type { RawProviderPayload } from "@/domain/types";
import type { TournamentDataProvider } from "./provider";

export class MockProvider implements TournamentDataProvider {
  readonly source = "mock";

  async fetchTournamentData(): Promise<RawProviderPayload> {
    return rawProviderPayloadSchema.parse(sampleData);
  }
}
