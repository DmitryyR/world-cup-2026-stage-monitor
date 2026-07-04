import { CalendarClock, ShieldCheck } from "lucide-react";
import type {
  AgentRunRecord,
  NormalizedMatch,
  TournamentState,
} from "@/domain/types";
import { formatDateTime, formatStage } from "@/lib/format";
import { StageBadge } from "./StageBadge";
import { TeamDisplay } from "./TeamDisplay";

type HomeHeroProps = {
  state: TournamentState | null;
  matches: NormalizedMatch[];
  nextMatch: NormalizedMatch | null;
  latestAcceptedRun: AgentRunRecord | null;
};

export function HomeHero({
  state,
  matches,
  nextMatch,
  latestAcceptedRun,
}: HomeHeroProps) {
  const totalMatches = matches.length;
  const completedMatches = state?.completedMatches ?? 0;
  const progress = totalMatches > 0 ? completedMatches / totalMatches : 0;
  const progressPercent = Math.round(progress * 100);

  return (
    <section className="relative overflow-hidden rounded-lg border border-emerald-100 bg-white p-5 shadow-sm sm:p-7">
      <div
        className="absolute inset-0 opacity-90"
        style={{
          backgroundImage:
            "radial-gradient(circle at 8% 78%, rgba(16,185,129,.22), transparent 22%), radial-gradient(circle at 70% 10%, rgba(34,197,94,.13), transparent 26%), repeating-radial-gradient(circle at 22% 95%, rgba(15,23,42,.06) 0 1px, transparent 1px 18px)",
        }}
      />
      <div className="relative grid gap-5 lg:grid-cols-[1.35fr_.8fr_.9fr] lg:items-center">
        <div className="space-y-4">
          <StageBadge stage={state?.currentStage} />
          <div>
            <p className="text-sm font-semibold uppercase text-slate-600">
              Tournament Progress
            </p>
            <div className="mt-3 flex flex-wrap items-end gap-2">
              <span className="text-5xl font-bold text-emerald-700">
                {completedMatches}
              </span>
              <span className="pb-2 text-lg font-semibold text-slate-500">
                / {totalMatches || "0"} matches completed
              </span>
            </div>
          </div>
          <div className="max-w-xl">
            <div className="h-3 overflow-hidden rounded-full bg-slate-200">
              <div
                className="h-full rounded-full bg-emerald-600"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="mt-2 text-right text-sm font-semibold text-slate-600">
              {progressPercent}%
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white/90 p-5 shadow-sm backdrop-blur">
          <div className="flex items-center gap-2 text-sm font-bold uppercase text-slate-500">
            <CalendarClock aria-hidden="true" size={17} />
            Next Match
          </div>
          {nextMatch ? (
            <>
              <div className="mt-5 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
                <TeamDisplay teamName={nextMatch.homeTeam} />
                <span className="rounded-full bg-slate-100 px-3 py-2 text-sm font-bold text-slate-500">
                  VS
                </span>
                <TeamDisplay align="right" teamName={nextMatch.awayTeam} />
              </div>
              <div className="mt-5 text-center text-sm font-medium text-slate-600">
                {formatDateTime(nextMatch.kickoffAt)} - {formatStage(nextMatch.stage)}
              </div>
            </>
          ) : (
            <p className="mt-5 text-sm text-slate-500">No upcoming match accepted yet.</p>
          )}
        </div>

        <div className="rounded-lg border border-slate-200 bg-white/90 p-5 shadow-sm backdrop-blur">
          <div className="flex items-center gap-2 text-sm font-bold uppercase text-slate-500">
            <ShieldCheck aria-hidden="true" size={17} />
            Data Health
          </div>
          <dl className="mt-5 space-y-3 text-sm">
            <HealthRow label="Provider" value={latestAcceptedRun?.source ?? "-"} />
            <HealthRow
              label="Checker"
              value={state?.checkerStatus ?? "failed"}
              variant={state?.checkerStatus === "passed" ? "success" : "muted"}
            />
            <HealthRow
              label="Last Check"
              value={state ? formatDateTime(state.lastCheckedAt) : "Not run"}
            />
          </dl>
        </div>
      </div>
    </section>
  );
}

function HealthRow({
  label,
  value,
  variant = "default",
}: {
  label: string;
  value: string;
  variant?: "default" | "success" | "muted";
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <dt className="font-medium text-slate-500">{label}</dt>
      <dd
        className={
          variant === "success"
            ? "rounded-md bg-emerald-100 px-2 py-1 font-bold capitalize text-emerald-800"
            : variant === "muted"
              ? "rounded-md bg-slate-100 px-2 py-1 font-bold capitalize text-slate-600"
              : "text-right font-semibold text-slate-950"
        }
      >
        {value}
      </dd>
    </div>
  );
}
