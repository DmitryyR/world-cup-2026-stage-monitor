# Agent Guide

## Project Goal

Build a small World Cup 2026 monitoring app that demonstrates disciplined Agentic Engineering: clear roles, repeatable loops, maker/checker separation, validation, tests, evals, and deployment readiness.

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
- Keep provider-specific mapping inside `src/providers`.

Forbidden:

- It must not decide if proposed state is safe to publish.
- It must not persist data.
- It must not weaken shared checker rules for one provider.

### Stage Detector Agent

Responsibilities:

- Calculate a proposed `TournamentState` from normalized matches.
- Use the stage detection rules in `docs/PRD.md`.
- Determine current stage from the earliest unresolved scheduled/live stage.
- Detect completed tournament when the final is finished with a winner.

Forbidden:

- It must not validate match consistency beyond what is needed for stage detection.
- It must not persist state.
- It must not hardcode current stage.

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
- Preserve the last accepted public state when a run fails.

Forbidden:

- It must not bypass checker validation.
- It must not publish failed runs.
- It must not call UI code.

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

## Provider Rules

- Real providers are untrusted inputs.
- Provider adapters must validate raw response shape.
- Provider-specific mapping belongs in `src/providers`.
- `MockProvider` remains available for deterministic demos and tests.
- The UI must not call external sports APIs directly.
- The monitor loop is the only path that should publish real provider data.

## UI Rules

- UI reads accepted database/repository/API route data.
- UI must not bypass checker or read live provider data directly.
- User-facing labels must not show raw backend tokens such as `WO`, `LO`, `WM`, or `LM`.
- User-facing timestamps must be formatted in Europe/Kyiv time.
- Data Health should be compact in product views and detailed in admin/Agent Log context.
- Bracket layout may transform presentation, but not winner or dependency logic.

## What Not To Rewrite Without A Specific Request

- Provider factory and provider contracts.
- Checker rules.
- Stage detector rules.
- Monitor loop sequencing.
- Prisma schema.
- Repository interface.
- Existing passing tests.
- Accepted real-data flow.

## Coding Conventions

- Keep maker and checker modules separate.
- Keep domain logic pure where practical.
- Use Zod for runtime validation.
- Add tests before changing core tournament rules.
- Prefer small functions with explicit inputs and outputs.
- UI must not be created before stage detector and checker tests exist.
- Provider-specific mapping belongs in `src/providers`, not in shared checker logic.

## Verification Expectations

Run before submission and after meaningful changes:

```bash
npm run test
npm run typecheck
npm run lint
npm run build
```

Expected result: all commands pass.
