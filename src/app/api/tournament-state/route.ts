import { NextResponse } from "next/server";
import { PrismaTournamentRepository } from "@/lib/prisma-repository";

export async function GET() {
  const repository = new PrismaTournamentRepository();
  const state = await repository.getLatestState();

  return NextResponse.json({ data: state });
}
