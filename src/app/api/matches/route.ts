import { NextResponse } from "next/server";
import { PrismaTournamentRepository } from "@/lib/prisma-repository";

export async function GET() {
  const repository = new PrismaTournamentRepository();
  const matches = await repository.getMatches();

  return NextResponse.json({ data: matches });
}
