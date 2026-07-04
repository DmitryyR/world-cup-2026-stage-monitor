import type { NormalizedMatch, TournamentStage } from "@/domain/types";
import { formatKyivDateTime } from "@/lib/date-format";
import { formatScore, formatStage } from "@/lib/format";
import {
  getDisplayMatchStatus,
  getWinMethodLabel,
  knockoutStages,
  resolveTeamNameForDisplay,
} from "@/lib/knockout-display";
import { StatusBadge } from "./StatusBadge";
import { TeamName } from "./TeamName";

type BracketBoardProps = {
  matches: NormalizedMatch[];
};

export function BracketBoard({ matches }: BracketBoardProps) {
  return (
    <section className="overflow-hidden rounded-lg border border-white/10 bg-slate-950/50 shadow-2xl shadow-black/30">
      <div className="border-b border-white/10 px-5 py-4">
        <h1 className="text-lg font-black uppercase text-slate-50">
          Tournament Bracket
        </h1>
      </div>
      <div className="overflow-x-auto pb-4">
        <div className="grid min-w-[1280px] grid-cols-6">
          {knockoutStages.map((stage, index) => (
            <BracketRound
              key={stage}
              isLast={index === knockoutStages.length - 1}
              matches={matches}
              stage={stage}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function BracketRound({
  stage,
  matches,
  isLast,
}: {
  stage: TournamentStage;
  matches: NormalizedMatch[];
  isLast: boolean;
}) {
  const roundMatches = matches.filter((match) => match.stage === stage);

  return (
    <div className="min-w-52 border-r border-white/10 px-3 py-4 last:border-r-0">
      <div className="mb-4 text-center">
        <div className="text-xs font-black uppercase text-slate-200">
          {formatStage(stage)}
        </div>
        <div className="mt-1 text-xs text-slate-500">
          {roundMatches.length * 2 || "-"} teams
        </div>
      </div>
      <div className="space-y-4">
        {roundMatches.map((match) => (
          <BracketMatchCard
            key={match.externalId}
            isLast={isLast}
            match={match}
            matches={matches}
          />
        ))}
        {roundMatches.length === 0 ? (
          <div className="rounded-lg border border-dashed border-white/10 bg-white/[0.03] p-4 text-center text-sm text-slate-500">
            Pending
          </div>
        ) : null}
      </div>
    </div>
  );
}

function BracketMatchCard({
  match,
  matches,
  isLast,
}: {
  match: NormalizedMatch;
  matches: NormalizedMatch[];
  isLast: boolean;
}) {
  const status = getDisplayMatchStatus(match);
  const homeTeam = resolveTeamNameForDisplay(match.homeTeam, matches);
  const awayTeam = resolveTeamNameForDisplay(match.awayTeam, matches);
  const winMethod = getWinMethodLabel(match);

  return (
    <article
      className={`relative rounded-lg border border-white/10 bg-slate-900/80 p-3 shadow-lg shadow-black/20 ${
        isLast
          ? ""
          : "after:absolute after:left-full after:top-1/2 after:hidden after:h-px after:w-4 after:bg-slate-600 md:after:block"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <StatusBadge status={status} />
        <span className="text-xs text-slate-400">
          {formatKyivDateTime(match.kickoffAt)}
        </span>
      </div>
      <div className="mt-3 space-y-2">
        <TeamRow
          score={match.homeScore}
          teamName={homeTeam}
          winner={match.winner === match.homeTeam || match.winner === homeTeam}
        />
        <TeamRow
          score={match.awayScore}
          teamName={awayTeam}
          winner={match.winner === match.awayTeam || match.winner === awayTeam}
        />
      </div>
      <div className="mt-3 text-xs text-slate-400">
        {status === "needs_review"
          ? "Finished match needs winner review"
          : winMethod ?? (match.status === "live" ? "Live now" : formatScore(match))}
      </div>
    </article>
  );
}

function TeamRow({
  teamName,
  score,
  winner,
}: {
  teamName: string;
  score: number | null;
  winner: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <TeamName teamName={teamName} />
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
