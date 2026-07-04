import type { NormalizedMatch } from "@/domain/types";
import { formatDateTime, formatScore, formatStage } from "@/lib/format";

type MatchTableProps = {
  matches: NormalizedMatch[];
};

export function MatchTable({ matches }: MatchTableProps) {
  return (
    <div className="overflow-hidden rounded-md border border-slate-200 bg-white">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-normal text-slate-500">
            <tr>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Stage</th>
              <th className="px-4 py-3">Teams</th>
              <th className="px-4 py-3">Score</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Winner</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {matches.map((match) => (
              <tr key={match.externalId} className="hover:bg-slate-50">
                <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                  {formatDateTime(match.kickoffAt)}
                </td>
                <td className="whitespace-nowrap px-4 py-3 font-medium text-slate-800">
                  {formatStage(match.stage)}
                </td>
                <td className="px-4 py-3 text-slate-950">
                  {match.homeTeam} vs {match.awayTeam}
                </td>
                <td className="whitespace-nowrap px-4 py-3 font-semibold">
                  {formatScore(match)}
                </td>
                <td className="whitespace-nowrap px-4 py-3 capitalize text-slate-600">
                  {match.status}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                  {match.winner ?? "-"}
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
