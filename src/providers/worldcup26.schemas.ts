import { z } from "zod";

const stringOrNumberOrNullSchema = z.union([
  z.string(),
  z.number(),
  z.null(),
  z.undefined(),
]);

export const worldCup26GameSchema = z
  .object({
    _id: z.string().optional(),
    id: stringOrNumberOrNullSchema,
    home_team_id: stringOrNumberOrNullSchema.optional(),
    away_team_id: stringOrNumberOrNullSchema.optional(),
    home_score: stringOrNumberOrNullSchema.optional(),
    away_score: stringOrNumberOrNullSchema.optional(),
    group: z.string().optional().nullable(),
    matchday: stringOrNumberOrNullSchema.optional(),
    local_date: z.string().min(1),
    persian_date: z.string().optional().nullable(),
    stadium_id: stringOrNumberOrNullSchema.optional(),
    finished: stringOrNumberOrNullSchema.optional(),
    time_elapsed: stringOrNumberOrNullSchema.optional(),
    type: z.string().min(1),
    home_team_name_en: z.string().optional().nullable(),
    away_team_name_en: z.string().optional().nullable(),
    home_team_label: z.string().optional().nullable(),
    away_team_label: z.string().optional().nullable(),
  })
  .passthrough();

export const worldCup26ResponseSchema = z.object({
  games: z.array(worldCup26GameSchema),
});

export type WorldCup26Game = z.infer<typeof worldCup26GameSchema>;
export type WorldCup26Response = z.infer<typeof worldCup26ResponseSchema>;
