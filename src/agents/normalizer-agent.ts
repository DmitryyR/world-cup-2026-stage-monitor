import { normalizeProviderPayload } from "@/domain/normalizer";
import type { RawProviderPayload } from "@/domain/types";

export function normalizerAgent(rawPayload: RawProviderPayload) {
  return normalizeProviderPayload(rawPayload);
}
