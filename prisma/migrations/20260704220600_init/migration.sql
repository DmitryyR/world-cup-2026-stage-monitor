-- CreateTable
CREATE TABLE "Match" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "externalId" TEXT NOT NULL,
    "stage" TEXT NOT NULL,
    "homeTeam" TEXT NOT NULL,
    "awayTeam" TEXT NOT NULL,
    "homeScore" INTEGER,
    "awayScore" INTEGER,
    "status" TEXT NOT NULL,
    "kickoffAt" DATETIME NOT NULL,
    "winner" TEXT,
    "rawPayload" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "TournamentState" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "currentStage" TEXT NOT NULL,
    "completedMatches" INTEGER NOT NULL,
    "remainingMatches" INTEGER NOT NULL,
    "champion" TEXT,
    "lastCheckedAt" DATETIME NOT NULL,
    "checkerStatus" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "AgentRun" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "source" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "startedAt" DATETIME NOT NULL,
    "finishedAt" DATETIME,
    "changesDetected" INTEGER NOT NULL,
    "checkerResult" TEXT NOT NULL,
    "detectedStage" TEXT,
    "errorMessage" TEXT
);

-- CreateIndex
CREATE UNIQUE INDEX "Match_externalId_key" ON "Match"("externalId");
