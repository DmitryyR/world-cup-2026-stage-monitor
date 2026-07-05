import Link from "next/link";
import {
  buildBracketModel,
  formatWinMethodLabel,
  type BracketMatch,
  type BracketRound as BracketRoundModel,
} from "@/domain/bracket-builder";
import type { NormalizedMatch } from "@/domain/types";
import { formatKyivDateTime } from "@/lib/date-format";
import { formatScore, formatStage } from "@/lib/format";
import { formatPlural } from "@/lib/match-filters";
import { StatusBadge } from "./StatusBadge";
import { TeamName } from "./TeamName";

type BracketBoardProps = {
  matches: NormalizedMatch[];
};

export function BracketBoard({ matches }: BracketBoardProps) {
  const bracket = buildBracketModel(matches);

  return (
    <section className="w-full min-w-0 overflow-hidden rounded-lg border border-white/10 bg-slate-950/50 shadow-2xl shadow-black/30">
      <div className="border-b border-white/10 px-4 py-3 sm:px-5 sm:py-4">
        <h1 className="text-lg font-black uppercase text-slate-50">
          Tournament Bracket
        </h1>
      </div>
      <div className="grid gap-3 p-3 md:hidden">
        {bracket.rounds.map((round, index) => (
          <details
            className="rounded-lg border border-white/10 bg-slate-950/60"
            key={round.stage}
            open={index < 2}
          >
            <summary className="flex cursor-pointer items-center justify-between gap-3 px-3 py-3 text-sm font-black uppercase text-slate-100">
              <span>{formatStage(round.stage)}</span>
              <span className="text-xs font-semibold normal-case text-slate-500">
                {round.matches.length * 2 || "-"} teams
              </span>
            </summary>
            <div className="grid gap-3 border-t border-white/10 p-3">
              {round.matches.map((match) => (
                <BracketMatchCard isLast key={match.externalId} match={match} />
              ))}
              {round.matches.length === 0 ? (
                <div className="rounded-lg border border-dashed border-white/10 bg-white/[0.03] p-3 text-center text-sm text-slate-500">
                  Pending
                </div>
              ) : null}
            </div>
          </details>
        ))}
      </div>
      <div className="hidden overflow-x-auto overscroll-x-contain pb-5 md:block">
        <div className="grid min-w-[1320px] grid-cols-6">
          {bracket.rounds.map((round, index) => (
            <BracketRound
              key={round.stage}
              isLast={index === bracket.rounds.length - 1}
              round={round}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function BracketRound({
  round,
  isLast,
}: {
  round: BracketRoundModel;
  isLast: boolean;
}) {
  return (
    <div className="min-w-0 border-r border-white/10 px-3 py-4 last:border-r-0">
      <div className="mb-4 text-center">
        <div className="text-xs font-black uppercase text-slate-200">
          {formatStage(round.stage)}
        </div>
        <div className="mt-1 text-xs text-slate-500">
          {round.matches.length * 2 || "-"} teams
        </div>
      </div>
      <div className={getRoundStackClass(round.stage)}>
        {round.matches.map((match) => (
          <BracketMatchCard
            key={match.externalId}
            isLast={isLast}
            match={match}
          />
        ))}
        {round.matches.length === 0 ? (
          <div className="rounded-lg border border-dashed border-white/10 bg-white/[0.03] p-3 text-center text-sm text-slate-500">
            Pending
          </div>
        ) : null}
        {round.matches.length > 0 ? (
          <Link
            className="flex h-9 items-center justify-center rounded-md border border-white/10 bg-white/5 text-xs font-semibold text-slate-300 hover:border-blue-400/40 hover:bg-blue-500/15"
            href="/matches"
          >
            {round.matches.length === 1
              ? "View match"
              : `View all ${formatPlural(round.matches.length, "match")}`}
          </Link>
        ) : null}
      </div>
    </div>
  );
}

function getRoundStackClass(stage: BracketRoundModel["stage"]): string {
  if (stage === "round_of_16") {
    return "space-y-4 md:pt-8";
  }

  if (stage === "quarter_final") {
    return "space-y-8 md:pt-14";
  }

  if (stage === "semi_final") {
    return "space-y-12 md:pt-24";
  }

  if (stage === "third_place" || stage === "final") {
    return "space-y-12 md:pt-32";
  }

  return "space-y-3";
}

function BracketMatchCard({
  match,
  isLast,
}: {
  match: BracketMatch;
  isLast: boolean;
}) {
  const status = match.needsReview ? "needs_review" : match.status;
  const winMethod = formatWinMethodLabel(match);

  return (
    <article
      className={`relative min-w-0 rounded-lg border border-white/10 bg-slate-900/80 p-2.5 shadow-lg shadow-black/20 ${
        isLast
          ? ""
          : "after:absolute after:left-full after:top-1/2 after:hidden after:h-px after:w-4 after:bg-slate-600 md:after:block"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <StatusBadge status={status} />
        <span className="min-w-0 text-right text-[11px] leading-snug text-slate-400">
          {formatKyivDateTime(match.kickoffAt)}
        </span>
      </div>
      <div className="mt-2.5 space-y-1.5">
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
      <div className="mt-2.5 text-xs leading-snug text-slate-400">
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
    <div className="flex min-w-0 items-center justify-between gap-2">
      <TeamName muted={muted} teamName={teamName} />
      <span
        className={`shrink-0 text-lg font-black ${
          winner ? "text-emerald-300" : "text-slate-100"
        }`}
      >
        {score ?? ""}
      </span>
    </div>
  );
}
