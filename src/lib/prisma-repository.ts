import type {
  AgentRunRecord,
  CheckerStatus,
  NormalizedMatch,
  TournamentStage,
  TournamentState,
} from "@/domain/types";
import { extractPenaltyScore } from "@/domain/penalty-score";
import { prisma } from "./db";
import type { AgentRunInput, PublishSnapshotInput, TournamentRepository } from "./repository";

const DEFAULT_AGENT_RUN_LIMIT = 50;

export class PrismaTournamentRepository implements TournamentRepository {
  async getLatestState(): Promise<TournamentState | null> {
    try {
      const state = await prisma.tournamentState.findFirst({
        orderBy: {
          createdAt: "desc",
        },
        select: {
          currentStage: true,
          completedMatches: true,
          remainingMatches: true,
          champion: true,
          lastCheckedAt: true,
          checkerStatus: true,
        },
      });

      if (!state) {
        logDbRead("getLatestState", 0);
        return null;
      }

      logDbRead("getLatestState", 1);
      return {
        currentStage: state.currentStage as TournamentStage,
        completedMatches: state.completedMatches,
        remainingMatches: state.remainingMatches,
        champion: state.champion,
        lastCheckedAt: state.lastCheckedAt.toISOString(),
        checkerStatus: state.checkerStatus as CheckerStatus,
      };
    } catch (error) {
      logDbFailure("getLatestState", error);
      return null;
    }
  }

  async getMatches(): Promise<NormalizedMatch[]> {
    try {
      const matches = await prisma.match.findMany({
        orderBy: {
          kickoffAt: "asc",
        },
        select: {
          externalId: true,
          stage: true,
          homeTeam: true,
          awayTeam: true,
          homeScore: true,
          awayScore: true,
          status: true,
          kickoffAt: true,
          winner: true,
          rawPayload: true,
        },
      });

      logDbRead("getMatches", matches.length);
      return matches.map((match) => {
        const rawPayload = parseRawPayload(match.rawPayload);

        return {
        externalId: match.externalId,
        stage: match.stage as TournamentStage,
        homeTeam: match.homeTeam,
        awayTeam: match.awayTeam,
        homeScore: match.homeScore,
        awayScore: match.awayScore,
        status: match.status as NormalizedMatch["status"],
        kickoffAt: match.kickoffAt.toISOString(),
        winner: match.winner,
        penaltyScore: extractPenaltyScore(rawPayload),
        rawPayload,
      };
      });
    } catch (error) {
      logDbFailure("getMatches", error);
      return [];
    }
  }

  async getAgentRuns(limit = DEFAULT_AGENT_RUN_LIMIT): Promise<AgentRunRecord[]> {
    try {
      const runs = await prisma.agentRun.findMany({
        orderBy: {
          startedAt: "desc",
        },
        take: limit,
        select: {
          id: true,
          source: true,
          status: true,
          startedAt: true,
          finishedAt: true,
          changesDetected: true,
          checkerResult: true,
          detectedStage: true,
          errorMessage: true,
        },
      });

      logDbRead("getAgentRuns", runs.length);
      return runs.map((run) => ({
        id: run.id,
        source: run.source,
        status: run.status as CheckerStatus,
        startedAt: run.startedAt.toISOString(),
        finishedAt: run.finishedAt?.toISOString() ?? null,
        changesDetected: run.changesDetected,
        checkerResult: run.checkerResult as CheckerStatus,
        detectedStage: (run.detectedStage as TournamentStage | null) ?? null,
        errorMessage: run.errorMessage,
      }));
    } catch (error) {
      logDbFailure("getAgentRuns", error);
      return [];
    }
  }

  async publishSnapshot(input: PublishSnapshotInput): Promise<void> {
    await prisma.$transaction([
      prisma.match.deleteMany(),
      ...input.matches.map((match) =>
        prisma.match.create({
          data: {
            externalId: match.externalId,
            stage: match.stage,
            homeTeam: match.homeTeam,
            awayTeam: match.awayTeam,
            homeScore: match.homeScore,
            awayScore: match.awayScore,
            status: match.status,
            kickoffAt: new Date(match.kickoffAt),
            winner: match.winner,
            rawPayload: serializeRawPayload(match),
          },
        }),
      ),
      prisma.tournamentState.create({
        data: {
          currentStage: input.state.currentStage,
          completedMatches: input.state.completedMatches,
          remainingMatches: input.state.remainingMatches,
          champion: input.state.champion,
          lastCheckedAt: new Date(input.state.lastCheckedAt),
          checkerStatus: input.state.checkerStatus,
        },
      }),
    ]);
  }

  async logAgentRun(input: AgentRunInput): Promise<AgentRunRecord> {
    const run = await prisma.agentRun.create({
      data: {
        source: input.source,
        status: input.status,
        startedAt: new Date(input.startedAt),
        finishedAt: input.finishedAt ? new Date(input.finishedAt) : null,
        changesDetected: input.changesDetected,
        checkerResult: input.checkerResult,
        detectedStage: input.detectedStage,
        errorMessage: input.errorMessage,
      },
      select: {
        id: true,
        source: true,
        status: true,
        startedAt: true,
        finishedAt: true,
        changesDetected: true,
        checkerResult: true,
        detectedStage: true,
        errorMessage: true,
      },
    });

    return {
      id: run.id,
      source: run.source,
      status: run.status as CheckerStatus,
      startedAt: run.startedAt.toISOString(),
      finishedAt: run.finishedAt?.toISOString() ?? null,
      changesDetected: run.changesDetected,
      checkerResult: run.checkerResult as CheckerStatus,
      detectedStage: (run.detectedStage as TournamentStage | null) ?? null,
      errorMessage: run.errorMessage,
    };
  }
}

function logDbRead(method: string, rows: number): void {
  if (process.env.NODE_ENV !== "production") {
    console.info(`[db] ${method}: ${rows} rows`);
  }
}

function logDbFailure(method: string, error: unknown): void {
  if (process.env.NODE_ENV !== "production") {
    const message = error instanceof Error ? error.message : "unknown database error";
    console.warn(`[db] ${method} failed: ${message}`);
  }
}

function parseRawPayload(value: string | null): unknown {
  if (!value) {
    return undefined;
  }

  try {
    return JSON.parse(value);
  } catch {
    return undefined;
  }
}

function serializeRawPayload(match: NormalizedMatch): string | null {
  if (match.rawPayload === undefined && !match.penaltyScore) {
    return null;
  }

  if (isRecord(match.rawPayload)) {
    return JSON.stringify({
      ...match.rawPayload,
      ...(match.penaltyScore ? { penaltyScore: match.penaltyScore } : {}),
    });
  }

  return JSON.stringify({
    rawPayload: match.rawPayload,
    ...(match.penaltyScore ? { penaltyScore: match.penaltyScore } : {}),
  });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
