import { NextResponse } from "next/server";
import { PrismaTournamentRepository } from "@/lib/prisma-repository";

export async function GET() {
  const repository = new PrismaTournamentRepository();
  const runs = await repository.getAgentRuns();

  return NextResponse.json({ data: runs });
}
