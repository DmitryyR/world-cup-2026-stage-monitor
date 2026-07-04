import type { NormalizedMatch, TournamentStage } from "@/domain/types";
import { formatScore, formatStage } from "@/lib/format";

type BracketRoundProps = {
  stage: TournamentStage;
  matches: NormalizedMatch[];
};

export function BracketRound({ stage, matches }: BracketRoundProps) {
  return (
    <section className="space-y-3">
      <h2 className="text-xl font-semibold text-slate-950">{formatStage(stage)}</h2>
      <div className="grid gap-3 md:grid-cols-2">
        {matches.map((match) => (
          <article
            key={match.externalId}
            className="rounded-md border border-slate-200 bg-white p-4"
          >
            <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
              <span className="font-semibold text-slate-950">{match.homeTeam}</span>
              <span className="font-bold text-slate-900">{formatScore(match)}</span>
              <span className="text-right font-semibold text-slate-950">
                {match.awayTeam}
              </span>
            </div>
            <div className="mt-3 text-sm text-slate-500">
              {match.winner ? `Winner: ${match.winner}` : "Scheduled"}
            </div>
          </article>
        ))}
        {matches.length === 0 ? (
          <div className="rounded-md border border-dashed border-slate-300 bg-white p-4 text-sm text-slate-500">
            No matches accepted for this round yet.
          </div>
        ) : null}
      </div>
    </section>
  );
}
