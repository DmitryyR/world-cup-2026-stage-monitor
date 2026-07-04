import type { NormalizedMatch, TournamentStage } from "@/domain/types";
import { formatScore, formatStage } from "@/lib/format";
import { getTeamDisplayName } from "@/lib/team-flags";
import { TeamDisplay } from "./TeamDisplay";

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
            className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
              <TeamDisplay teamName={match.homeTeam} variant="compact" />
              <span className="rounded-md bg-slate-100 px-3 py-2 font-bold text-slate-900">
                {match.status === "finished" ? formatScore(match) : "VS"}
              </span>
              <TeamDisplay align="right" teamName={match.awayTeam} variant="compact" />
            </div>
            <div className="mt-3 text-sm text-slate-500">
              {match.winner
                ? `Winner: ${getTeamDisplayName(match.winner)}`
                : match.status}
            </div>
          </article>
        ))}
        {matches.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-300 bg-white p-4 text-sm text-slate-500">
            No matches accepted for this round yet.
          </div>
        ) : null}
      </div>
    </section>
  );
}
