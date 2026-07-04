import { rawProviderPayloadSchema, normalizedMatchesSchema } from "./schemas";
import type { NormalizedMatch, RawProviderPayload, TournamentStage } from "./types";

const roundToStage: Record<string, TournamentStage> = {
  group: "group_stage",
  group_stage: "group_stage",
  "round of 32": "round_of_32",
  round_of_32: "round_of_32",
  "round of 16": "round_of_16",
  round_of_16: "round_of_16",
  "quarter-final": "quarter_final",
  "quarter-finals": "quarter_final",
  quarter_final: "quarter_final",
  "semi-final": "semi_final",
  "semi-finals": "semi_final",
  semi_final: "semi_final",
  "third place": "third_place",
  third_place: "third_place",
  final: "final",
};

export function normalizeProviderPayload(
  rawPayload: RawProviderPayload,
): NormalizedMatch[] {
  const parsedPayload = rawProviderPayloadSchema.parse(rawPayload);

  const normalized = parsedPayload.matches.map((match) => {
    const stage = roundToStage[match.round.trim().toLowerCase()];

    if (!stage) {
      throw new Error(`Unsupported match round: ${match.round}`);
    }

    return {
      externalId: match.id,
      stage,
      homeTeam: match.home,
      awayTeam: match.away,
      homeScore: match.homeScore ?? null,
      awayScore: match.awayScore ?? null,
      status: match.status,
      kickoffAt: match.kickoffAt,
      winner: match.winner ?? null,
    } satisfies NormalizedMatch;
  });

  return normalizedMatchesSchema.parse(normalized);
}
