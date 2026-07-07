"use client";

import { useState } from "react";
import type { BracketValidation } from "@/domain/bracket-builder";
import type { AgentRunRecord } from "@/domain/types";
import { formatKyivDateTime } from "@/lib/date-format";
import { formatStage } from "@/lib/format";
import { StatusBadge } from "./StatusBadge";

type AgentRunTableProps = {
  runs: AgentRunRecord[];
  bracketValidation?: BracketValidation;
};

export function AgentRunTable({ runs, bracketValidation }: AgentRunTableProps) {
  const [showPreviousRuns, setShowPreviousRuns] = useState(false);
  const latestRun = runs[0] ?? null;
  const previousRuns = runs.slice(1);
  const previousRunsWithChanges = previousRuns.filter(
    (run) => run.changesDetected > 0,
  );

  return (
    <section className="space-y-4">
      <div className="rounded-lg border border-white/10 bg-slate-900/75 p-5 shadow-xl shadow-black/20">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-sm font-black uppercase text-slate-100">Latest run</h2>
          {latestRun ? <StatusBadge status={latestRun.checkerResult} /> : null}
        </div>
        {latestRun ? (
          <RunDetails bracketValidation={bracketValidation} run={latestRun} />
        ) : (
          <p className="mt-4 text-sm text-slate-400">No monitor runs yet.</p>
        )}
      </div>

      {previousRuns.length > 0 ? (
        <div className="rounded-lg border border-white/10 bg-slate-950/50 p-4">
          <button
            className="flex w-full items-center justify-between text-left text-sm font-semibold text-slate-200"
            onClick={() => setShowPreviousRuns((value) => !value)}
            type="button"
          >
            Show previous runs with changes ({previousRunsWithChanges.length})
            <span className="text-slate-400">{showPreviousRuns ? "Hide" : "Open"}</span>
          </button>
          {showPreviousRuns ? (
            previousRunsWithChanges.length > 0 ? (
              <div className="mt-4 overflow-x-auto">
                <table className="min-w-full divide-y divide-white/10 text-sm">
                  <thead className="text-left text-xs uppercase text-slate-400">
                    <tr>
                      <th className="px-3 py-2">Started</th>
                      <th className="px-3 py-2">Checker</th>
                      <th className="px-3 py-2">Stage</th>
                      <th className="px-3 py-2">Changes</th>
                      <th className="px-3 py-2">Message</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {previousRunsWithChanges.map((run) => (
                      <tr key={run.id}>
                        <td className="whitespace-nowrap px-3 py-2 text-slate-300">
                          {formatKyivDateTime(run.startedAt)}
                        </td>
                        <td className="px-3 py-2">
                          <StatusBadge status={run.checkerResult} />
                        </td>
                        <td className="whitespace-nowrap px-3 py-2 text-slate-300">
                          {run.detectedStage ? formatStage(run.detectedStage) : "-"}
                        </td>
                        <td className="px-3 py-2 text-slate-300">{run.changesDetected}</td>
                        <td className="max-w-xs px-3 py-2 text-slate-400">
                          {run.errorMessage ?? "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="mt-4 text-sm text-slate-400">
                No previous runs with detected changes.
              </p>
            )
          ) : null}
        </div>
      ) : null}
    </section>
  );
}

function RunDetails({
  run,
  bracketValidation,
}: {
  run: AgentRunRecord;
  bracketValidation?: BracketValidation;
}) {
  return (
    <>
      <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
        <RunRow label="Started" value={`${formatKyivDateTime(run.startedAt)} Kyiv time`} />
        <RunRow
          label="Finished"
          value={run.finishedAt ? `${formatKyivDateTime(run.finishedAt)} Kyiv time` : "-"}
        />
        <RunRow label="Source" value={run.source} />
        <RunRow label="Stage" value={run.detectedStage ? formatStage(run.detectedStage) : "-"} />
        <RunRow label="Changes" value={String(run.changesDetected)} />
        <RunRow label="Duration" value={formatRunDuration(run.startedAt, run.finishedAt)} />
        <RunRow
          label={run.status === "passed" ? "Warning" : "Error"}
          value={run.errorMessage ?? "-"}
        />
      </dl>
      {bracketValidation ? (
        <div className="mt-5 rounded-lg border border-white/10 bg-slate-950/45 p-4 text-sm">
          <div className="text-xs font-black uppercase text-slate-500">
            Bracket diagnostics
          </div>
          <dl className="mt-3 grid gap-3 sm:grid-cols-2">
            <RunRow
              label="Needs review"
              value={String(bracketValidation.needsReviewMatches)}
            />
            <RunRow
              label="Unresolved winners"
              value={String(bracketValidation.unresolvedWinners)}
            />
            <RunRow
              label="Future match dependencies"
              value={String(bracketValidation.placeholderDependencies)}
            />
            <RunRow
              label="Stale live matches"
              value={String(bracketValidation.staleLiveMatches)}
            />
          </dl>
          {bracketValidation.affectedMatches.length > 0 ? (
            <ul className="mt-3 space-y-1 text-xs text-amber-200">
              {bracketValidation.affectedMatches.map((match) => (
                <li key={match.externalId}>
                  Match {match.externalId}: {match.reason}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}
    </>
  );
}

function formatRunDuration(startedAt: string, finishedAt: string | null): string {
  if (!finishedAt) {
    return "-";
  }

  const started = new Date(startedAt).getTime();
  const finished = new Date(finishedAt).getTime();

  if (!Number.isFinite(started) || !Number.isFinite(finished) || finished < started) {
    return "-";
  }

  const seconds = Math.round((finished - started) / 1000);
  if (seconds < 60) {
    return `${seconds}s`;
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  return `${minutes}m ${remainingSeconds}s`;
}

function RunRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-bold uppercase text-slate-500">{label}</dt>
      <dd className="mt-1 font-semibold text-slate-200">{value}</dd>
    </div>
  );
}
