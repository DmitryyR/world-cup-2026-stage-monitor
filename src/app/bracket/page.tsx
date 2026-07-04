import { BracketRound } from "@/components/BracketRound";
import type { TournamentStage } from "@/domain/types";
import { PrismaTournamentRepository } from "@/lib/prisma-repository";

export const dynamic = "force-dynamic";

const knockoutStages: TournamentStage[] = [
  "round_of_32",
  "round_of_16",
  "quarter_final",
  "semi_final",
  "third_place",
  "final",
];

export default async function BracketPage() {
  const repository = new PrismaTournamentRepository();
  const matches = await repository.getMatches();

  return (
    <div className="space-y-7">
      <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <h1 className="text-3xl font-semibold text-slate-950">Bracket</h1>
        <p className="mt-2 text-sm text-slate-500">
          Knockout rounds grouped from accepted match data.
        </p>
      </div>
      {knockoutStages.map((stage) => (
        <BracketRound
          key={stage}
          stage={stage}
          matches={matches.filter((match) => match.stage === stage)}
        />
      ))}
    </div>
  );
}
