"use client";

import { useEffect, useRef, useState } from "react";
import { Trophy } from "lucide-react";
import {
  buildBracketModel,
  formatWinMethodLabel,
  type BracketMatch,
} from "@/domain/bracket-builder";
import {
  bracketLayoutControls,
  buildBracketLayout,
  type BracketLayout,
  type BracketLayoutRound,
  type BracketLayoutSlot,
} from "@/domain/bracket-layout";
import type { NormalizedMatch } from "@/domain/types";
import { formatKyivDateTime } from "@/lib/date-format";
import { formatScore, formatStage } from "@/lib/format";
import { StatusBadge } from "./StatusBadge";
import { TeamName } from "./TeamName";

type BracketBoardProps = {
  matches: NormalizedMatch[];
};

type ScaleMode = "fit" | "100" | "75" | "50";

const boardPadding = 20;
const headerOffset = 48;

const columnLabels: Array<{ column: number; label: string; align: "left" | "center" | "right" }> = [
  { column: 1, label: "Round of 32", align: "left" },
  { column: 2, label: "Round of 16", align: "left" },
  { column: 3, label: "Quarter-finals", align: "left" },
  { column: 4, label: "Semi-finals", align: "left" },
  { column: 5, label: "Final", align: "center" },
  { column: 6, label: "Semi-finals", align: "right" },
  { column: 7, label: "Quarter-finals", align: "right" },
  { column: 8, label: "Round of 16", align: "right" },
  { column: 9, label: "Round of 32", align: "right" },
];

export function BracketBoard({ matches }: BracketBoardProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [scaleMode, setScaleMode] = useState<ScaleMode>("75");
  const [fitScale, setFitScale] = useState(0.75);
  const bracket = buildBracketModel(matches);
  const layout = buildBracketLayout(bracket);
  const finalSlot = layout.slots.find((slot) => slot.round === "final") ?? null;
  const champion = finalSlot?.match?.winner ?? null;
  const rawCanvasWidth = layout.width + boardPadding * 2;
  const rawCanvasHeight = layout.height + headerOffset + boardPadding * 2;
  const scale = getScaleValue(scaleMode, fitScale);
  const scaledCanvasWidth = rawCanvasWidth * scale;
  const scaledCanvasHeight = rawCanvasHeight * scale;

  useEffect(() => {
    const element = scrollRef.current;

    if (!element) {
      return;
    }

    const scrollElement = element;

    function updateFitScale() {
      const availableWidth = scrollElement.clientWidth - 24;
      const nextScale = Math.min(1, Math.max(0.5, availableWidth / rawCanvasWidth));

      setFitScale(roundScale(nextScale));
    }

    updateFitScale();
    const observer = new ResizeObserver(updateFitScale);
    observer.observe(scrollElement);

    return () => observer.disconnect();
  }, [rawCanvasWidth]);

  function scrollTo(position: number) {
    scrollRef.current?.scrollTo({
      left: position * scale,
      behavior: "smooth",
    });
  }

  return (
    <section className="w-full min-w-0 overflow-hidden rounded-lg border border-white/10 bg-slate-950/70 shadow-2xl shadow-black/30">
      <div className="border-b border-white/10 px-4 py-3 sm:px-5 sm:py-4">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <div className="text-xs font-black uppercase tracking-normal text-blue-300">
              Knockout Tree
            </div>
            <h1 className="mt-1 text-lg font-black uppercase text-slate-50">
              Tournament Bracket
            </h1>
            <p className="mt-1 text-xs text-slate-500">
              Scroll horizontally to view the full bracket.
            </p>
          </div>
          <div className="flex flex-wrap gap-2" aria-label="Bracket scale controls">
            {(["fit", "100", "75", "50"] as const).map((mode) => (
              <ScaleButton
                key={mode}
                active={scaleMode === mode}
                label={mode === "fit" ? "Fit" : `${mode}%`}
                onClick={() => setScaleMode(mode)}
              />
            ))}
          </div>
          <div className="flex flex-wrap gap-2" aria-label="Bracket scroll controls">
            <ScrollButton label="Full bracket" onClick={() => scrollTo(0)} />
            <ScrollButton label="Left half" onClick={() => scrollTo(bracketLayoutControls.left)} />
            <ScrollButton label="Final" onClick={() => scrollTo(bracketLayoutControls.final)} />
            <ScrollButton label="Right half" onClick={() => scrollTo(bracketLayoutControls.right)} />
          </div>
        </div>
      </div>

      <div
        className="w-full overflow-x-auto overflow-y-visible overscroll-x-contain pb-4"
        ref={scrollRef}
      >
        <div
          className="relative overflow-visible"
          style={{
            minWidth: scaledCanvasWidth,
            width: scaledCanvasWidth,
            height: scaledCanvasHeight,
          }}
        >
          <div
            className="absolute left-0 top-0 overflow-visible bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.12),transparent_35%),linear-gradient(180deg,rgba(15,23,42,0.88),rgba(2,6,23,0.96))]"
            style={{
              width: rawCanvasWidth,
              height: rawCanvasHeight,
              padding: boardPadding,
              transform: `scale(${scale})`,
              transformOrigin: "top left",
            }}
          >
            <div
              className="relative"
              style={{
                width: layout.width,
                height: layout.height + headerOffset,
              }}
            >
              <RoundLabels layout={layout} />
              <ConnectorLayer layout={layout} />
              <ChampionBlock champion={champion} layout={layout} />
              {layout.slots.map((slot) => (
                <BracketSlotCard key={slot.id} slot={slot} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ScaleButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      aria-pressed={active}
      className={
        active
          ? "rounded-md border border-blue-300/40 bg-blue-500/25 px-3 py-2 text-xs font-black text-blue-50 outline-none ring-2 ring-blue-300/25"
          : "rounded-md border border-white/10 bg-white/5 px-3 py-2 text-xs font-black text-slate-200 outline-none hover:border-blue-400/40 hover:bg-blue-500/15 focus-visible:ring-2 focus-visible:ring-blue-300/60"
      }
      onClick={onClick}
      type="button"
    >
      {label}
    </button>
  );
}

function ScrollButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      className="rounded-md border border-white/10 bg-white/5 px-3 py-2 text-xs font-black text-slate-200 outline-none hover:border-blue-400/40 hover:bg-blue-500/15 focus-visible:ring-2 focus-visible:ring-blue-300/60"
      onClick={onClick}
      type="button"
    >
      {label}
    </button>
  );
}

function RoundLabels({ layout }: { layout: BracketLayout }) {
  const lefts = getColumnLefts(layout);

  return (
    <>
      {columnLabels.map((label) => (
        <div
          className={`absolute top-0 text-xs font-black uppercase tracking-normal text-slate-400 ${
            label.align === "right"
              ? "text-right"
              : label.align === "center"
                ? "text-center"
                : "text-left"
          }`}
          key={`${label.column}-${label.label}`}
          style={{
            left: lefts[label.column - 1],
            width: layout.columnWidths[label.column - 1],
          }}
        >
          {label.label}
        </div>
      ))}
    </>
  );
}

function ConnectorLayer({ layout }: { layout: BracketLayout }) {
  return (
    <svg
      aria-hidden="true"
      className="pointer-events-none absolute left-0 top-0 z-0"
      height={layout.height + headerOffset}
      width={layout.width}
    >
      <g transform={`translate(0 ${headerOffset})`}>
        {layout.connectors.map((connector) => (
          <path
            className={
              connector.kind === "loser"
                ? "stroke-slate-500/35"
                : "stroke-blue-300/35"
            }
            d={connector.path}
            fill="none"
            key={connector.id}
            strokeDasharray={connector.kind === "loser" ? "4 5" : undefined}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
          />
        ))}
      </g>
    </svg>
  );
}

function ChampionBlock({
  champion,
  layout,
}: {
  champion: string | null;
  layout: BracketLayout;
}) {
  const lefts = getColumnLefts(layout);
  const column = 5;
  const width = layout.columnWidths[column - 1];

  return (
    <div
      className="absolute z-20 rounded-xl border border-amber-300/30 bg-amber-400/10 p-3 text-center shadow-2xl shadow-amber-950/20"
      style={{
        left: lefts[column - 1],
        top: headerOffset + layout.rowHeight * 2,
        width,
      }}
    >
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-400/15 text-amber-200 ring-1 ring-amber-200/35">
        <Trophy aria-hidden="true" size={26} />
      </div>
      <div className="mt-2 text-[11px] font-black uppercase tracking-[0.18em] text-amber-200">
        World Champion
      </div>
      <div className="mt-2 rounded-lg border border-white/10 bg-slate-950/70 p-2">
        {champion ? (
          <TeamName teamName={champion} truncate={false} />
        ) : (
          <div className="text-xl font-black uppercase text-slate-300">TBD</div>
        )}
      </div>
    </div>
  );
}

function BracketSlotCard({ slot }: { slot: BracketLayoutSlot }) {
  const label = getSlotLabel(slot.round);

  return (
    <div
      className="absolute z-10"
      style={{
        left: slot.x,
        top: slot.y + headerOffset,
        width: slot.width,
        height: slot.height,
      }}
    >
      {slot.match ? (
        <BracketMatchCard label={label} match={slot.match} />
      ) : (
        <PendingSlot label={label} />
      )}
    </div>
  );
}

function BracketMatchCard({ match, label }: { match: BracketMatch; label: string }) {
  const status = match.needsReview ? "needs_review" : match.status;
  const winMethod = formatWinMethodLabel(match);

  return (
    <article
      aria-label={`${label}: ${match.homeParticipant.label} versus ${match.awayParticipant.label}`}
      className="flex h-full min-w-0 flex-col rounded-lg border border-white/10 bg-slate-900/90 p-2.5 shadow-lg shadow-black/25"
    >
      <div className="flex items-start justify-between gap-2">
        <StatusBadge status={status} />
        <span className="min-w-0 text-right text-[10px] leading-snug text-slate-500">
          {label === "Final" || label === "Bronze Final"
            ? label
            : formatKyivDateTime(match.kickoffAt)}
        </span>
      </div>
      <div className="mt-2 min-h-0 flex-1 space-y-1.5">
        <TeamRow
          score={match.homeScore}
          teamName={match.homeParticipant.label}
          muted={
            !match.homeParticipant.dependency?.resolvedTeam &&
            Boolean(match.homeParticipant.dependency)
          }
          winner={
            match.winner === match.homeTeam || match.winner === match.homeParticipant.label
          }
        />
        <TeamRow
          score={match.awayScore}
          teamName={match.awayParticipant.label}
          muted={
            !match.awayParticipant.dependency?.resolvedTeam &&
            Boolean(match.awayParticipant.dependency)
          }
          winner={
            match.winner === match.awayTeam || match.winner === match.awayParticipant.label
          }
        />
      </div>
      <div
        className="mt-1 truncate text-[11px] leading-snug text-slate-400"
        title={
          status === "needs_review"
            ? match.reviewReason ?? "Finished match needs winner review"
            : winMethod ?? (match.status === "live" ? "Live now" : formatScore(match))
        }
      >
        {status === "needs_review"
          ? match.reviewReason ?? "Finished match needs winner review"
          : winMethod ?? (match.status === "live" ? "Live now" : formatScore(match))}
      </div>
    </article>
  );
}

function TeamRow({
  teamName,
  score,
  muted,
  winner,
}: {
  teamName: string;
  score: number | null;
  muted: boolean;
  winner: boolean;
}) {
  return (
    <div className="flex min-w-0 items-start justify-between gap-2">
      <TeamName muted={muted} teamName={teamName} />
      <span
        className={`shrink-0 text-base font-black leading-tight ${
          winner ? "text-emerald-300" : "text-slate-100"
        }`}
      >
        {score ?? ""}
      </span>
    </div>
  );
}

function PendingSlot({ label }: { label: string }) {
  return (
    <div className="flex h-full flex-col justify-center rounded-lg border border-dashed border-white/10 bg-white/[0.03] p-3 text-center">
      <div className="text-[11px] font-black uppercase text-slate-500">{label}</div>
      <div className="mt-1 text-sm font-black text-slate-300">TBD</div>
    </div>
  );
}

function getSlotLabel(round: BracketLayoutRound): string {
  if (round === "third_place") {
    return "Bronze Final";
  }

  if (round === "final") {
    return "Final";
  }

  return formatStage(round);
}

function getColumnLefts(layout: BracketLayout): number[] {
  const lefts: number[] = [];
  let left = 0;

  for (const width of layout.columnWidths) {
    lefts.push(left);
    left += width + layout.columnGap;
  }

  return lefts;
}

function getScaleValue(scaleMode: ScaleMode, fitScale: number): number {
  if (scaleMode === "fit") {
    return fitScale;
  }

  if (scaleMode === "100") {
    return 1;
  }

  if (scaleMode === "75") {
    return 0.75;
  }

  return 0.5;
}

function roundScale(value: number): number {
  return Math.round(value * 100) / 100;
}
