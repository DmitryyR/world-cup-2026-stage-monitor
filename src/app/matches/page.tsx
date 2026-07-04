import { MatchTable } from "@/components/MatchTable";
import { PrismaTournamentRepository } from "@/lib/prisma-repository";

export const dynamic = "force-dynamic";

export default async function MatchesPage() {
  const repository = new PrismaTournamentRepository();
  const matches = await repository.getMatches();

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-3xl font-semibold text-slate-950">Matches</h1>
      </div>
      <MatchTable matches={matches} />
    </div>
  );
}
