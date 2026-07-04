import type { NormalizedMatch } from "@/domain/types";
import { formatKyivDateTime } from "@/lib/date-format";
import { formatScore, formatStage } from "@/lib/format";
import { getTeamDisplayName } from "@/lib/team-flags";
import { TeamName } from "./TeamName";

type TeamPathCardProps = {
  matches: NormalizedMatch[];
};

export function TeamPathCard({ matches }: TeamPathCardProps) {
  const selectedTeam = pickTeam(matches);

  if (!selectedTeam) {
    return (
      <section className="min-w-0 rounded-lg border border-white/10 bg-slate-900/75 p-4">
        <h2 className="text-sm font-black uppercase text-slate-100">Team Path</h2>
        <p className="mt-4 text-sm text-slate-400">No accepted team path yet.</p>
      </section>
    );
  }

  const teamMatches = matches
    .filter((match) => match.homeTeam === selectedTeam || match.awayTeam === selectedTeam)
    .sort((first, second) => first.kickoffAt.localeCompare(second.kickoffAt));
  const finished = teamMatches.filter((match) => match.status === "finished");
  const nextMatch = teamMatches.find((match) => match.status !== "finished") ?? null;

  return (
    <section className="min-w-0 rounded-lg border border-white/10 bg-slate-900/75 p-4 shadow-xl shadow-black/20">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-black uppercase text-slate-100">Team Path</h2>
        <span className="text-xs font-semibold text-blue-300">Auto-selected</span>
      </div>
      <div className="mt-4">
        <TeamName teamName={selectedTeam} />
      </div>
      <div className="mt-4 space-y-3 border-l border-slate-700 pl-4">
        {finished.slice(-4).map((match) => (
          <div key={match.externalId} className="relative text-sm">
            <span className="absolute -left-[21px] top-1.5 h-2.5 w-2.5 rounded-full bg-emerald-400" />
            <div className="text-xs font-semibold text-slate-400">
              {formatStage(match.stage)}
            </div>
            <div className="mt-1 text-slate-100">
              {getTeamDisplayName(match.homeTeam)} {formatScore(match)}{" "}
              {getTeamDisplayName(match.awayTeam)}
            </div>
          </div>
        ))}
        <div className="relative text-sm">
          <span className="absolute -left-[21px] top-1.5 h-2.5 w-2.5 rounded-full border border-slate-500 bg-slate-900" />
          <div className="text-xs font-semibold text-slate-400">
            {nextMatch ? formatStage(nextMatch.stage) : "Next step"}
          </div>
          <div className="mt-1 text-slate-300">
            {nextMatch
              ? `${formatKyivDateTime(nextMatch.kickoffAt)} Kyiv time`
              : "Pending"}
          </div>
        </div>
      </div>
    </section>
  );
}

function pickTeam(matches: NormalizedMatch[]): string | null {
  const latestFinished = [...matches]
    .filter((match) => match.status === "finished")
    .sort((first, second) => second.kickoffAt.localeCompare(first.kickoffAt))[0];

  return latestFinished?.winner ?? latestFinished?.homeTeam ?? null;
}
