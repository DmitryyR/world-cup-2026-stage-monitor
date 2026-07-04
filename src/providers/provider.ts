import type { RawProviderPayload } from "@/domain/types";

export type TournamentDataProvider = {
  readonly name: string;
  readonly source: string;
  fetchTournamentData(): Promise<RawProviderPayload>;
};
