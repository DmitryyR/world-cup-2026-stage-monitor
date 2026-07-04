import { NextResponse } from "next/server";
import { runMonitorLoop } from "@/agents/monitor-loop";
import { createProvider } from "@/agents/fetcher-agent";
import { PrismaTournamentRepository } from "@/lib/prisma-repository";

export async function POST() {
  const result = await runMonitorLoop({
    provider: createProvider(),
    repository: new PrismaTournamentRepository(),
  });

  return NextResponse.json(
    { data: result },
    { status: result.status === "passed" ? 200 : 422 },
  );
}
