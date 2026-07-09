import type { NormalizedMatch } from "@/domain/types";
import { resolveKnockoutOutcome } from "@/domain/bracket-builder";
import { formatKyivDateTime } from "@/lib/date-format";
import { formatScore, formatStage } from "@/lib/format";
import {
  getDisplayMatchStatus,
  getMatchReviewLabel,
  getWinMethodLabel,
  resolveTeamNameForDisplay,
} from "@/lib/knockout-display";
import { getTeamDisplayName } from "@/lib/team-flags";
import { StatusBadge } from "./StatusBadge";
import { TeamName } from "./TeamName";

type MatchTableProps = {
  matches: NormalizedMatch[];
  emptyMessage?: string;
};

export function MatchTable({ matches, emptyMessage = "No accepted matches yet." }: MatchTableProps) {
  return (
    <div className="overflow-hidden rounded-lg border border-white/10 bg-slate-950/50 shadow-xl shadow-black/20">
      <div className="hidden overflow-x-auto md:block">
        <table className="min-w-full divide-y divide-white/10 text-sm">
          <thead className="bg-white/[0.03] text-left text-xs font-semibold uppercase tracking-normal text-slate-400">
            <tr>
              <th className="px-4 py-3" scope="col">Date (Kyiv time)</th>
              <th className="px-4 py-3" scope="col">Stage</th>
              <th className="px-4 py-3" scope="col">Teams</th>
              <th className="px-4 py-3" scope="col">Score</th>
              <th className="px-4 py-3" scope="col">Status</th>
              <th className="px-4 py-3" scope="col">Winner</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {matches.map((match) => {
              const outcome = resolveKnockoutOutcome(match);
              const winner = outcome.winner ?? match.winner;
              const homeTeam = resolveTeamNameForDisplay(match.homeTeam, matches);
              const awayTeam = resolveTeamNameForDisplay(match.awayTeam, matches);
              const reviewLabel = getMatchReviewLabel(match);
              const resultMethod = getWinMethodLabel(match);

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
                      <TeamName teamName={homeTeam} />
                      <span className="text-slate-500">vs</span>
                      <TeamName teamName={awayTeam} />
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-center font-semibold text-slate-100">
                    {match.status === "scheduled" ? "-" : formatScore(match)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <StatusBadge status={getDisplayMatchStatus(match)} />
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-slate-300">
                    {winner ? (
                      <div>
                        <div className="font-semibold text-slate-100">
                          {getTeamDisplayName(winner)}
                        </div>
                        {resultMethod ? (
                          <div className="mt-1 text-xs text-emerald-300">
                            {resultMethod}
                          </div>
                        ) : null}
                      </div>
                    ) : reviewLabel ? (
                      <span className="font-semibold text-amber-200">{reviewLabel}</span>
                    ) : (
                      <span className="text-slate-500">TBD</span>
                    )}
                  </td>
                </tr>
              );
            })}
            {matches.length === 0 ? (
              <tr>
                <td className="px-4 py-8 text-center text-slate-500" colSpan={6}>
                  {emptyMessage}
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
      <div className="grid gap-3 p-3 md:hidden">
        {matches.map((match) => {
          const outcome = resolveKnockoutOutcome(match);
          const winner = outcome.winner ?? match.winner;
          const homeTeam = resolveTeamNameForDisplay(match.homeTeam, matches);
          const awayTeam = resolveTeamNameForDisplay(match.awayTeam, matches);
          const reviewLabel = getMatchReviewLabel(match);
          const resultMethod = getWinMethodLabel(match);

          return (
            <article
              aria-label={`${homeTeam} versus ${awayTeam}`}
              className="rounded-lg border border-white/10 bg-slate-900/75 p-3"
              key={match.externalId}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-xs font-semibold text-slate-500">
                    {formatKyivDateTime(match.kickoffAt)}
                  </div>
                  <div className="mt-1 text-xs font-black uppercase text-slate-400">
                    {formatStage(match.stage)}
                  </div>
                </div>
                <StatusBadge status={getDisplayMatchStatus(match)} />
              </div>
              <div className="mt-3 grid grid-cols-[1fr_auto] gap-3">
                <div className="space-y-2">
                  <TeamName teamName={homeTeam} />
                  <TeamName teamName={awayTeam} />
                </div>
                <div className="self-center rounded-md bg-white/10 px-3 py-1.5 text-center text-lg font-black text-slate-50">
                  {match.status === "scheduled" ? "-" : formatScore(match)}
                </div>
              </div>
              <div className="mt-3 text-sm text-slate-300">
                {winner ? (
                  <>
                    Winner:{" "}
                    <span className="font-semibold text-emerald-300">
                      {getTeamDisplayName(winner)}
                    </span>
                  </>
                ) : reviewLabel ? (
                  <span className="font-semibold text-amber-200">{reviewLabel}</span>
                ) : (
                  "Winner: TBD"
                )}
              </div>
              {resultMethod ? (
                <div className="mt-1 text-xs font-semibold text-emerald-300">
                  {resultMethod}
                </div>
              ) : null}
            </article>
          );
        })}
        {matches.length === 0 ? (
          <div className="rounded-lg border border-dashed border-white/10 bg-white/[0.03] p-6 text-center text-sm text-slate-400">
            {emptyMessage}
          </div>
        ) : null}
      </div>
    </div>
  );
}
