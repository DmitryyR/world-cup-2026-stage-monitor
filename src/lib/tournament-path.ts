import type { NormalizedMatch, TournamentStage, TournamentState } from "@/domain/types";

export type TournamentPathStageId =
  | "group_stage"
  | "round_of_32"
  | "round_of_16"
  | "quarter_final"
  | "semi_final"
  | "final"
  | "champion";

export type TournamentPathStatus = "completed" | "current" | "future";

export type TournamentPathStage = {
  id: TournamentPathStageId;
  label: string;
  slotCount: number;
  teams: string[];
  placeholderCount: number;
  status: TournamentPathStatus;
};

export const tournamentPathStages: Array<{
  id: TournamentPathStageId;
  label: string;
  slotCount: number;
}> = [
  { id: "group_stage", label: "Groups", slotCount: 48 },
  { id: "round_of_32", label: "Round of 32", slotCount: 32 },
  { id: "round_of_16", label: "Round of 16", slotCount: 16 },
  { id: "quarter_final", label: "Quarter-finals", slotCount: 8 },
  { id: "semi_final", label: "Semi-finals", slotCount: 4 },
  { id: "final", label: "Final", slotCount: 2 },
  { id: "champion", label: "Champion", slotCount: 1 },
];

const pathStageOrder: TournamentPathStageId[] = tournamentPathStages.map(
  (stage) => stage.id,
);

const matchStages = new Set<TournamentStage>([
  "group_stage",
  "round_of_32",
  "round_of_16",
  "quarter_final",
  "semi_final",
  "final",
]);

export function buildTournamentPath(
  matches: NormalizedMatch[],
  state: TournamentState | null,
): TournamentPathStage[] {
  return tournamentPathStages.map((stage) => {
    const teams =
      stage.id === "champion"
        ? getChampionTeams(state)
        : collectUniqueTeamsForStage(matches, stage.id);

    return {
      ...stage,
      teams,
      placeholderCount: getPlaceholderCount(stage.slotCount, teams.length),
      status: getTournamentPathStatus(stage.id, state?.currentStage ?? null),
    };
  });
}

export function collectUniqueTeamsForStage(
  matches: NormalizedMatch[],
  stage: TournamentPathStageId,
): string[] {
  if (!matchStages.has(stage as TournamentStage)) {
    return [];
  }

  const teams = new Map<string, string>();

  for (const match of matches) {
    if (match.stage !== stage) {
      continue;
    }

    addKnownTeam(teams, match.homeTeam);
    addKnownTeam(teams, match.awayTeam);
  }

  return [...teams.values()];
}

export function getPlaceholderCount(slotCount: number, knownTeamCount: number): number {
  return Math.max(slotCount - knownTeamCount, 0);
}

export function getTournamentPathStatus(
  stage: TournamentPathStageId,
  currentStage: TournamentStage | null,
): TournamentPathStatus {
  if (currentStage === "completed") {
    return "completed";
  }

  const currentPathStage: TournamentPathStageId | null =
    currentStage === "third_place"
      ? "final"
      : currentStage;

  if (!currentPathStage) {
    return stage === "group_stage" ? "current" : "future";
  }

  const stageIndex = pathStageOrder.indexOf(stage);
  const currentIndex = pathStageOrder.indexOf(currentPathStage);

  if (stageIndex < currentIndex) {
    return "completed";
  }

  if (stageIndex === currentIndex) {
    return "current";
  }

  return "future";
}

function getChampionTeams(state: TournamentState | null): string[] {
  return state?.champion ? [state.champion] : [];
}

function addKnownTeam(teams: Map<string, string>, teamName: string): void {
  if (!isKnownTeamName(teamName)) {
    return;
  }

  const normalizedName = teamName.trim().toLowerCase();

  if (!teams.has(normalizedName)) {
    teams.set(normalizedName, teamName.trim());
  }
}

function isKnownTeamName(teamName: string): boolean {
  const normalizedName = teamName.trim().toLowerCase();

  if (!normalizedName) {
    return false;
  }

  return ![
    /^winner match \d+$/,
    /^loser match \d+$/,
    /^winner of /,
    /^loser of /,
    /^tbd$/,
    /^to be determined$/,
  ].some((pattern) => pattern.test(normalizedName));
}
