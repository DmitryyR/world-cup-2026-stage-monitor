import { checkerAgent } from "./checker-agent";
import { fetcherAgent } from "./fetcher-agent";
import { normalizerAgent } from "./normalizer-agent";
import { stageDetectorAgent } from "./stage-detector-agent";
import type {
  NormalizedMatch,
  ProviderDiagnostic,
  RawProviderPayload,
  TournamentState,
} from "@/domain/types";
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
    const providerWarningMessage = formatProviderWarnings(rawPayload.diagnostics ?? []);
    const matches = normalizerAgent(rawPayload);
    const detectedChanges = collectDetectedChanges(previousMatches, matches);
    changesDetected = detectedChanges.length;
    const changesMessage = formatDetectedChanges(detectedChanges, previousMatches.length);
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
      errorMessage: combineRunMessages(changesMessage, providerWarningMessage),
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

type DetectedChange = {
  matchLabel: string;
  details: string[];
};

function combineRunMessages(
  changesMessage: string | null,
  providerWarningMessage: string | null,
): string | null {
  return [changesMessage, providerWarningMessage].filter(Boolean).join(" | ") || null;
}

function formatDetectedChanges(
  changes: DetectedChange[],
  previousMatchCount: number,
): string | null {
  if (changes.length === 0) {
    return null;
  }

  if (previousMatchCount === 0) {
    return `Initial snapshot accepted: ${changes.length} matches.`;
  }

  const visibleChanges = changes.slice(0, 3);
  const suffix = changes.length > visibleChanges.length
    ? ` (+${changes.length - visibleChanges.length} more)`
    : "";
  const summary = visibleChanges
    .map((change) => `${change.matchLabel}: ${change.details.join(", ")}`)
    .join("; ");

  return `Changes: ${summary}${suffix}`;
}

function formatProviderWarnings(diagnostics: ProviderDiagnostic[]): string | null {
  const warnings = diagnostics.filter((diagnostic) => diagnostic.severity === "warning");

  if (warnings.length === 0) {
    return null;
  }

  const firstWarning = warnings[0];
  const suffix = warnings.length > 1 ? ` (+${warnings.length - 1} more)` : "";

  return firstWarning
    ? `Provider warning: ${firstWarning.message}${suffix}`
    : "Provider warning";
}

function collectDetectedChanges(
  previousMatches: NormalizedMatch[],
  nextMatches: NormalizedMatch[],
): DetectedChange[] {
  const previousById = new Map(
    previousMatches.map((match) => [match.externalId, match]),
  );
  const nextById = new Map(
    nextMatches.map((match) => [match.externalId, match]),
  );

  const changedOrAdded = nextMatches.flatMap((nextMatch) => {
    const previousMatch = previousById.get(nextMatch.externalId);

    if (!previousMatch) {
      return [
        {
          matchLabel: formatMatchLabel(nextMatch),
          details: ["new match"],
        },
      ];
    }

    const details = describeMatchChanges(previousMatch, nextMatch);
    return details.length > 0
      ? [
          {
            matchLabel: formatMatchLabel(nextMatch),
            details,
          },
        ]
      : [];
  });

  const removed = previousMatches.flatMap((previousMatch) =>
    nextById.has(previousMatch.externalId)
      ? []
      : [
          {
            matchLabel: formatMatchLabel(previousMatch),
            details: ["removed from provider payload"],
          },
        ],
  );

  return [...changedOrAdded, ...removed];
}

function describeMatchChanges(
  previousMatch: NormalizedMatch,
  nextMatch: NormalizedMatch,
): string[] {
  const details: string[] = [];

  if (previousMatch.status !== nextMatch.status) {
    details.push(`status ${previousMatch.status} -> ${nextMatch.status}`);
  }

  if (
    previousMatch.homeScore !== nextMatch.homeScore ||
    previousMatch.awayScore !== nextMatch.awayScore
  ) {
    details.push(
      `score ${formatScore(previousMatch)} -> ${formatScore(nextMatch)}`,
    );
  }

  if (previousMatch.winner !== nextMatch.winner) {
    details.push(
      `winner ${previousMatch.winner ?? "-"} -> ${nextMatch.winner ?? "-"}`,
    );
  }

  if (previousMatch.kickoffAt !== nextMatch.kickoffAt) {
    details.push("kickoff time updated");
  }

  if (previousMatch.stage !== nextMatch.stage) {
    details.push(`stage ${previousMatch.stage} -> ${nextMatch.stage}`);
  }

  if (
    previousMatch.homeTeam !== nextMatch.homeTeam ||
    previousMatch.awayTeam !== nextMatch.awayTeam
  ) {
    details.push(
      `teams ${formatMatchLabel(previousMatch)} -> ${formatMatchLabel(nextMatch)}`,
    );
  }

  return details;
}

function formatMatchLabel(match: NormalizedMatch): string {
  return `${match.homeTeam} vs ${match.awayTeam}`;
}

function formatScore(match: NormalizedMatch): string {
  return match.homeScore === null || match.awayScore === null
    ? "-"
    : `${match.homeScore}-${match.awayScore}`;
}

export async function runMonitorWithPayload(
  payload: RawProviderPayload,
  repository: TournamentRepository,
): Promise<MonitorLoopResult> {
  return runMonitorLoop({
    provider: {
      name: payload.source,
      source: payload.source,
      async fetchTournamentData() {
        return payload;
      },
    },
    repository,
  });
}
