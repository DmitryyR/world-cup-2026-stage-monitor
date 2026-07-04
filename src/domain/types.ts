export type MatchStatus = "scheduled" | "live" | "finished";

export type TournamentStage =
  | "group_stage"
  | "round_of_32"
  | "round_of_16"
  | "quarter_final"
  | "semi_final"
  | "third_place"
  | "final"
  | "completed";

export type NormalizedMatch = {
  externalId: string;
  stage: TournamentStage;
  homeTeam: string;
  awayTeam: string;
  homeScore: number | null;
  awayScore: number | null;
  status: MatchStatus;
  kickoffAt: string;
  winner: string | null;
};

export type CheckerStatus = "passed" | "failed";

export type TournamentState = {
  currentStage: TournamentStage;
  completedMatches: number;
  remainingMatches: number;
  champion: string | null;
  lastCheckedAt: string;
  checkerStatus: CheckerStatus;
};

export type CheckerResult =
  | {
      status: "passed";
      errors: [];
    }
  | {
      status: "failed";
      errors: string[];
    };

export type RawProviderMatch = {
  id: string;
  round: string;
  home: string;
  away: string;
  homeScore?: number | null;
  awayScore?: number | null;
  status: MatchStatus;
  kickoffAt: string;
  winner?: string | null;
};

export type RawProviderPayload = {
  source: string;
  fetchedAt: string;
  matches: RawProviderMatch[];
};

export type AgentRunRecord = {
  id: string;
  source: string;
  status: CheckerStatus;
  startedAt: string;
  finishedAt: string | null;
  changesDetected: number;
  checkerResult: CheckerStatus;
  detectedStage: TournamentStage | null;
  errorMessage: string | null;
};
