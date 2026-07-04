import type { NormalizedMatch } from "@/domain/types";
import { formatKyivDateTime } from "@/lib/date-format";
import { formatScore, formatStage } from "@/lib/format";
import { getDisplayMatchStatus } from "@/lib/knockout-display";
import { getTeamDisplayName } from "@/lib/team-flags";
import { StatusBadge } from "./StatusBadge";
import { TeamName } from "./TeamName";

type MatchCardProps = {
  match: NormalizedMatch;
};

export function MatchCard({ match }: MatchCardProps) {
  const isFinished = match.status === "finished";
  const status = getDisplayMatchStatus(match);

  return (
    <article className="min-w-0 rounded-lg border border-white/10 bg-slate-900/75 p-4 shadow-xl shadow-black/20 transition hover:-translate-y-0.5 hover:border-blue-400/40">
      <div className="flex items-center justify-between gap-3">
        <span className="rounded-md bg-white/5 px-2.5 py-1 text-xs font-black uppercase text-slate-300">
          {formatStage(match.stage)}
        </span>
        <StatusBadge status={status} />
      </div>
      <div className="mt-4 grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-3">
        <TeamName teamName={match.homeTeam} />
        <span
          className={
            isFinished
              ? "rounded-md bg-white/10 px-3 py-1.5 text-lg font-black text-slate-50"
              : "rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-sm font-bold text-slate-400"
          }
        >
          {isFinished ? formatScore(match) : "VS"}
        </span>
        <TeamName align="right" teamName={match.awayTeam} />
      </div>
      <div className="mt-3 flex flex-wrap justify-between gap-2 text-xs leading-snug text-slate-400">
        <span>{formatKyivDateTime(match.kickoffAt)} Kyiv time</span>
        <span className={match.winner ? "font-semibold text-emerald-300" : ""}>
          {match.winner
            ? `Winner: ${getTeamDisplayName(match.winner)}`
            : formatStage(match.stage)}
        </span>
      </div>
    </article>
  );
}
