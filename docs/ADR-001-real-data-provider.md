# ADR-001: Real Data Provider Strategy

## Status

Accepted

## Context

Version 1 used `MockProvider` to stabilize the domain logic, checker, monitor loop, database, API routes, UI, tests, and evals. That was intentional: deterministic data made the core tournament rules easier to verify before adding live-provider uncertainty.

Version 2 first moved to a real-data-first architecture with API-Football / API-Sports. API-Football works for historical seasons such as `season=2022`, but its free plan does not allow current `season=2026` access.

For current World Cup 2026 data, the project now uses the free community/open-source `worldcup26.ir` API.

## Decision

Use `worldcup26` as the default provider selected by `DATA_PROVIDER=worldcup26`.

The provider calls:

```text
GET https://worldcup26.ir/get/games
```

No API key is required.

Keep API-Football available for historical provider smoke testing with `season=2022`.

Keep `MockProvider` for tests, evals, offline demos, and deterministic local development.

External API data is not trusted directly. It must flow through:

```text
Provider
-> provider-specific schema validation
-> provider-specific mapping
-> existing normalizer
-> stage detector
-> checker
-> persistence
```

Only checker-approved data is published to the database state read by the UI.

## Consequences

- The UI remains isolated from external APIs and reads accepted internal state.
- Provider failures are logged as failed `AgentRun` records.
- Unknown provider status or round names fail clearly instead of publishing invalid state.
- Mock mode remains useful for local development and stable tests.
- Provider-specific logic stays outside the shared domain checker and stage detector.
- `worldcup26.ir` is not official FIFA data, so checker validation remains mandatory.
