import { checkerAgent } from "./checker-agent";
import { fetcherAgent } from "./fetcher-agent";
import { normalizerAgent } from "./normalizer-agent";
import { stageDetectorAgent } from "./stage-detector-agent";
import type { NormalizedMatch, RawProviderPayload, TournamentState } from "@/domain/types";
import type { TournamentDataProvider } from "@/providers/provider";
import type { TournamentRepository } from "@/lib/repository";

export type MonitorLoopResult =
  | {
      status: "passed";
      state: TournamentState;
      changesDetected: number;
    }
  | {
      status: "failed";
      state: TournamentState | null;
      changesDetected: number;
      errors: string[];
    };

type RunMonitorOptions = {
  provider: TournamentDataProvider;
  repository: TournamentRepository;
  now?: () => Date;
};

export async function runMonitorLoop({
  provider,
  repository,
  now = () => new Date(),
}: RunMonitorOptions): Promise<MonitorLoopResult> {
  const startedAt = now().toISOString();
  let source = provider.source;
  let changesDetected = 0;
  let proposedState: TournamentState | null = null;

  try {
    const previousState = await repository.getLatestState();
    const previousMatches = await repository.getMatches();
    const rawPayload = await fetcherAgent(provider);
    source = rawPayload.source;
    const matches = normalizerAgent(rawPayload);
    changesDetected = countDetectedChanges(previousMatches, matches);
    proposedState = stageDetectorAgent(matches);

    const checkerResult = checkerAgent(
      matches,
      proposedState,
      previousState?.currentStage,
    );

    if (checkerResult.status === "failed") {
      await repository.logAgentRun({
        source,
        status: "failed",
        startedAt,
        finishedAt: now().toISOString(),
        changesDetected,
        checkerResult: "failed",
        detectedStage: proposedState.currentStage,
        errorMessage: checkerResult.errors.join("; "),
      });

      return {
        status: "failed",
        state: proposedState,
        changesDetected,
        errors: checkerResult.errors,
      };
    }

    await repository.publishSnapshot({
      matches,
      state: proposedState,
      rawPayload,
    });

    await repository.logAgentRun({
      source,
      status: "passed",
      startedAt,
      finishedAt: now().toISOString(),
      changesDetected,
      checkerResult: "passed",
      detectedStage: proposedState.currentStage,
      errorMessage: null,
    });

    return {
      status: "passed",
      state: proposedState,
      changesDetected,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown monitor error";

    await repository.logAgentRun({
      source,
      status: "failed",
      startedAt,
      finishedAt: now().toISOString(),
      changesDetected,
      checkerResult: "failed",
      detectedStage: proposedState?.currentStage ?? null,
      errorMessage: message,
    });

    return {
      status: "failed",
      state: proposedState,
      changesDetected,
      errors: [message],
    };
  }
}

function countDetectedChanges(
  previousMatches: NormalizedMatch[],
  nextMatches: NormalizedMatch[],
): number {
  const previousById = new Map(
    previousMatches.map((match) => [match.externalId, stableMatchJson(match)]),
  );

  return nextMatches.filter(
    (match) => previousById.get(match.externalId) !== stableMatchJson(match),
  ).length;
}

function stableMatchJson(match: NormalizedMatch): string {
  return JSON.stringify({
    externalId: match.externalId,
    stage: match.stage,
    homeTeam: match.homeTeam,
    awayTeam: match.awayTeam,
    homeScore: match.homeScore,
    awayScore: match.awayScore,
    status: match.status,
    kickoffAt: match.kickoffAt,
    winner: match.winner,
  });
}

export async function runMonitorWithPayload(
  payload: RawProviderPayload,
  repository: TournamentRepository,
): Promise<MonitorLoopResult> {
  return runMonitorLoop({
    provider: {
      source: payload.source,
      async fetchTournamentData() {
        return payload;
      },
    },
    repository,
  });
}
