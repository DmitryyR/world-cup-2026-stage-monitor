import type { AgentRunRecord, NormalizedMatch, TournamentState } from "@/domain/types";
import type { AgentRunInput, PublishSnapshotInput, TournamentRepository } from "./repository";

export class InMemoryTournamentRepository implements TournamentRepository {
  private matches: NormalizedMatch[] = [];
  private states: TournamentState[] = [];
  private runs: AgentRunRecord[] = [];

  constructor(initialState?: {
    matches?: NormalizedMatch[];
    states?: TournamentState[];
    runs?: AgentRunRecord[];
  }) {
    this.matches = initialState?.matches ?? [];
    this.states = initialState?.states ?? [];
    this.runs = initialState?.runs ?? [];
  }

  async getLatestState(): Promise<TournamentState | null> {
    return this.states.at(-1) ?? null;
  }

  async getMatches(): Promise<NormalizedMatch[]> {
    return [...this.matches];
  }

  async getAgentRuns(limit?: number): Promise<AgentRunRecord[]> {
    const runs = [...this.runs].reverse();
    return limit === undefined ? runs : runs.slice(0, limit);
  }

  async publishSnapshot(input: PublishSnapshotInput): Promise<void> {
    this.matches = [...input.matches];
    this.states.push(input.state);
  }

  async logAgentRun(input: AgentRunInput): Promise<AgentRunRecord> {
    const run = {
      id: `run-${this.runs.length + 1}`,
      ...input,
    };

    this.runs.push(run);
    return run;
  }
}
