import type {
  AgentRunRecord,
  CheckerStatus,
  NormalizedMatch,
  TournamentStage,
  TournamentState,
} from "@/domain/types";
import { prisma } from "./db";
import type { AgentRunInput, PublishSnapshotInput, TournamentRepository } from "./repository";

export class PrismaTournamentRepository implements TournamentRepository {
  async getLatestState(): Promise<TournamentState | null> {
    const state = await prisma.tournamentState.findFirst({
      orderBy: {
        createdAt: "desc",
      },
    });

    if (!state) {
      return null;
    }

    return {
      currentStage: state.currentStage as TournamentStage,
      completedMatches: state.completedMatches,
      remainingMatches: state.remainingMatches,
      champion: state.champion,
      lastCheckedAt: state.lastCheckedAt.toISOString(),
      checkerStatus: state.checkerStatus as CheckerStatus,
    };
  }

  async getMatches(): Promise<NormalizedMatch[]> {
    const matches = await prisma.match.findMany({
      orderBy: {
        kickoffAt: "asc",
      },
    });

    return matches.map((match) => ({
      externalId: match.externalId,
      stage: match.stage as TournamentStage,
      homeTeam: match.homeTeam,
      awayTeam: match.awayTeam,
      homeScore: match.homeScore,
      awayScore: match.awayScore,
      status: match.status as NormalizedMatch["status"],
      kickoffAt: match.kickoffAt.toISOString(),
      winner: match.winner,
      rawPayload: extractRawProviderMatch(match.rawPayload, match.externalId),
    }));
  }

  async getAgentRuns(): Promise<AgentRunRecord[]> {
    const runs = await prisma.agentRun.findMany({
      orderBy: {
        startedAt: "desc",
      },
    });

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
            rawPayload:
              input.rawPayload === undefined
                ? null
                : JSON.stringify(input.rawPayload),
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

function extractRawProviderMatch(rawPayload: string | null, externalId: string): unknown {
  if (!rawPayload) {
    return undefined;
  }

  try {
    const parsed = JSON.parse(rawPayload) as unknown;

    if (!isRecord(parsed)) {
      return undefined;
    }

    const rawProviderPayload = parsed.rawProviderPayload;
    const response =
      isRecord(rawProviderPayload) && isRecord(rawProviderPayload.response)
        ? rawProviderPayload.response
        : undefined;
    const rawGames = isRecord(response) && Array.isArray(response.games) ? response.games : [];
    const rawGame = rawGames.find(
      (game) =>
        isRecord(game) &&
        (String(game.id ?? "") === externalId || String(game._id ?? "") === externalId),
    );

    if (rawGame) {
      return rawGame;
    }

    const normalizedMatches = Array.isArray(parsed.matches) ? parsed.matches : [];
    return normalizedMatches.find(
      (rawMatch) => isRecord(rawMatch) && String(rawMatch.id ?? "") === externalId,
    );
  } catch {
    return undefined;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
