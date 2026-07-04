import { runMonitorLoop } from "@/agents/monitor-loop";
import { createProvider } from "@/agents/fetcher-agent";
import { PrismaTournamentRepository } from "@/lib/prisma-repository";

const result = await runMonitorLoop({
  provider: createProvider(),
  repository: new PrismaTournamentRepository(),
});

if (result.status === "failed") {
  console.error(result.errors.join("\n"));
  process.exitCode = 1;
} else {
  console.log(
    `Monitor passed: ${result.state.currentStage}, ${result.changesDetected} changes`,
  );
}
