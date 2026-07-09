import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight, CalendarDays, Trophy } from "lucide-react";
import { DataHealthCard } from "@/components/DataHealthCard";
import { MatchCard } from "@/components/MatchCard";
import { MonitorRunButton } from "@/components/MonitorRunButton";
import { TeamName } from "@/components/TeamName";
import { TopMetricCard } from "@/components/TopMetricCard";
import { buildBracketModel } from "@/domain/bracket-builder";
import { formatKyivDateTime } from "@/lib/date-format";
import { formatStage } from "@/lib/format";
import { isFutureScheduledMatch } from "@/lib/match-staleness";
import { PrismaTournamentRepository } from "@/lib/prisma-repository";

export const revalidate = 60;

export default async function HomePage() {
  const repository = new PrismaTournamentRepository();
  const [state, matches, runs] = await Promise.all([
    repository.getLatestState(),
    repository.getMatches(),
    repository.getAgentRuns(20),
  ]);
  const latestResults = matches
    .filter((match) => match.status === "finished")
    .sort((first, second) => second.kickoffAt.localeCompare(first.kickoffAt))
    .slice(0, 4);
  const now = new Date();
  const upcomingMatches = matches
    .filter((match) => isFutureScheduledMatch(match, now))
    .sort((first, second) => first.kickoffAt.localeCompare(second.kickoffAt))
    .slice(0, 4);
  const liveMatch = matches.find((match) => match.status === "live") ?? null;
  const nextMatch = upcomingMatches[0] ?? null;
  const latestAcceptedRun =
    runs.find((run) => run.checkerResult === "passed") ?? null;
  const bracket = buildBracketModel(matches);
  const totalMatches = matches.length;
  const completedMatches = state?.completedMatches ?? 0;
  const progressPercent =
    totalMatches > 0 ? Math.round((completedMatches / totalMatches) * 100) : 0;

  return (
    <div className="w-full space-y-5">
      <section className="grid gap-3 md:grid-cols-2 lg:grid-cols-5">
        <TopMetricCard
          detail={
            <div>
              <div className="h-2 overflow-hidden rounded-full bg-slate-800">
                <div
                  className="h-full rounded-full bg-emerald-400"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <div className="mt-2 text-slate-300">Matches completed</div>
            </div>
          }
          label="Tournament Progress"
          value={
            <span>
              {completedMatches} / {totalMatches || 0}{" "}
              <span className="text-lg text-emerald-300">{progressPercent}%</span>
            </span>
          }
        />
        <TopMetricCard
          detail={`Tournament matches remaining: ${state?.remainingMatches ?? 0}`}
          label="Current Stage"
          value={state ? formatStage(state.currentStage) : "Not run"}
        />
        <TopMetricCard
          accent={liveMatch ? "red" : "blue"}
          detail={liveMatch ? <LiveMatchDetail match={liveMatch} /> : "No live match accepted"}
          label="Live Now"
          value={liveMatch ? <TeamLine match={liveMatch} /> : "Idle"}
        />
        <TopMetricCard
          accent="blue"
          detail={nextMatch ? `${formatKyivDateTime(nextMatch.kickoffAt)} Kyiv time` : "No scheduled match"}
          label="Next Match"
          value={nextMatch ? <TeamLine match={nextMatch} /> : "-"}
        />
        <DataHealthCard
          bracketValidation={bracket.validation}
          compact
          latestAcceptedRun={latestAcceptedRun}
          state={state}
        />
      </section>

      <div className="flex flex-wrap items-center gap-3">
        <MonitorRunButton />
        <Link
          className="inline-flex h-12 items-center gap-2 rounded-md border border-white/10 bg-white/5 px-4 text-sm font-semibold text-slate-200 hover:border-blue-400/40 hover:bg-blue-500/15"
          href="/bracket"
        >
          Open Bracket
          <ArrowRight aria-hidden="true" size={16} />
        </Link>
      </div>

      <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_300px] 2xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_340px]">
        <DashboardSection
          href="/matches"
          icon={<Trophy aria-hidden="true" size={18} />}
          title="Recent Results"
        >
          <div className="grid gap-3">
            {latestResults.map((match) => (
              <MatchCard key={match.externalId} match={match} />
            ))}
          </div>
        </DashboardSection>

        <DashboardSection
          href="/matches"
          icon={<CalendarDays aria-hidden="true" size={18} />}
          title="Upcoming Matches"
        >
          <div className="grid gap-3">
            {upcomingMatches.map((match) => (
              <MatchCard key={match.externalId} match={match} />
            ))}
          </div>
        </DashboardSection>

        <TeamPathCta />
      </div>
    </div>
  );
}

function TeamPathCta() {
  return (
    <section className="min-w-0 rounded-lg border border-white/10 bg-slate-900/75 p-4 shadow-xl shadow-black/20">
      <div className="text-xs font-black uppercase tracking-normal text-blue-300">
        Team Path
      </div>
      <h2 className="mt-2 text-xl font-black text-slate-50">Track a team path</h2>
      <p className="mt-2 text-sm leading-6 text-slate-400">
        Select a team to see its route through the knockout stage and upcoming
        bracket context.
      </p>
      <Link
        className="mt-4 inline-flex h-10 items-center rounded-md bg-blue-600 px-4 text-sm font-black text-white hover:bg-blue-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300/60"
        href="/teams"
      >
        Select team
      </Link>
    </section>
  );
}

function DashboardSection({
  title,
  href,
  icon,
  children,
}: {
  title: string;
  href: string;
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="min-w-0 rounded-lg border border-white/10 bg-slate-950/40 p-4 shadow-xl shadow-black/20">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-sm font-black uppercase text-slate-100">
          {icon}
          {title}
        </h2>
        <Link className="text-sm font-semibold text-blue-300 hover:text-blue-200" href={href}>
          View all
        </Link>
      </div>
      {children}
    </section>
  );
}

function TeamLine({
  match,
}: {
  match: { homeTeam: string; awayTeam: string };
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <TeamName teamName={match.homeTeam} />
      <span className="text-slate-500">vs</span>
      <TeamName teamName={match.awayTeam} />
    </div>
  );
}

function LiveMatchDetail({
  match,
}: {
  match: {
    homeTeam: string;
    awayTeam: string;
    homeScore: number | null;
    awayScore: number | null;
    kickoffAt: string;
  };
}) {
  return (
    <div className="space-y-2">
      <div className="text-xl font-black text-red-300">
        {formatInlineScore(match.homeScore, match.awayScore)}
      </div>
      <div className="text-xs text-slate-400">
        Started {formatKyivDateTime(match.kickoffAt)} Kyiv time
      </div>
    </div>
  );
}

function formatInlineScore(homeScore: number | null, awayScore: number | null): string {
  if (homeScore === null || awayScore === null) {
    return "-";
  }

  return `${homeScore} - ${awayScore}`;
}
