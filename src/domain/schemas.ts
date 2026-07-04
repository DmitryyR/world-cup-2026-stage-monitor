import { z } from "zod";

export const matchStatusSchema = z.enum(["scheduled", "live", "finished"]);

export const tournamentStageSchema = z.enum([
  "group_stage",
  "round_of_32",
  "round_of_16",
  "quarter_final",
  "semi_final",
  "third_place",
  "final",
  "completed",
]);

export const normalizedMatchSchema = z.object({
  externalId: z.string().min(1),
  stage: tournamentStageSchema,
  homeTeam: z.string().min(1),
  awayTeam: z.string().min(1),
  homeScore: z.number().int().min(0).nullable(),
  awayScore: z.number().int().min(0).nullable(),
  status: matchStatusSchema,
  kickoffAt: z.string().datetime(),
  winner: z.string().min(1).nullable(),
});

export const normalizedMatchesSchema = z.array(normalizedMatchSchema);

export const tournamentStateSchema = z.object({
  currentStage: tournamentStageSchema,
  completedMatches: z.number().int().min(0),
  remainingMatches: z.number().int().min(0),
  champion: z.string().min(1).nullable(),
  lastCheckedAt: z.string().datetime(),
  checkerStatus: z.enum(["passed", "failed"]),
});

export const rawProviderMatchSchema = z.object({
  id: z.string().min(1),
  round: z.string().min(1),
  home: z.string().min(1),
  away: z.string().min(1),
  homeScore: z.number().int().min(0).nullable().optional(),
  awayScore: z.number().int().min(0).nullable().optional(),
  status: matchStatusSchema,
  kickoffAt: z.string().datetime(),
  winner: z.string().min(1).nullable().optional(),
});

export const rawProviderPayloadSchema = z.object({
  source: z.string().min(1),
  fetchedAt: z.string().datetime(),
  matches: z.array(rawProviderMatchSchema),
});
