# World Cup 2026 Stage Monitor PRD

## Product Summary

World Cup 2026 Stage Monitor is a small web application that monitors the current state of the FIFA World Cup 2026 tournament. It determines the current tournament stage, shows recent results, upcoming matches, knockout progress, and keeps updating until the final winner is known.

The product is intentionally small. Its primary engineering goal is to demonstrate clear context, explicit specifications, maker/checker separation, repeatable monitoring loops, validation, tests, and evals.

## Goals

- Show the current FIFA World Cup 2026 stage.
- Show matches, results, upcoming games, and knockout progress.
- Normalize provider data into a stable internal schema.
- Detect tournament state from normalized matches.
- Run checker validation before publishing updates.
- Store monitoring runs and detected changes.
- Include tests and evals for critical business logic.
- Document the agentic engineering process.

## Non-Goals

- Betting odds or predictions.
- User accounts, authentication, comments, or payments.
- News feeds or sports portal features.
- Scraping unofficial websites as the main architecture.
- Real-time minute-by-minute match events.
- Complex admin tools or bracket editing.

## Users

The primary user is a football fan who wants to quickly understand the current World Cup stage. The secondary user is a course reviewer who evaluates whether the project demonstrates structured Agentic Engineering practices.

## User Stories

### Current Tournament State

As a user, I want to open the homepage and immediately see the current tournament stage, so that I understand where the World Cup currently stands.

Acceptance criteria:

- Homepage shows `currentStage`.
- Homepage shows total completed matches.
- Homepage shows total remaining matches.
- Homepage shows champion when completed.
- Homepage shows last check timestamp.

### Match List

As a user, I want to see all known matches with status and score, so that I can review tournament progress.

Acceptance criteria:

- `/matches` shows a table of matches.
- Each match has date, stage, teams, score, status, and winner.
- Scheduled matches do not show fake scores.
- Finished matches show scores.

### Knockout Progress

As a user, I want to see knockout progress, so that I understand which teams are still in the tournament.

Acceptance criteria:

- `/bracket` groups knockout matches by round.
- Finished matches show winners.
- Scheduled matches show placeholders.

### Agent Log

As a reviewer, I want to see how the system monitors and validates tournament data, so that I can verify the agentic engineering approach.

Acceptance criteria:

- `/agent-log` shows monitoring runs.
- Failed checker runs are logged.
- Failed checker runs do not publish invalid tournament state.

## Functional Requirements

The application must support a `MockProvider` that works without external API keys. Provider selection must be configurable with `DATA_PROVIDER=mock`.

All providers normalize into this internal schema:

```ts
export type MatchStatus = "scheduled" | "live" | "finished";

export type TournamentStage =
  | "group_stage"
  | "round_of_32"
  | "round_of_16"
  | "quarter_final"
  | "semi_final"
  | "third_place"
  | "final"
  | "completed";

export type NormalizedMatch = {
  externalId: string;
  stage: TournamentStage;
  homeTeam: string;
  awayTeam: string;
  homeScore: number | null;
  awayScore: number | null;
  status: MatchStatus;
  kickoffAt: string;
  winner: string | null;
};
```

The system calculates:

```ts
export type TournamentState = {
  currentStage: TournamentStage;
  completedMatches: number;
  remainingMatches: number;
  champion: string | null;
  lastCheckedAt: string;
  checkerStatus: "passed" | "failed";
};
```

## Stage Detection Rules

1. If the final is finished and has a winner, the tournament state is `completed`.
2. If the final exists and is scheduled, live, or finished without a confirmed champion, the current stage is `final`.
3. If any semi-final match is scheduled or live, the current stage is `semi_final`.
4. If any quarter-final match is scheduled or live, the current stage is `quarter_final`.
5. If any Round of 16 match is scheduled or live, the current stage is `round_of_16`.
6. If any Round of 32 match is scheduled or live, the current stage is `round_of_32`.
7. If any group stage match is scheduled or live, the current stage is `group_stage`.
8. The system must not regress to an earlier stage after a later stage has already been persisted.

## Checker Rules

The checker rejects proposed data when:

- A finished match has no score.
- A scheduled match has a winner.
- A live match has a final winner.
- The champion is set before the final is finished.
- The tournament has more than 104 matches.
- The current stage regresses from a later stage to an earlier stage.
- A match has the same home and away team.
- A winner is not one of the two match participants.
- The final is finished but champion is null.

## API Routes

- `GET /api/tournament-state`
- `GET /api/matches`
- `GET /api/agent-runs`
- `POST /api/monitor/run`

## Completion Criteria

- The app runs locally.
- Mock provider works without external API keys.
- Stage detector and checker tests pass.
- Monitor loop tests pass.
- Checker rejects invalid states before publication.
- Required docs exist: `AGENTS.md`, `SDD.md`, `EVALS.md`, and `DEMO_SCRIPT.md`.
