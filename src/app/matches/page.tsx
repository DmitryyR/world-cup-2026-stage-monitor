import { MatchTable } from "@/components/MatchTable";
import { PrismaTournamentRepository } from "@/lib/prisma-repository";

export const dynamic = "force-dynamic";

export default async function MatchesPage() {
  const repository = new PrismaTournamentRepository();
  const matches = await repository.getMatches();

  return (
    <div className="space-y-5">
      <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <h1 className="text-3xl font-semibold text-slate-950">Matches</h1>
        <p className="mt-2 text-sm text-slate-500">
          Accepted tournament matches from the database.
        </p>
      </div>
      <MatchTable matches={matches} />
    </div>
  );
}
