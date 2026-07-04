import type { NormalizedMatch } from "@/domain/types";
import { formatKyivDateTime } from "@/lib/date-format";
import { formatScore, formatStage } from "@/lib/format";
import { getTeamDisplayName } from "@/lib/team-flags";
import { TeamDisplay } from "./TeamDisplay";

type MatchTableProps = {
  matches: NormalizedMatch[];
};

export function MatchTable({ matches }: MatchTableProps) {
  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-normal text-slate-500">
            <tr>
              <th className="px-4 py-3">Date (Kyiv time)</th>
              <th className="px-4 py-3">Stage</th>
              <th className="px-4 py-3">Teams</th>
              <th className="px-4 py-3">Score</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Winner</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {matches.map((match) => (
              <tr key={match.externalId} className="hover:bg-emerald-50/40">
                <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                  {formatKyivDateTime(match.kickoffAt)}
                </td>
                <td className="whitespace-nowrap px-4 py-3 font-medium text-slate-800">
                  {formatStage(match.stage)}
                </td>
                <td className="px-4 py-3 text-slate-950">
                  <span className="flex min-w-64 items-center gap-3">
                    <TeamDisplay teamName={match.homeTeam} variant="compact" />
                    <span className="text-slate-400">vs</span>
                    <TeamDisplay teamName={match.awayTeam} variant="compact" />
                  </span>
                </td>
                <td className="whitespace-nowrap px-4 py-3 font-semibold">
                  {formatScore(match)}
                </td>
                <td className="whitespace-nowrap px-4 py-3 capitalize">
                  <span
                    className={
                      match.status === "finished"
                        ? "rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700"
                        : "rounded-full bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700"
                    }
                  >
                    {match.status}
                  </span>
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                  {match.winner ? getTeamDisplayName(match.winner) : "-"}
                </td>
              </tr>
            ))}
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
