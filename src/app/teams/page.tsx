import { TeamDirectory } from "@/components/TeamDirectory";
import { PrismaTournamentRepository } from "@/lib/prisma-repository";

export const dynamic = "force-dynamic";

export default async function TeamsPage() {
  const repository = new PrismaTournamentRepository();
  const matches = await repository.getMatches();

  return (
    <div className="space-y-5">
      <div className="rounded-lg border border-white/10 bg-slate-900/75 p-5 shadow-xl shadow-black/20">
        <div className="text-xs font-black uppercase tracking-normal text-blue-300">
          Team Paths
        </div>
        <h1 className="mt-2 text-3xl font-black text-slate-50">Teams</h1>
        <p className="mt-2 text-sm text-slate-400">
          Search teams and choose one to view its route through accepted tournament
          data.
        </p>
      </div>
      <TeamDirectory matches={matches} />
    </div>
  );
}
