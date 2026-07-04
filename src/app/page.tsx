import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { MatchCard } from "@/components/MatchCard";
import { MonitorRunButton } from "@/components/MonitorRunButton";
import { TournamentSummary } from "@/components/TournamentSummary";
import { PrismaTournamentRepository } from "@/lib/prisma-repository";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const repository = new PrismaTournamentRepository();
  const [state, matches] = await Promise.all([
    repository.getLatestState(),
    repository.getMatches(),
  ]);
  const latestResults = matches
    .filter((match) => match.status === "finished")
    .slice(-3)
    .reverse();
  const upcomingMatches = matches
    .filter((match) => match.status !== "finished")
    .slice(0, 3);

  return (
    <div className="space-y-10">
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
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-slate-950">Latest Results</h2>
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
        <h2 className="text-xl font-semibold text-slate-950">Upcoming Matches</h2>
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
