import { TournamentPath } from "@/components/TournamentPath";
import { buildTournamentPath } from "@/lib/tournament-path";
import { PrismaTournamentRepository } from "@/lib/prisma-repository";

export const dynamic = "force-dynamic";

export default async function BracketPage() {
  const repository = new PrismaTournamentRepository();
  const [matches, state] = await Promise.all([
    repository.getMatches(),
    repository.getLatestState(),
  ]);
  const pathStages = buildTournamentPath(matches, state);

  return (
    <div className="space-y-7">
      <section className="relative overflow-hidden rounded-lg border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div
          className="absolute inset-0 opacity-80"
          style={{
            backgroundImage:
              "radial-gradient(circle at 12% 20%, rgba(16,185,129,.16), transparent 25%), radial-gradient(circle at 84% 12%, rgba(124,58,237,.14), transparent 28%)",
          }}
        />
        <div className="relative">
          <div className="text-xs font-black uppercase tracking-normal text-emerald-700">
            Tournament Path
          </div>
          <h1 className="mt-2 text-6xl font-black tracking-normal text-slate-950 sm:text-7xl">
            48 → 1
          </h1>
          <p className="mt-3 text-base font-medium text-slate-500">
            World Cup 2026 progression
          </p>
        </div>
      </section>

      <TournamentPath stages={pathStages} />
    </div>
  );
}
