import type { BracketMatch, BracketModel } from "./bracket-builder";
import type { TournamentStage } from "./types";

export type BracketLayoutSide = "left" | "right" | "center";

export type BracketLayoutRound =
  | "round_of_32"
  | "round_of_16"
  | "quarter_final"
  | "semi_final"
  | "final"
  | "third_place";

export type BracketLayoutSlot = {
  id: string;
  side: BracketLayoutSide;
  round: BracketLayoutRound;
  slotIndex: number;
  sourceMatchIds: string[];
  targetSlotId: string | null;
  gridColumn: number;
  gridRow: number;
  gridRowSpan: number;
  match: BracketMatch | null;
  connectorTarget: string | null;
  x: number;
  y: number;
  width: number;
  height: number;
};

export type BracketLayoutConnector = {
  id: string;
  kind: "winner" | "loser";
  fromSlotId: string;
  toSlotId: string;
  path: string;
};

export type BracketLayout = {
  slots: BracketLayoutSlot[];
  connectors: BracketLayoutConnector[];
  width: number;
  height: number;
  columnWidths: number[];
  columnGap: number;
  rowHeight: number;
  rows: number;
};

export type BracketLayoutControls = {
  left: number;
  final: number;
  right: number;
};

export const bracketLayoutControls: BracketLayoutControls = {
  left: 0,
  final: 840,
  right: 1500,
};

const columnWidths = [260, 230, 210, 190, 300, 190, 210, 230, 260];
const columnGap = 24;
const rowHeight = 36;
const rows = 34;
const matchRowSpan = 4;

const stageColumns: Record<
  Exclude<BracketLayoutRound, "final" | "third_place">,
  Record<Exclude<BracketLayoutSide, "center">, number>
> = {
  round_of_32: { left: 1, right: 9 },
  round_of_16: { left: 2, right: 8 },
  quarter_final: { left: 3, right: 7 },
  semi_final: { left: 4, right: 6 },
};

const stageCounts: Record<Exclude<BracketLayoutRound, "final" | "third_place">, number> = {
  round_of_32: 8,
  round_of_16: 4,
  quarter_final: 2,
  semi_final: 1,
};

const stageRows: Record<Exclude<BracketLayoutRound, "final" | "third_place">, number[]> = {
  round_of_32: [1, 5, 9, 13, 17, 21, 25, 29],
  round_of_16: [3, 11, 19, 27],
  quarter_final: [7, 23],
  semi_final: [15],
};

export function buildBracketLayout(bracket: BracketModel): BracketLayout {
  const slots: BracketLayoutSlot[] = [];
  const roundsByStage = new Map<TournamentStage, BracketMatch[]>(
    bracket.rounds.map((round) => [round.stage, round.matches]),
  );

  for (const round of ["round_of_32", "round_of_16", "quarter_final", "semi_final"] as const) {
    const matches = roundsByStage.get(round) ?? [];
    const leftMatches = matches.slice(0, stageCounts[round]);
    const rightMatches = matches.slice(stageCounts[round], stageCounts[round] * 2);

    for (const side of ["left", "right"] as const) {
      const sideMatches = side === "left" ? leftMatches : rightMatches;

      for (let index = 0; index < stageCounts[round]; index += 1) {
        slots.push(
          createSlot({
            side,
            round,
            slotIndex: index,
            gridColumn: stageColumns[round][side],
            gridRow: stageRows[round][index],
            match: sideMatches[index] ?? null,
          }),
        );
      }
    }
  }

  slots.push(
    createSlot({
      side: "center",
      round: "final",
      slotIndex: 0,
      gridColumn: 5,
      gridRow: 15,
      match: roundsByStage.get("final")?.[0] ?? null,
    }),
  );
  slots.push(
    createSlot({
      side: "center",
      round: "third_place",
      slotIndex: 0,
      gridColumn: 5,
      gridRow: 27,
      match: roundsByStage.get("third_place")?.[0] ?? null,
    }),
  );

  const slotById = new Map(slots.map((slot) => [slot.id, slot]));
  assignProgression(slots, slotById);
  const connectors = buildConnectors(slots, slotById);

  return {
    slots,
    connectors,
    width: getColumnLeft(columnWidths.length + 1) - columnGap,
    height: rows * rowHeight,
    columnWidths,
    columnGap,
    rowHeight,
    rows,
  };
}

function createSlot({
  side,
  round,
  slotIndex,
  gridColumn,
  gridRow,
  match,
}: {
  side: BracketLayoutSide;
  round: BracketLayoutRound;
  slotIndex: number;
  gridColumn: number;
  gridRow: number;
  match: BracketMatch | null;
}): BracketLayoutSlot {
  const width = columnWidths[gridColumn - 1];
  const height = matchRowSpan * rowHeight;
  const x = getColumnLeft(gridColumn);
  const y = (gridRow - 1) * rowHeight;

  return {
    id: `${side}-${round}-${slotIndex}`,
    side,
    round,
    slotIndex,
    sourceMatchIds: [],
    targetSlotId: null,
    gridColumn,
    gridRow,
    gridRowSpan: matchRowSpan,
    match,
    connectorTarget: null,
    x,
    y,
    width,
    height,
  };
}

function assignProgression(
  slots: BracketLayoutSlot[],
  slotById: Map<string, BracketLayoutSlot>,
): void {
  for (const side of ["left", "right"] as const) {
    assignSideRound(slots, slotById, side, "round_of_32", "round_of_16");
    assignSideRound(slots, slotById, side, "round_of_16", "quarter_final");
    assignSideRound(slots, slotById, side, "quarter_final", "semi_final");

    const semifinal = slotById.get(`${side}-semi_final-0`);
    if (semifinal) {
      semifinal.targetSlotId = "center-final-0";
      semifinal.connectorTarget = "center-final-0";
    }
  }

  const final = slotById.get("center-final-0");
  const thirdPlace = slotById.get("center-third_place-0");
  const leftSemifinal = slotById.get("left-semi_final-0");
  const rightSemifinal = slotById.get("right-semi_final-0");
  const semifinalSourceIds = [leftSemifinal, rightSemifinal]
    .map((slot) => slot?.match?.externalId)
    .filter((id): id is string => Boolean(id));

  if (final) {
    final.sourceMatchIds = semifinalSourceIds;
  }

  if (thirdPlace) {
    thirdPlace.sourceMatchIds = semifinalSourceIds;
  }
}

function assignSideRound(
  slots: BracketLayoutSlot[],
  slotById: Map<string, BracketLayoutSlot>,
  side: Exclude<BracketLayoutSide, "center">,
  sourceRound: Exclude<BracketLayoutRound, "final" | "third_place">,
  targetRound: Exclude<BracketLayoutRound, "final" | "third_place">,
): void {
  const sourceSlots = slots.filter((slot) => slot.side === side && slot.round === sourceRound);
  const targetSlots = slots.filter((slot) => slot.side === side && slot.round === targetRound);

  for (const sourceSlot of sourceSlots) {
    const targetSlot = targetSlots[Math.floor(sourceSlot.slotIndex / 2)];
    if (!targetSlot) {
      continue;
    }

    sourceSlot.targetSlotId = targetSlot.id;
    sourceSlot.connectorTarget = targetSlot.id;
    if (sourceSlot.match?.externalId) {
      targetSlot.sourceMatchIds.push(sourceSlot.match.externalId);
    }
  }

  for (const targetSlot of targetSlots) {
    const match = slotById.get(targetSlot.id)?.match;
    if (match?.externalId && targetSlot.sourceMatchIds.length === 0) {
      targetSlot.sourceMatchIds = [];
    }
  }
}

function buildConnectors(
  slots: BracketLayoutSlot[],
  slotById: Map<string, BracketLayoutSlot>,
): BracketLayoutConnector[] {
  const connectors: BracketLayoutConnector[] = [];

  for (const slot of slots) {
    if (!slot.targetSlotId) {
      continue;
    }

    const target = slotById.get(slot.targetSlotId);
    if (!target) {
      continue;
    }

    connectors.push({
      id: `${slot.id}-to-${target.id}`,
      kind: "winner",
      fromSlotId: slot.id,
      toSlotId: target.id,
      path: buildConnectorPath(slot, target),
    });
  }

  for (const side of ["left", "right"] as const) {
    const semifinal = slotById.get(`${side}-semi_final-0`);
    const thirdPlace = slotById.get("center-third_place-0");

    if (!semifinal || !thirdPlace) {
      continue;
    }

    connectors.push({
      id: `${semifinal.id}-to-${thirdPlace.id}`,
      kind: "loser",
      fromSlotId: semifinal.id,
      toSlotId: thirdPlace.id,
      path: buildConnectorPath(semifinal, thirdPlace, 28),
    });
  }

  return connectors;
}

function buildConnectorPath(
  from: BracketLayoutSlot,
  to: BracketLayoutSlot,
  verticalOffset = 0,
): string {
  const start = getConnectorPoint(from, "out");
  const end = getTargetConnectorPoint(from, to);
  const midX = Math.round((start.x + end.x) / 2);
  const endY = end.y + verticalOffset;

  return `M ${start.x} ${start.y} H ${midX} V ${endY} H ${end.x}`;
}

function getTargetConnectorPoint(
  from: BracketLayoutSlot,
  to: BracketLayoutSlot,
): { x: number; y: number } {
  const y = Math.round(to.y + to.height / 2);

  if (to.side !== "center") {
    return getConnectorPoint(to, "in");
  }

  return {
    x: from.side === "right" ? to.x + to.width : to.x,
    y,
  };
}

function getConnectorPoint(
  slot: BracketLayoutSlot,
  direction: "in" | "out",
): { x: number; y: number } {
  const y = Math.round(slot.y + slot.height / 2);

  if (slot.side === "left") {
    return {
      x: direction === "out" ? slot.x + slot.width : slot.x,
      y,
    };
  }

  if (slot.side === "right") {
    return {
      x: direction === "out" ? slot.x : slot.x + slot.width,
      y,
    };
  }

  return {
    x: direction === "out" ? slot.x + slot.width / 2 : slot.x + slot.width / 2,
    y,
  };
}

function getColumnLeft(gridColumn: number): number {
  return columnWidths
    .slice(0, gridColumn - 1)
    .reduce((left, width) => left + width + columnGap, 0);
}
