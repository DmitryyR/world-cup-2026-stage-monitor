"use client";

import { useState } from "react";
import type { AgentRunRecord } from "@/domain/types";
import { formatKyivDateTime } from "@/lib/date-format";
import { formatStage } from "@/lib/format";
import { StatusBadge } from "./StatusBadge";

type AgentRunTableProps = {
  runs: AgentRunRecord[];
};

export function AgentRunTable({ runs }: AgentRunTableProps) {
  const [showPreviousRuns, setShowPreviousRuns] = useState(false);
  const latestRun = runs[0] ?? null;
  const previousRuns = runs.slice(1);

  return (
    <section className="space-y-4">
      <div className="rounded-lg border border-white/10 bg-slate-900/75 p-5 shadow-xl shadow-black/20">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-sm font-black uppercase text-slate-100">Latest run</h2>
          {latestRun ? <StatusBadge status={latestRun.checkerResult} /> : null}
        </div>
        {latestRun ? (
          <RunDetails run={latestRun} />
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
            Show previous runs ({previousRuns.length})
            <span className="text-slate-400">{showPreviousRuns ? "Hide" : "Open"}</span>
          </button>
          {showPreviousRuns ? (
            <div className="mt-4 overflow-x-auto">
              <table className="min-w-full divide-y divide-white/10 text-sm">
                <thead className="text-left text-xs uppercase text-slate-400">
                  <tr>
                    <th className="px-3 py-2">Started</th>
                    <th className="px-3 py-2">Checker</th>
                    <th className="px-3 py-2">Stage</th>
                    <th className="px-3 py-2">Changes</th>
                    <th className="px-3 py-2">Error</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {previousRuns.map((run) => (
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
          ) : null}
        </div>
      ) : null}
    </section>
  );
}

function RunDetails({ run }: { run: AgentRunRecord }) {
  return (
    <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
      <RunRow label="Started" value={`${formatKyivDateTime(run.startedAt)} Kyiv time`} />
      <RunRow
        label="Finished"
        value={run.finishedAt ? `${formatKyivDateTime(run.finishedAt)} Kyiv time` : "-"}
      />
      <RunRow label="Source" value={run.source} />
      <RunRow label="Stage" value={run.detectedStage ? formatStage(run.detectedStage) : "-"} />
      <RunRow label="Changes" value={String(run.changesDetected)} />
      <RunRow label="Error" value={run.errorMessage ?? "-"} />
    </dl>
  );
}

function RunRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-bold uppercase text-slate-500">{label}</dt>
      <dd className="mt-1 font-semibold text-slate-200">{value}</dd>
    </div>
  );
}
