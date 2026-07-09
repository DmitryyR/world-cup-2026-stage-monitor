-- Add indexes for common read paths and ordering.
CREATE INDEX "Match_kickoffAt_idx" ON "Match"("kickoffAt");
CREATE INDEX "Match_stage_idx" ON "Match"("stage");
CREATE INDEX "Match_status_idx" ON "Match"("status");
CREATE INDEX "TournamentState_createdAt_idx" ON "TournamentState"("createdAt");
CREATE INDEX "TournamentState_lastCheckedAt_idx" ON "TournamentState"("lastCheckedAt");
CREATE INDEX "AgentRun_startedAt_idx" ON "AgentRun"("startedAt");
CREATE INDEX "AgentRun_status_idx" ON "AgentRun"("status");
