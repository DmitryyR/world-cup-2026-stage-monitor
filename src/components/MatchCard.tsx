import type { NormalizedMatch } from "@/domain/types";
import { formatDateTime, formatScore, formatStage } from "@/lib/format";
import { StageBadge } from "./StageBadge";

type MatchCardProps = {
  match: NormalizedMatch;
};

export function MatchCard({ match }: MatchCardProps) {
  return (
    <article className="rounded-md border border-slate-200 bg-white p-4">
      <div className="flex items-center justify-between gap-3">
        <StageBadge stage={match.stage} />
        <span className="text-sm font-medium capitalize text-slate-500">
          {match.status}
        </span>
      </div>
      <div className="mt-4 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
        <span className="text-base font-semibold text-slate-950">
          {match.homeTeam}
        </span>
        <span className="text-lg font-bold text-slate-900">
          {formatScore(match)}
        </span>
        <span className="text-right text-base font-semibold text-slate-950">
          {match.awayTeam}
        </span>
      </div>
      <div className="mt-4 flex flex-wrap justify-between gap-2 text-sm text-slate-500">
        <span>{formatDateTime(match.kickoffAt)}</span>
        <span>{match.winner ? `Winner: ${match.winner}` : formatStage(match.stage)}</span>
      </div>
    </article>
  );
}
