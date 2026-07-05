import type { NormalizedMatch } from "@/domain/types";
import { resolveKnockoutOutcome } from "@/domain/bracket-builder";
import { formatKyivDateTime } from "@/lib/date-format";
import { formatScore, formatStage } from "@/lib/format";
import { getDisplayMatchStatus } from "@/lib/knockout-display";
import { getTeamDisplayName } from "@/lib/team-flags";
import { StatusBadge } from "./StatusBadge";
import { TeamName } from "./TeamName";

type MatchTableProps = {
  matches: NormalizedMatch[];
};

export function MatchTable({ matches }: MatchTableProps) {
  return (
    <div className="overflow-hidden rounded-lg border border-white/10 bg-slate-950/50 shadow-xl shadow-black/20">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-white/10 text-sm">
          <thead className="bg-white/[0.03] text-left text-xs font-semibold uppercase tracking-normal text-slate-400">
            <tr>
              <th className="px-4 py-3">Date (Kyiv time)</th>
              <th className="px-4 py-3">Stage</th>
              <th className="px-4 py-3">Teams</th>
              <th className="px-4 py-3">Score</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Winner</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {matches.map((match) => {
              const outcome = resolveKnockoutOutcome(match);
              const winner = outcome.winner ?? match.winner;

              return (
                <tr key={match.externalId} className="hover:bg-white/[0.03]">
                  <td className="whitespace-nowrap px-4 py-3 text-slate-300">
                    {formatKyivDateTime(match.kickoffAt)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 font-medium text-slate-200">
                    {formatStage(match.stage)}
                  </td>
                  <td className="px-4 py-3">
                    <span className="flex min-w-64 items-center gap-3">
                      <TeamName teamName={match.homeTeam} />
                      <span className="text-slate-500">vs</span>
                      <TeamName teamName={match.awayTeam} />
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-center font-semibold text-slate-100">
                    {match.status === "scheduled" ? "-" : formatScore(match)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <StatusBadge status={getDisplayMatchStatus(match)} />
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-slate-300">
                    {winner ? getTeamDisplayName(winner) : "-"}
                  </td>
                </tr>
              );
            })}
            {matches.length === 0 ? (
              <tr>
                <td className="px-4 py-8 text-center text-slate-500" colSpan={6}>
                  No accepted matches yet.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
