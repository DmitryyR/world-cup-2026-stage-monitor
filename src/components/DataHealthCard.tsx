import type { AgentRunRecord, TournamentState } from "@/domain/types";
import type { BracketValidation } from "@/domain/bracket-builder";
import Link from "next/link";
import { formatKyivDateTime } from "@/lib/date-format";
import { StatusBadge } from "./StatusBadge";

type DataHealthCardProps = {
  latestAcceptedRun: AgentRunRecord | null;
  state: TournamentState | null;
  bracketValidation?: BracketValidation;
  compact?: boolean;
};

export function DataHealthCard({
  latestAcceptedRun,
  state,
  bracketValidation,
  compact = false,
}: DataHealthCardProps) {
  const checkerStatus = state?.checkerStatus ?? "failed";
  const displayStatus =
    checkerStatus === "failed"
      ? "failed"
      : bracketValidation &&
          (bracketValidation.needsReviewMatches > 0 ||
            bracketValidation.staleScheduledMatches > 0)
        ? "needs_review"
        : "passed";
  const syncedLabel = state
    ? `${formatKyivDateTime(state.lastCheckedAt)} Kyiv time`
    : "Not run";
  const providerWarning =
    latestAcceptedRun?.status === "passed" ? latestAcceptedRun.errorMessage : null;

  if (compact) {
    return (
      <section className="min-w-0 rounded-lg border border-white/10 bg-slate-900/75 p-4 shadow-xl shadow-black/20 backdrop-blur">
        <div className="text-xs font-black uppercase tracking-normal text-slate-400">
          Data Health
        </div>
        <div className="mt-3 flex items-center justify-between gap-3">
          <span className="text-sm font-semibold text-slate-100">
            {displayStatus === "passed" ? "Data OK" : "Needs review"}
          </span>
          <StatusBadge status={displayStatus} />
        </div>
        <p className="mt-3 text-xs leading-5 text-slate-400">Synced {syncedLabel}</p>
        {providerWarning ? (
          <p className="mt-2 text-xs font-semibold leading-5 text-amber-200">
            {providerWarning}
          </p>
        ) : null}
        <Link
          className="mt-2 inline-flex text-xs font-semibold text-blue-300 hover:text-blue-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300/50"
          href="/agent-log"
        >
          Agent Log
        </Link>
      </section>
    );
  }

  return (
    <section className="min-w-0 rounded-lg border border-white/10 bg-slate-900/75 p-4 shadow-xl shadow-black/20 backdrop-blur">
      <div className="text-xs font-black uppercase tracking-normal text-slate-400">
        Data Health
      </div>
      <div className="mt-3 flex items-center justify-between gap-3">
        <span className="text-sm text-slate-300">Checker</span>
        <StatusBadge status={displayStatus} />
      </div>
      <dl className="mt-4 grid gap-3 text-sm">
        <div className="flex justify-between gap-4">
          <dt className="text-slate-400">Provider</dt>
          <dd className="font-semibold text-slate-100">{latestAcceptedRun?.source ?? "-"}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-slate-400">Last sync</dt>
          <dd className="text-right font-semibold text-slate-100">
            {syncedLabel}
          </dd>
        </div>
        {providerWarning ? (
          <div className="flex justify-between gap-4">
            <dt className="text-slate-400">Provider warning</dt>
            <dd className="max-w-64 text-right font-semibold text-amber-200">
              {providerWarning}
            </dd>
          </div>
        ) : null}
        {bracketValidation && !compact ? (
          <>
            <div className="flex justify-between gap-4">
              <dt className="text-slate-400">Unresolved winners</dt>
              <dd className="font-semibold text-slate-100">
                {bracketValidation.unresolvedWinners}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-slate-400">Needs review</dt>
              <dd className="font-semibold text-slate-100">
                {bracketValidation.needsReviewMatches}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-slate-400">Future match dependencies</dt>
              <dd className="font-semibold text-slate-100">
                {bracketValidation.placeholderDependencies}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-slate-400">Stale live matches</dt>
              <dd className="font-semibold text-slate-100">
                {bracketValidation.staleLiveMatches}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-slate-400">Stale scheduled matches</dt>
              <dd className="font-semibold text-slate-100">
                {bracketValidation.staleScheduledMatches}
              </dd>
            </div>
          </>
        ) : null}
      </dl>
    </section>
  );
}
