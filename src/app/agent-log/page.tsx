import { AgentRunTable } from "@/components/AgentRunTable";
import { MonitorRunButton } from "@/components/MonitorRunButton";
import { buildBracketModel } from "@/domain/bracket-builder";
import { PrismaTournamentRepository } from "@/lib/prisma-repository";

export const dynamic = "force-dynamic";

export default async function AgentLogPage() {
  const repository = new PrismaTournamentRepository();
  const [runs, matches] = await Promise.all([
    repository.getAgentRuns(),
    repository.getMatches(),
  ]);
  const bracket = buildBracketModel(matches);

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 rounded-lg border border-white/10 bg-slate-900/75 p-5 shadow-xl shadow-black/20 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="text-xs font-black uppercase tracking-normal text-blue-300">
            Maker / Checker
          </div>
          <h1 className="mt-2 text-3xl font-black text-slate-50">Agent Log</h1>
          <p className="mt-2 text-sm text-slate-400">
            Monitor runs, checker outcomes, and provider diagnostics.
          </p>
        </div>
        <MonitorRunButton />
      </div>
      <AgentRunTable bracketValidation={bracket.validation} runs={runs} />
    </div>
  );
}
