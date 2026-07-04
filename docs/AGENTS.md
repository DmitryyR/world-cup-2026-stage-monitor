# Agent Guide

## Project Goal

Build a small World Cup 2026 monitoring app that demonstrates disciplined Agentic Engineering: clear roles, repeatable loops, maker/checker separation, validation, tests, and evals.

## Agent Roles

### Fetcher Agent

Responsibilities:

- Select the configured provider.
- Fetch raw tournament data.
- Return source metadata.
- Fail clearly when a real provider is misconfigured or unavailable.

Forbidden:

- It must not normalize data.
- It must not decide tournament state.
- It must not approve or persist data.

### Normalizer Agent

Responsibilities:

- Convert raw provider payloads into `NormalizedMatch`.
- Use Zod schemas to validate normalized shape.
- Preserve provider identifiers through `externalId`.

Forbidden:

- It must not decide if proposed state is safe to publish.
- It must not persist data.

### Stage Detector Agent

Responsibilities:

- Calculate a proposed `TournamentState` from normalized matches.
- Use the stage detection rules in `docs/PRD.md`.
- Respect persisted stage when checking for possible regression.

Forbidden:

- It must not validate match consistency beyond what is needed for stage detection.
- It must not persist state.

### Checker Agent

Responsibilities:

- Validate normalized matches and proposed state.
- Reject unsafe or inconsistent data.
- Return structured error messages.

Forbidden:

- It must not fetch data.
- It must not generate proposed state.
- It must not silently repair invalid maker output.

### Monitor Loop

Responsibilities:

- Run the full pipeline in order.
- Persist only checker-approved data.
- Log both successful and failed runs.

Forbidden:

- It must not bypass checker validation.
- It must not publish failed runs.

## Validation Rules

The checker must reject:

- finished match without score;
- scheduled match with winner;
- live match with winner;
- champion before final is finished;
- more than 104 matches;
- stage regression;
- same team as home and away;
- winner outside match participants;
- finished final without champion.

## Coding Conventions

- Keep maker and checker modules separate.
- Keep domain logic pure where practical.
- Use Zod for runtime validation.
- Add tests before changing core tournament rules.
- Prefer small functions with explicit inputs and outputs.
- UI must not be created before stage detector and checker tests exist.
- UI must not call external sports APIs directly.
- Provider-specific mapping belongs in `src/providers`, not in shared checker logic.
