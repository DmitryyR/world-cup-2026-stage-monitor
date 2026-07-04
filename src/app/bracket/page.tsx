import { BracketBoard } from "@/components/BracketBoard";
import { DataHealthCard } from "@/components/DataHealthCard";
import { TeamName } from "@/components/TeamName";
import { TeamPathCard } from "@/components/TeamPathCard";
import { TopMetricCard } from "@/components/TopMetricCard";
import { formatKyivDateTime } from "@/lib/date-format";
import { formatStage } from "@/lib/format";
import { PrismaTournamentRepository } from "@/lib/prisma-repository";

export const dynamic = "force-dynamic";

export default async function BracketPage() {
  const repository = new PrismaTournamentRepository();
  const [matches, state, runs] = await Promise.all([
    repository.getMatches(),
    repository.getLatestState(),
    repository.getAgentRuns(),
  ]);
  const totalMatches = matches.length;
  const completedMatches = state?.completedMatches ?? 0;
  const progressPercent =
    totalMatches > 0 ? Math.round((completedMatches / totalMatches) * 100) : 0;
  const liveMatch = matches.find((match) => match.status === "live") ?? null;
  const nextMatch =
    matches
      .filter((match) => match.status === "scheduled")
      .sort((first, second) => first.kickoffAt.localeCompare(second.kickoffAt))[0] ??
    null;
  const latestAcceptedRun =
    runs.find((run) => run.checkerResult === "passed") ?? null;

  return (
    <div className="space-y-5">
      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
        <TopMetricCard
          detail={
            <div>
              <div className="h-2 overflow-hidden rounded-full bg-slate-800">
                <div
                  className="h-full rounded-full bg-emerald-400"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <div className="mt-2">{completedMatches} matches completed</div>
            </div>
          }
          label="Tournament Progress"
          value={`${completedMatches} / ${totalMatches || 0}`}
        />
        <TopMetricCard
          detail={`${state?.remainingMatches ?? 0} matches remaining`}
          label="Current Stage"
          value={state ? formatStage(state.currentStage) : "Not run"}
        />
        <TopMetricCard
          accent={liveMatch ? "red" : "blue"}
          detail={
            liveMatch ? (
              <TeamLine match={liveMatch} />
            ) : (
              "No accepted live match"
            )
          }
          label="Live Now"
          value={liveMatch ? "Live" : "Idle"}
        />
        <TopMetricCard
          accent="blue"
          detail={nextMatch ? <TeamLine match={nextMatch} /> : "No scheduled match"}
          label="Next Match"
          value={nextMatch ? formatKyivDateTime(nextMatch.kickoffAt) : "-"}
        />
        <DataHealthCard latestAcceptedRun={latestAcceptedRun} state={state} />
      </section>

      <div className="grid gap-4 xl:grid-cols-[1fr_300px]">
        <BracketBoard matches={matches} />
        <div className="space-y-4">
          <DataHealthCard latestAcceptedRun={latestAcceptedRun} state={state} />
          <TeamPathCard matches={matches} />
        </div>
      </div>
    </div>
  );
}

function TeamLine({
  match,
}: {
  match: { homeTeam: string; awayTeam: string };
}) {
  return (
    <div className="flex items-center gap-2 text-slate-100">
      <TeamName teamName={match.homeTeam} />
      <span className="text-slate-500">vs</span>
      <TeamName teamName={match.awayTeam} />
    </div>
  );
}
