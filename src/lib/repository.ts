import type {
  AgentRunRecord,
  NormalizedMatch,
  TournamentState,
} from "@/domain/types";

export type PublishSnapshotInput = {
  matches: NormalizedMatch[];
  state: TournamentState;
  rawPayload?: unknown;
};

export type AgentRunInput = Omit<AgentRunRecord, "id">;

export type TournamentRepository = {
  getLatestState(): Promise<TournamentState | null>;
  getMatches(): Promise<NormalizedMatch[]>;
  getAgentRuns(): Promise<AgentRunRecord[]>;
  publishSnapshot(input: PublishSnapshotInput): Promise<void>;
  logAgentRun(input: AgentRunInput): Promise<AgentRunRecord>;
};
