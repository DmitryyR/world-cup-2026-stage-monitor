import type { RawProviderPayload } from "@/domain/types";

export type TournamentDataProvider = {
  readonly source: string;
  fetchTournamentData(): Promise<RawProviderPayload>;
};
