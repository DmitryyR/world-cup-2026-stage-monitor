import type { AgentRunRecord, TournamentState } from "@/domain/types";
import { formatKyivDateTime } from "@/lib/date-format";
import { StatusBadge } from "./StatusBadge";

type DataHealthCardProps = {
  latestAcceptedRun: AgentRunRecord | null;
  state: TournamentState | null;
};

export function DataHealthCard({ latestAcceptedRun, state }: DataHealthCardProps) {
  const checkerStatus = state?.checkerStatus ?? "failed";

  return (
    <section className="min-w-0 rounded-lg border border-white/10 bg-slate-900/75 p-4 shadow-xl shadow-black/20 backdrop-blur">
      <div className="text-xs font-black uppercase tracking-normal text-slate-400">
        Data Health
      </div>
      <div className="mt-3 flex items-center justify-between gap-3">
        <span className="text-sm text-slate-300">Checker</span>
        <StatusBadge status={checkerStatus} />
      </div>
      <dl className="mt-4 grid gap-3 text-sm">
        <div className="flex justify-between gap-4">
          <dt className="text-slate-400">Provider</dt>
          <dd className="font-semibold text-slate-100">{latestAcceptedRun?.source ?? "-"}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-slate-400">Last check</dt>
          <dd className="text-right font-semibold text-slate-100">
            {state ? `${formatKyivDateTime(state.lastCheckedAt)} Kyiv time` : "Not run"}
          </dd>
        </div>
      </dl>
    </section>
  );
}
