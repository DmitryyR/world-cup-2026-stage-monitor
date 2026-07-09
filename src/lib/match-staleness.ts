import type { NormalizedMatch } from "@/domain/types";

export const STALE_MATCH_GRACE_HOURS = 4;

export function isFutureScheduledMatch(match: NormalizedMatch, now = new Date()): boolean {
  if (match.status !== "scheduled") {
    return false;
  }

  const kickoffAt = new Date(match.kickoffAt).getTime();
  const nowAt = now.getTime();

  return Number.isFinite(kickoffAt) && Number.isFinite(nowAt) && kickoffAt >= nowAt;
}

export function isStaleScheduledMatch(match: NormalizedMatch, now = new Date()): boolean {
  if (match.status !== "scheduled") {
    return false;
  }

  const kickoffAt = new Date(match.kickoffAt).getTime();
  const nowAt = now.getTime();

  if (!Number.isFinite(kickoffAt) || !Number.isFinite(nowAt)) {
    return false;
  }

  return nowAt - kickoffAt > STALE_MATCH_GRACE_HOURS * 60 * 60 * 1000;
}
