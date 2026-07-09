import { NextResponse } from "next/server";
import { PrismaTournamentRepository } from "@/lib/prisma-repository";

export const revalidate = 60;

export async function GET() {
  const repository = new PrismaTournamentRepository();
  const runs = await repository.getAgentRuns(50);

  return NextResponse.json({ data: runs });
}
