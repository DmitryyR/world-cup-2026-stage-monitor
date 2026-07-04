import { z } from "zod";

export const apiFootballFixtureSchema = z.object({
  fixture: z.object({
    id: z.number().int(),
    date: z.string().datetime({ offset: true }),
    status: z.object({
      short: z.string().min(1),
      long: z.string().optional().nullable(),
    }),
  }),
  league: z.object({
    round: z.string().min(1),
  }),
  teams: z.object({
    home: z.object({
      name: z.string().min(1),
      winner: z.boolean().nullable().optional(),
    }),
    away: z.object({
      name: z.string().min(1),
      winner: z.boolean().nullable().optional(),
    }),
  }),
  goals: z.object({
    home: z.number().int().min(0).nullable(),
    away: z.number().int().min(0).nullable(),
  }),
});

export const apiFootballFixturesResponseSchema = z.object({
  get: z.string().optional(),
  parameters: z.record(z.string(), z.unknown()).optional(),
  errors: z.union([z.array(z.unknown()), z.record(z.string(), z.unknown())]).optional(),
  results: z.number().int().min(0).optional(),
  response: z.array(apiFootballFixtureSchema),
});

export type ApiFootballFixture = z.infer<typeof apiFootballFixtureSchema>;
export type ApiFootballFixturesResponse = z.infer<
  typeof apiFootballFixturesResponseSchema
>;
