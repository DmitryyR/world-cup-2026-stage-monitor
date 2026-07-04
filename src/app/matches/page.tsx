import { MatchFiltersTable } from "@/components/MatchFiltersTable";
import { PrismaTournamentRepository } from "@/lib/prisma-repository";

export const dynamic = "force-dynamic";

export default async function MatchesPage() {
  const repository = new PrismaTournamentRepository();
  const [matches, state] = await Promise.all([
    repository.getMatches(),
    repository.getLatestState(),
  ]);

  return (
    <div className="space-y-5">
      <div className="rounded-lg border border-white/10 bg-slate-900/75 p-5 shadow-xl shadow-black/20">
        <div className="text-xs font-black uppercase tracking-normal text-blue-300">
          Match Center
        </div>
        <h1 className="mt-2 text-3xl font-black text-slate-50">Matches</h1>
        <p className="mt-2 text-sm text-slate-400">
          Accepted tournament matches from the database. All times are shown in Kyiv time.
        </p>
      </div>
      <MatchFiltersTable currentStage={state?.currentStage ?? null} matches={matches} />
    </div>
  );
}
