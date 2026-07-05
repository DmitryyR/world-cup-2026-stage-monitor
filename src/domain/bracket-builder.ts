import type { MatchStatus, NormalizedMatch, TournamentStage } from "./types";

export type WinMethod =
  | "regular_time"
  | "extra_time"
  | "penalties"
  | "walkover"
  | "inferred_from_next_round"
  | "unknown";

export type BracketDependencyKind = "winner" | "loser";

export type BracketParticipant = {
  original: string;
  label: string;
  dependency?: {
    kind: BracketDependencyKind;
    matchId: string;
    sourceLabel: string;
    resolvedTeam: string | null;
  };
};

export type BracketMatch = {
  externalId: string;
  stage: TournamentStage;
  slotIndex: number;
  kickoffAt: string;
  status: MatchStatus;
  homeTeam: string;
  awayTeam: string;
  homeParticipant: BracketParticipant;
  awayParticipant: BracketParticipant;
  homeScore: number | null;
  awayScore: number | null;
  winner: string | null;
  winMethod: WinMethod;
  needsReview: boolean;
  reviewReason: string | null;
  sourceDiagnostics: string[];
};

export type BracketRound = {
  stage: TournamentStage;
  matches: BracketMatch[];
};

export type BracketValidation = {
  unresolvedWinners: number;
  needsReviewMatches: number;
  placeholderDependencies: number;
  staleLiveMatches: number;
  affectedMatches: Array<{
    externalId: string;
    reason: string;
  }>;
};

export type BracketModel = {
  rounds: BracketRound[];
  validation: BracketValidation;
};

export const knockoutStages: TournamentStage[] = [
  "round_of_32",
  "round_of_16",
  "quarter_final",
  "semi_final",
  "third_place",
  "final",
];

const knockoutStageSet = new Set<TournamentStage>(knockoutStages);

const stageLabels: Record<TournamentStage, string> = {
  group_stage: "Group Stage",
  round_of_32: "Round of 32",
  round_of_16: "Round of 16",
  quarter_final: "Quarter-final",
  semi_final: "Semi-final",
  third_place: "Third Place",
  final: "Final",
  completed: "Completed",
};

export function buildBracketModel(matches: NormalizedMatch[]): BracketModel {
  const knockoutMatches = matches.filter((match) => isKnockoutStage(match.stage));
  const orderedRawMatchesByStage = new Map<TournamentStage, NormalizedMatch[]>();
  const bracketMatchesById = new Map<string, BracketMatch>();

  for (const stage of knockoutStages) {
    orderedRawMatchesByStage.set(stage, orderMatchesForStage(stage, knockoutMatches));
  }

  const slotIndexById = buildSlotIndexMap(orderedRawMatchesByStage);

  for (const stage of knockoutStages) {
    for (const match of orderedRawMatchesByStage.get(stage) ?? []) {
      bracketMatchesById.set(
        match.externalId,
        createBracketMatch(match, knockoutMatches, slotIndexById),
      );
    }
  }

  const rounds = knockoutStages.map((stage) => ({
    stage,
    matches: (orderedRawMatchesByStage.get(stage) ?? []).map((match) => {
      const bracketMatch = bracketMatchesById.get(match.externalId);

      if (!bracketMatch) {
        throw new Error(`Bracket builder failed to create match ${match.externalId}`);
      }

      return bracketMatch;
    }),
  }));

  return {
    rounds,
    validation: validateBracket(rounds),
  };
}

export function isKnockoutStage(stage: TournamentStage): boolean {
  return knockoutStageSet.has(stage);
}

export function resolveKnockoutOutcome(
  match: NormalizedMatch,
  allMatches: NormalizedMatch[] = [match],
): {
  winner: string | null;
  winMethod: WinMethod;
  needsReview: boolean;
  reviewReason: string | null;
  sourceDiagnostics: string[];
} {
  if (!isKnockoutStage(match.stage) || match.status !== "finished") {
    return {
      winner: match.winner,
      winMethod: "unknown",
      needsReview: false,
      reviewReason: null,
      sourceDiagnostics: [],
    };
  }

  const sourceDiagnostics: string[] = [];
  const rawMatch = getRawProviderMatch(match);

  if (
    match.homeScore !== null &&
    match.awayScore !== null &&
    match.homeScore !== match.awayScore
  ) {
    const winner = match.homeScore > match.awayScore ? match.homeTeam : match.awayTeam;

    return {
      winner,
      winMethod: "regular_time",
      needsReview: false,
      reviewReason: null,
      sourceDiagnostics,
    };
  }

  const penaltyWinner = resolvePenaltyWinner(match, rawMatch);
  if (penaltyWinner) {
    sourceDiagnostics.push("winner resolved from penalty shootout fields");

    return {
      winner: penaltyWinner,
      winMethod: "penalties",
      needsReview: false,
      reviewReason: null,
      sourceDiagnostics,
    };
  }

  const methodFromText = resolveMethodFromText(match, rawMatch);
  if (methodFromText) {
    sourceDiagnostics.push(`winner resolved from provider text: ${methodFromText.method}`);

    return {
      winner: methodFromText.winner,
      winMethod: methodFromText.method,
      needsReview: false,
      reviewReason: null,
      sourceDiagnostics,
    };
  }

  const explicitWinner = resolveExplicitWinner(match, rawMatch);
  if (explicitWinner) {
    sourceDiagnostics.push("winner resolved from explicit provider winner field");

    return {
      winner: explicitWinner,
      winMethod: "unknown",
      needsReview: false,
      reviewReason: null,
      sourceDiagnostics,
    };
  }

  const inferredWinner = inferWinnerFromNextRound(match, allMatches);
  if (inferredWinner) {
    sourceDiagnostics.push("winner inferred from dependent next-round match");

    return {
      winner: inferredWinner,
      winMethod: "inferred_from_next_round",
      needsReview: false,
      reviewReason: null,
      sourceDiagnostics,
    };
  }

  return {
    winner: null,
    winMethod: "unknown",
    needsReview: true,
    reviewReason: "Finished tied knockout match has no resolvable winner",
    sourceDiagnostics,
  };
}

export function formatWinMethodLabel(match: BracketMatch): string | null {
  if (match.needsReview) {
    return match.reviewReason;
  }

  if (match.status !== "finished" || !match.winner) {
    return null;
  }

  if (match.winMethod === "penalties") {
    return `${match.winner} won on penalties`;
  }

  if (match.winMethod === "extra_time") {
    return `${match.winner} won after extra time`;
  }

  if (match.winMethod === "inferred_from_next_round") {
    return `${match.winner} advanced`;
  }

  if (match.winMethod === "walkover") {
    return `${match.winner} advanced by walkover`;
  }

  if (match.winMethod === "unknown") {
    return `${match.winner} advanced`;
  }

  return `${match.winner} won in regular time`;
}

function createBracketMatch(
  match: NormalizedMatch,
  allMatches: NormalizedMatch[],
  slotIndexById: Map<string, number>,
): BracketMatch {
  const outcome = resolveKnockoutOutcome(match, allMatches);
  const homeParticipant = resolveParticipant(match.homeTeam, match, allMatches, slotIndexById);
  const awayParticipant = resolveParticipant(match.awayTeam, match, allMatches, slotIndexById);

  return {
    externalId: match.externalId,
    stage: match.stage,
    slotIndex: slotIndexById.get(match.externalId) ?? 1,
    kickoffAt: match.kickoffAt,
    status: match.status,
    homeTeam: match.homeTeam,
    awayTeam: match.awayTeam,
    homeParticipant,
    awayParticipant,
    homeScore: match.homeScore,
    awayScore: match.awayScore,
    winner: outcome.winner,
    winMethod: outcome.winMethod,
    needsReview: outcome.needsReview,
    reviewReason: outcome.reviewReason,
    sourceDiagnostics: outcome.sourceDiagnostics,
  };
}

function orderMatchesForStage(
  stage: TournamentStage,
  matches: NormalizedMatch[],
): NormalizedMatch[] {
  const stageMatches = matches
    .filter((match) => match.stage === stage)
    .sort(compareByMatchNumberThenKickoff);

  const nextStage = getNextStage(stage);
  if (!nextStage) {
    return stageMatches;
  }

  const orderedIds = new Set<string>();
  const orderedMatches: NormalizedMatch[] = [];
  const nextMatches = matches.filter((match) => match.stage === nextStage).sort(compareByMatchNumberThenKickoff);

  for (const nextMatch of nextMatches) {
    for (const side of ["homeTeam", "awayTeam"] as const) {
      const dependency = getSideDependency(nextMatch, side);
      if (!dependency || dependency.kind !== "winner") {
        continue;
      }

      const sourceMatch = stageMatches.find((match) => sameMatchId(match.externalId, dependency.matchId));
      if (sourceMatch && !orderedIds.has(sourceMatch.externalId)) {
        orderedMatches.push(sourceMatch);
        orderedIds.add(sourceMatch.externalId);
      }
    }
  }

  for (const match of stageMatches) {
    if (!orderedIds.has(match.externalId)) {
      orderedMatches.push(match);
    }
  }

  return orderedMatches;
}

function buildSlotIndexMap(
  orderedRawMatchesByStage: Map<TournamentStage, NormalizedMatch[]>,
): Map<string, number> {
  const slotIndexById = new Map<string, number>();

  for (const stage of knockoutStages) {
    const matches = orderedRawMatchesByStage.get(stage) ?? [];
    matches.forEach((match, index) => {
      slotIndexById.set(match.externalId, index + 1);
    });
  }

  return slotIndexById;
}

function resolveParticipant(
  value: string,
  match: NormalizedMatch,
  allMatches: NormalizedMatch[],
  slotIndexById: Map<string, number>,
): BracketParticipant {
  const dependency = parseDependency(value);

  if (!dependency) {
    return {
      original: value,
      label: value,
    };
  }

  const sourceMatch = findMatchById(allMatches, dependency.matchId);

  if (!sourceMatch) {
    return {
      original: value,
      label: `${capitalize(dependency.kind)} of Match ${dependency.matchId}`,
      dependency: {
        kind: dependency.kind,
        matchId: dependency.matchId,
        sourceLabel: `Match ${dependency.matchId}`,
        resolvedTeam: null,
      },
    };
  }

  const sourceOutcome = resolveKnockoutOutcome(sourceMatch, allMatches);
  const resolvedTeam =
    dependency.kind === "winner"
      ? sourceOutcome.winner
      : sourceOutcome.winner
        ? getLoser(sourceMatch, sourceOutcome.winner)
        : null;

  if (resolvedTeam) {
    return {
      original: value,
      label: resolvedTeam,
      dependency: {
        kind: dependency.kind,
        matchId: dependency.matchId,
        sourceLabel: describeSourceMatch(sourceMatch, allMatches, slotIndexById),
        resolvedTeam,
      },
    };
  }

  const sourceLabel = describeSourceMatch(sourceMatch, allMatches, slotIndexById);

  return {
    original: value,
    label: `${capitalize(dependency.kind)} of ${sourceLabel}`,
    dependency: {
      kind: dependency.kind,
      matchId: dependency.matchId,
      sourceLabel,
      resolvedTeam: null,
    },
  };
}

function describeSourceMatch(
  sourceMatch: NormalizedMatch,
  allMatches: NormalizedMatch[],
  slotIndexById: Map<string, number>,
): string {
  const homeDependency = parseDependency(sourceMatch.homeTeam);
  const awayDependency = parseDependency(sourceMatch.awayTeam);

  if (!homeDependency && !awayDependency) {
    return `${sourceMatch.homeTeam} / ${sourceMatch.awayTeam}`;
  }

  const slotIndex = slotIndexById.get(sourceMatch.externalId) ?? 1;
  const label = stageLabels[sourceMatch.stage] ?? "Match";

  if (sourceMatch.stage === "quarter_final") {
    return `Quarter-final ${slotIndex}`;
  }

  if (sourceMatch.stage === "semi_final") {
    return `Semi-final ${slotIndex}`;
  }

  if (sourceMatch.stage === "third_place") {
    return `Third Place`;
  }

  if (sourceMatch.stage === "final") {
    return `Final`;
  }

  const homeLabel = homeDependency
    ? resolveParticipant(sourceMatch.homeTeam, sourceMatch, allMatches, slotIndexById).label
    : sourceMatch.homeTeam;
  const awayLabel = awayDependency
    ? resolveParticipant(sourceMatch.awayTeam, sourceMatch, allMatches, slotIndexById).label
    : sourceMatch.awayTeam;

  if (!isTechnicalParticipant(homeLabel) && !isTechnicalParticipant(awayLabel)) {
    return `${homeLabel} / ${awayLabel}`;
  }

  return `${label} ${slotIndex}`;
}

function resolvePenaltyWinner(
  match: NormalizedMatch,
  rawMatch: Record<string, unknown> | null,
): string | null {
  const homePenaltyScore = parseOptionalNumber(rawMatch?.home_penalty_score);
  const awayPenaltyScore = parseOptionalNumber(rawMatch?.away_penalty_score);

  if (homePenaltyScore === null || awayPenaltyScore === null || homePenaltyScore === awayPenaltyScore) {
    return null;
  }

  return homePenaltyScore > awayPenaltyScore ? match.homeTeam : match.awayTeam;
}

function resolveMethodFromText(
  match: NormalizedMatch,
  rawMatch: Record<string, unknown> | null,
): { winner: string; method: "extra_time" | "penalties" } | null {
  const text = collectText(rawMatch).join(" ").toLowerCase();

  if (!text) {
    return null;
  }

  const winnerFromText = resolveWinnerFromText(match, text) ?? resolveExplicitWinner(match, rawMatch);
  if (!winnerFromText) {
    return null;
  }

  if (/\bpenalt/.test(text)) {
    return {
      winner: winnerFromText,
      method: "penalties",
    };
  }

  if (/after extra time|extra[- ]time|\baet\b|a\.e\.t/.test(text)) {
    return {
      winner: winnerFromText,
      method: "extra_time",
    };
  }

  return null;
}

function resolveExplicitWinner(
  match: NormalizedMatch,
  rawMatch: Record<string, unknown> | null,
): string | null {
  if (match.winner) {
    return match.winner;
  }

  const candidateKeys = [
    "winner",
    "winner_team",
    "winner_team_name",
    "winner_team_name_en",
    "winning_team",
    "winning_team_name",
    "qualified_team",
    "qualified_team_name",
    "qualified_team_name_en",
  ];

  for (const key of candidateKeys) {
    const candidate = stringify(rawMatch?.[key]).trim();
    const winner = normalizeWinnerCandidate(match, candidate);

    if (winner) {
      return winner;
    }
  }

  return null;
}

function inferWinnerFromNextRound(
  match: NormalizedMatch,
  allMatches: NormalizedMatch[],
): string | null {
  for (const nextMatch of allMatches) {
    for (const side of ["homeTeam", "awayTeam"] as const) {
      const dependency = getSideDependency(nextMatch, side);

      if (!dependency || dependency.kind !== "winner" || !sameMatchId(match.externalId, dependency.matchId)) {
        continue;
      }

      const candidate = nextMatch[side];
      if (sameTeam(candidate, match.homeTeam)) {
        return match.homeTeam;
      }

      if (sameTeam(candidate, match.awayTeam)) {
        return match.awayTeam;
      }
    }
  }

  return null;
}

function getSideDependency(
  match: NormalizedMatch,
  side: "homeTeam" | "awayTeam",
): { kind: BracketDependencyKind; matchId: string } | null {
  const directDependency = parseDependency(match[side]);
  if (directDependency) {
    return directDependency;
  }

  const rawMatch = getRawProviderMatch(match);
  const rawLabelKey = side === "homeTeam" ? "home_team_label" : "away_team_label";
  const rawLabel = stringify(rawMatch?.[rawLabelKey]);

  return parseDependency(rawLabel);
}

function validateBracket(rounds: BracketRound[]): BracketValidation {
  const matches = rounds.flatMap((round) => round.matches);
  const affectedMatches = matches
    .filter((match) => match.needsReview)
    .map((match) => ({
      externalId: match.externalId,
      reason: match.reviewReason ?? "Needs review",
    }));

  return {
    unresolvedWinners: affectedMatches.length,
    needsReviewMatches: affectedMatches.length,
    placeholderDependencies: matches.reduce(
      (count, match) =>
        count +
        (match.homeParticipant.dependency && !match.homeParticipant.dependency.resolvedTeam ? 1 : 0) +
        (match.awayParticipant.dependency && !match.awayParticipant.dependency.resolvedTeam ? 1 : 0),
      0,
    ),
    staleLiveMatches: matches.filter(isStaleLiveMatch).length,
    affectedMatches,
  };
}

function isStaleLiveMatch(match: BracketMatch): boolean {
  if (match.status !== "live") {
    return false;
  }

  const kickoffAt = new Date(match.kickoffAt).getTime();
  if (!Number.isFinite(kickoffAt)) {
    return false;
  }

  const fourHoursMs = 4 * 60 * 60 * 1000;
  return Date.now() - kickoffAt > fourHoursMs;
}

function getNextStage(stage: TournamentStage): TournamentStage | null {
  if (stage === "round_of_32") {
    return "round_of_16";
  }

  if (stage === "round_of_16") {
    return "quarter_final";
  }

  if (stage === "quarter_final") {
    return "semi_final";
  }

  if (stage === "semi_final") {
    return "final";
  }

  return null;
}

function parseDependency(value: string): { kind: BracketDependencyKind; matchId: string } | null {
  const match = value.match(/^(winner|loser)\s+(?:of\s+)?match\s+(\d+)$/i);

  if (!match) {
    return null;
  }

  return {
    kind: match[1].toLowerCase() as BracketDependencyKind,
    matchId: match[2],
  };
}

function getRawProviderMatch(match: NormalizedMatch): Record<string, unknown> | null {
  if (!isRecord(match.rawPayload)) {
    return null;
  }

  const rawProviderPayload = match.rawPayload.rawProviderPayload;
  const response =
    isRecord(rawProviderPayload) && isRecord(rawProviderPayload.response)
      ? rawProviderPayload.response
      : undefined;
  const games = isRecord(response) && Array.isArray(response.games) ? response.games : [];
  const rawGame = games.find(
    (game) =>
      isRecord(game) &&
      (String(game.id ?? "") === match.externalId ||
        String(game._id ?? "") === match.externalId),
  );

  return isRecord(rawGame) ? rawGame : match.rawPayload;
}

function findMatchById(matches: NormalizedMatch[], matchId: string): NormalizedMatch | null {
  return matches.find((match) => sameMatchId(match.externalId, matchId)) ?? null;
}

function sameMatchId(left: string, right: string): boolean {
  return left === right || extractDigits(left) === extractDigits(right);
}

function extractDigits(value: string): string {
  return value.match(/\d+/g)?.join("") ?? value;
}

function compareByMatchNumberThenKickoff(
  first: NormalizedMatch,
  second: NormalizedMatch,
): number {
  const firstNumber = Number(extractDigits(first.externalId));
  const secondNumber = Number(extractDigits(second.externalId));

  if (Number.isFinite(firstNumber) && Number.isFinite(secondNumber) && firstNumber !== secondNumber) {
    return firstNumber - secondNumber;
  }

  return first.kickoffAt.localeCompare(second.kickoffAt);
}

function parseOptionalNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === "" || value === "null") {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function collectText(value: unknown): string[] {
  if (!isRecord(value)) {
    return [];
  }

  return Object.entries(value)
    .filter(([key]) => /winner|qualified|note|result|description|status|method|scorer|penalty|extra|time/i.test(key))
    .flatMap(([, entry]) => {
      if (typeof entry === "string") {
        return [entry];
      }

      if (Array.isArray(entry)) {
        return entry.filter((item): item is string => typeof item === "string");
      }

      return [];
    });
}

function resolveWinnerFromText(match: NormalizedMatch, text: string): string | null {
  if (text.includes(match.homeTeam.toLowerCase())) {
    return match.homeTeam;
  }

  if (text.includes(match.awayTeam.toLowerCase())) {
    return match.awayTeam;
  }

  return null;
}

function normalizeWinnerCandidate(match: NormalizedMatch, candidate: string): string | null {
  if (!candidate) {
    return null;
  }

  if (sameTeam(candidate, match.homeTeam)) {
    return match.homeTeam;
  }

  if (sameTeam(candidate, match.awayTeam)) {
    return match.awayTeam;
  }

  return null;
}

function getLoser(match: NormalizedMatch, winner: string): string | null {
  if (sameTeam(winner, match.homeTeam)) {
    return match.awayTeam;
  }

  if (sameTeam(winner, match.awayTeam)) {
    return match.homeTeam;
  }

  return null;
}

function sameTeam(left: string, right: string): boolean {
  return left.trim().toLowerCase() === right.trim().toLowerCase();
}

function isTechnicalParticipant(value: string): boolean {
  return /^(winner|loser)\s+(?:of\s+)?match\s+\d+$/i.test(value) || /^tbd/i.test(value);
}

function capitalize(value: string): string {
  return `${value.slice(0, 1).toUpperCase()}${value.slice(1)}`;
}

function stringify(value: unknown): string {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
