# Software Design Document

## Architecture

The application uses a small layered design:

- Providers fetch raw tournament data.
- Maker agents transform raw data into proposed domain facts.
- Domain logic detects the tournament state.
- The checker validates proposed state before persistence.
- Persistence stores only valid public state, while every monitoring run is logged.
- API routes expose public state, matches, agent runs, and a manual monitor trigger.
- UI pages read from the API layer and display the latest accepted state.

## Maker / Checker Boundary

Maker responsibilities:

- Fetch source data.
- Normalize provider payloads.
- Propose detected tournament state.

Checker responsibilities:

- Validate normalized matches.
- Validate proposed tournament state.
- Detect stage regression.
- Reject unsafe or inconsistent proposals.

The checker never fetches data and never mutates state directly. Persistence only happens after the checker passes.

## Data Flow

```text
Fetcher Agent
-> Normalizer Agent
-> Stage Detector Agent
-> Checker Agent
-> Persistence
-> AgentRun Log
```

Invalid runs still create an `AgentRun` record, but they do not update the public `Match` or `TournamentState` tables.

## Domain Model

`NormalizedMatch` is the source of truth for match-level facts. `TournamentState` is a derived summary with the current stage, counts, champion, last checked time, and checker status.

`TournamentStage` values are ordered for regression checks:

```text
group_stage < round_of_32 < round_of_16 < quarter_final < semi_final < third_place < final < completed
```

`third_place` is stored for match grouping, but it does not determine the headline stage ahead of the final.

## Provider Strategy

The app now uses a real-data-first provider strategy. `WorldCup26Provider` is the primary free provider for current World Cup 2026 data and reads games from `worldcup26.ir/get/games` without an API key.

`ApiFootballProvider` remains available for historical provider smoke testing, such as `season=2022`, when an API key is available. `MockProvider` remains available for tests, evals, offline demos, and deterministic local development.

Providers implement the same `TournamentDataProvider` interface and return raw provider payloads. Provider response validation and mapping are provider-specific; downstream domain logic remains provider-agnostic.

Unknown provider statuses or rounds fail the monitor run and are logged instead of being published.

## Failure Handling

Checker failures return structured errors. The monitor loop records:

- source provider;
- start and finish timestamps;
- detected stage when available;
- checker result;
- number of detected changes;
- error message.

Only passed runs publish state.

## Testing Strategy

The first protected logic is the domain core:

- `stage-detector.test.ts` covers stage transitions and completed tournament detection.
- `checker.test.ts` covers every rejection rule and one valid completed final.
- `monitor-loop.test.ts` covers valid publication and invalid rejection behavior.

UI is implemented only after the stage detector and checker tests exist.

## Database

Prisma with SQLite stores:

- `Match`
- `TournamentState`
- `AgentRun`

The local database is intended for repeatable MVP demos, not high-volume production use.

For local SQLite portability, `Match.rawPayload` is stored as serialized text. Domain objects and provider payloads remain structured TypeScript values before persistence.
