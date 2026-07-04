import type { NormalizedMatch } from "@/domain/types";
import { formatDateTime, formatScore, formatStage } from "@/lib/format";
import { getTeamDisplayName } from "@/lib/team-flags";
import { StageBadge } from "./StageBadge";
import { TeamDisplay } from "./TeamDisplay";

type MatchCardProps = {
  match: NormalizedMatch;
};

export function MatchCard({ match }: MatchCardProps) {
  const isFinished = match.status === "finished";

  return (
    <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-center justify-between gap-3">
        <StageBadge stage={match.stage} />
        <span
          className={
            isFinished
              ? "rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold capitalize text-emerald-700"
              : "rounded-full bg-blue-50 px-2.5 py-1 text-xs font-bold capitalize text-blue-700"
          }
        >
          {match.status}
        </span>
      </div>
      <div className="mt-5 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
        <TeamDisplay teamName={match.homeTeam} />
        <span
          className={
            isFinished
              ? "rounded-md bg-slate-100 px-4 py-2 text-xl font-black text-slate-950"
              : "rounded-full border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-500"
          }
        >
          {isFinished ? formatScore(match) : "VS"}
        </span>
        <TeamDisplay align="right" teamName={match.awayTeam} />
      </div>
      <div className="mt-4 flex flex-wrap justify-between gap-2 text-sm text-slate-500">
        <span>{formatDateTime(match.kickoffAt)}</span>
        <span className={match.winner ? "font-semibold text-emerald-700" : ""}>
          {match.winner
            ? `Winner: ${getTeamDisplayName(match.winner)}`
            : formatStage(match.stage)}
        </span>
      </div>
    </article>
  );
}
