import { AgentRunTable } from "@/components/AgentRunTable";
import { MonitorRunButton } from "@/components/MonitorRunButton";
import { PrismaTournamentRepository } from "@/lib/prisma-repository";

export const dynamic = "force-dynamic";

export default async function AgentLogPage() {
  const repository = new PrismaTournamentRepository();
  const runs = await repository.getAgentRuns();

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-slate-950">Agent Log</h1>
          <p className="mt-2 text-sm text-slate-500">
            Monitor runs, checker outcomes, and provider diagnostics.
          </p>
        </div>
        <MonitorRunButton />
      </div>
      <AgentRunTable runs={runs} />
    </div>
  );
}
