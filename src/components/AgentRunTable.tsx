import type { AgentRunRecord } from "@/domain/types";
import { formatDateTime, formatStage } from "@/lib/format";

type AgentRunTableProps = {
  runs: AgentRunRecord[];
};

export function AgentRunTable({ runs }: AgentRunTableProps) {
  return (
    <div className="overflow-hidden rounded-md border border-slate-200 bg-white">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-normal text-slate-500">
            <tr>
              <th className="px-4 py-3">Started</th>
              <th className="px-4 py-3">Finished</th>
              <th className="px-4 py-3">Source</th>
              <th className="px-4 py-3">Changes</th>
              <th className="px-4 py-3">Checker</th>
              <th className="px-4 py-3">Stage</th>
              <th className="px-4 py-3">Error</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {runs.map((run) => (
              <tr key={run.id} className="hover:bg-slate-50">
                <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                  {formatDateTime(run.startedAt)}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                  {run.finishedAt ? formatDateTime(run.finishedAt) : "-"}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-slate-800">
                  {run.source}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                  {run.changesDetected}
                </td>
                <td className="whitespace-nowrap px-4 py-3">
                  <span
                    className={
                      run.checkerResult === "passed"
                        ? "rounded-md bg-emerald-100 px-2 py-1 font-semibold text-emerald-800"
                        : "rounded-md bg-rose-100 px-2 py-1 font-semibold text-rose-800"
                    }
                  >
                    {run.checkerResult}
                  </span>
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                  {run.detectedStage ? formatStage(run.detectedStage) : "-"}
                </td>
                <td className="max-w-xs px-4 py-3 text-slate-600">
                  {run.errorMessage ?? "-"}
                </td>
              </tr>
            ))}
            {runs.length === 0 ? (
              <tr>
                <td className="px-4 py-8 text-center text-slate-500" colSpan={7}>
                  No monitor runs yet.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
