# World Cup 2026 Stage Monitor PRD v2

## Summary

PRD v2 moves the project from a mock-based MVP to a real-data-first architecture using API-Football / API-Sports as the primary live provider.

The v1 architecture remains the baseline: provider data flows through normalization, stage detection, checker validation, persistence, and then UI rendering. The UI must not call API-Football directly.

## Goals

- Use API-Football as the default provider.
- Keep `MockProvider` for tests, evals, offline demos, and deterministic development.
- Preserve maker/checker separation.
- Treat external API data as untrusted until normalized and checked.
- Keep existing domain logic, checker rules, monitor-loop sequencing, repository interface, API route shape, and UI pages.

## Provider Strategy

Primary provider:

- Name: `api-football`
- Base URL: `https://v3.football.api-sports.io`
- Endpoint: `/fixtures`
- Query params: `league=1`, `season=2026`
- API key header: `x-apisports-key`

Fallback provider:

- Name: `mock`
- Reads local sample data from `src/data/worldcup-2026-sample.json`.

## Environment

```env
DATA_PROVIDER=api-football
API_FOOTBALL_KEY=your_api_key_here
API_FOOTBALL_BASE_URL=https://v3.football.api-sports.io
API_FOOTBALL_LEAGUE_ID=1
API_FOOTBALL_SEASON=2026
API_REQUEST_TIMEOUT_MS=10000
```

Offline mode:

```env
DATA_PROVIDER=mock
```

## Data Flow

```text
External API
-> Provider
-> Normalizer
-> Stage Detector
-> Checker
-> Database
-> UI
```

## Validation Requirements

- API-Football responses are validated with provider-specific Zod schemas.
- Provider-specific mapping converts fixtures to the existing internal raw payload shape.
- The existing `NormalizedMatch` schema remains strict.
- Unknown API status or round values must fail the monitor run clearly.
- Failed provider runs must not update public tournament state.

## Status Mapping

Scheduled:

- `TBD`
- `NS`
- `PST`
- `CANC`
- `ABD`
- `AWD`
- `WO`

Live:

- `1H`
- `HT`
- `2H`
- `ET`
- `BT`
- `P`
- `SUSP`
- `INT`
- `LIVE`

Finished:

- `FT`
- `AET`
- `PEN`

Cancelled, postponed, abandoned, awarded, and walkover statuses are conservatively mapped to `scheduled` so they do not create fake winners or fake scores.

## Acceptance Criteria

- `DATA_PROVIDER=api-football` uses API-Football fixtures.
- Missing API key fails safely with a clear error.
- `DATA_PROVIDER=mock` continues to work.
- Existing stage detector, checker, monitor loop, API routes, and UI still work.
- Tests do not call the live API.
- Failed provider runs are logged in `AgentRun`.
