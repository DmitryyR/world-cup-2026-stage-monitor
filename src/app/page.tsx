import Link from "next/link";
import { ArrowRight, CalendarDays, Trophy } from "lucide-react";
import { HomeHero } from "@/components/HomeHero";
import { MatchCard } from "@/components/MatchCard";
import { MonitorRunButton } from "@/components/MonitorRunButton";
import { StageProgressTimeline } from "@/components/StageProgressTimeline";
import { TournamentSummary } from "@/components/TournamentSummary";
import { PrismaTournamentRepository } from "@/lib/prisma-repository";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const repository = new PrismaTournamentRepository();
  const [state, matches, runs] = await Promise.all([
    repository.getLatestState(),
    repository.getMatches(),
    repository.getAgentRuns(),
  ]);
  const latestResults = matches
    .filter((match) => match.status === "finished")
    .sort((first, second) => second.kickoffAt.localeCompare(first.kickoffAt))
    .slice(0, 3);
  const upcomingMatches = matches
    .filter((match) => match.status !== "finished")
    .sort((first, second) => first.kickoffAt.localeCompare(second.kickoffAt))
    .slice(0, 3);
  const latestAcceptedRun =
    runs.find((run) => run.checkerResult === "passed") ?? null;
  const nextMatch = upcomingMatches[0] ?? null;

  return (
    <div className="space-y-8">
      <HomeHero
        latestAcceptedRun={latestAcceptedRun}
        matches={matches}
        nextMatch={nextMatch}
        state={state}
      />
      <TournamentSummary state={state} />
      <div className="flex flex-wrap items-center gap-3">
        <MonitorRunButton />
        <Link
          className="inline-flex h-10 items-center gap-2 rounded-md border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 hover:border-emerald-500 hover:text-emerald-700"
          href="/agent-log"
        >
          Agent Log
          <ArrowRight aria-hidden="true" size={16} />
        </Link>
      </div>
      <StageProgressTimeline
        currentStage={state?.currentStage}
        matches={matches}
      />
      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="flex items-center gap-2 text-xl font-semibold text-slate-950">
            <Trophy aria-hidden="true" size={21} />
            Latest Results
          </h2>
          <Link
            className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-700 hover:text-emerald-800"
            href="/matches"
          >
            View all results
            <ArrowRight aria-hidden="true" size={16} />
          </Link>
        </div>
        <div className="grid gap-3 lg:grid-cols-3">
          {latestResults.map((match) => (
            <MatchCard key={match.externalId} match={match} />
          ))}
          {latestResults.length === 0 ? (
            <p className="text-sm text-slate-500">No accepted results yet.</p>
          ) : null}
        </div>
      </section>
      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="flex items-center gap-2 text-xl font-semibold text-slate-950">
            <CalendarDays aria-hidden="true" size={21} />
            Upcoming Matches
          </h2>
          <Link
            className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-700 hover:text-emerald-800"
            href="/matches"
          >
            View all matches
            <ArrowRight aria-hidden="true" size={16} />
          </Link>
        </div>
        <div className="grid gap-3 lg:grid-cols-3">
          {upcomingMatches.map((match) => (
            <MatchCard key={match.externalId} match={match} />
          ))}
          {upcomingMatches.length === 0 ? (
            <p className="text-sm text-slate-500">No accepted upcoming matches yet.</p>
          ) : null}
        </div>
      </section>
    </div>
  );
}
