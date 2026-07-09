import { BracketBoard } from "@/components/BracketBoard";
import { DataHealthCard } from "@/components/DataHealthCard";
import { TeamName } from "@/components/TeamName";
import { TeamPathCard } from "@/components/TeamPathCard";
import { TopMetricCard } from "@/components/TopMetricCard";
import { buildBracketModel } from "@/domain/bracket-builder";
import { formatKyivDateTime } from "@/lib/date-format";
import { formatStage } from "@/lib/format";
import { PrismaTournamentRepository } from "@/lib/prisma-repository";

export const revalidate = 300;

export default async function BracketPage() {
  const repository = new PrismaTournamentRepository();
  const [matches, state, runs] = await Promise.all([
    repository.getMatches(),
    repository.getLatestState(),
    repository.getAgentRuns(20),
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
  const bracket = buildBracketModel(matches);

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
              <div className="mt-2">{completedMatches} matches completed</div>
            </div>
          }
          label="Tournament Progress"
          value={`${completedMatches} / ${totalMatches || 0}`}
        />
        <TopMetricCard
          detail={`Tournament matches remaining: ${state?.remainingMatches ?? 0}`}
          label="Current Stage"
          value={state ? formatStage(state.currentStage) : "Not run"}
        />
        <TopMetricCard
          accent={liveMatch ? "red" : "blue"}
          detail={
            liveMatch ? (
              <LiveMatchDetail match={liveMatch} />
            ) : (
              "No accepted live match"
            )
          }
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

      <section className="min-w-0 space-y-3">
        <div className="flex flex-col gap-2 rounded-lg border border-white/10 bg-slate-950/45 p-3 text-sm text-slate-300 sm:flex-row sm:items-center sm:justify-between">
          <span className="font-semibold">Scroll bracket horizontally to view the full tree.</span>
          <a
            className="inline-flex w-fit rounded-md border border-white/10 bg-white/5 px-3 py-2 text-xs font-black text-blue-200 hover:border-blue-400/40 hover:bg-blue-500/15"
            href="#team-path"
          >
            Open Team Path
          </a>
        </div>
        <BracketBoard matches={matches} />
      </section>

      <details
        className="rounded-lg border border-white/10 bg-slate-950/45 p-4"
        id="team-path"
      >
        <summary className="cursor-pointer text-sm font-black uppercase text-slate-100">
          Team Path
        </summary>
        <div className="mt-4 max-w-xl">
          <TeamPathCard matches={matches} />
        </div>
      </details>
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

function LiveMatchDetail({
  match,
}: {
  match: {
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
