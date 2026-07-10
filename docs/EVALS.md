# Evals

These eval scenarios protect the domain contract, provider behavior, UI quality, and reviewer-facing Agentic Engineering requirements.

## Verification Commands

Run before submission and after meaningful changes:

```bash
npm run test
npm run typecheck
npm run lint
npm run build
```

## Required Eval Cases

| ID | Scenario | Expected Result |
| --- | --- | --- |
| E01 | Group stage still active | Detector returns `group_stage`; checker passes valid matches. |
| E02 | Transition to Round of 32 | Detector returns `round_of_32` when Round of 32 has scheduled or live matches. |
| E03 | Transition to Round of 16 | Detector returns `round_of_16` when Round of 16 has scheduled or live matches. |
| E04 | Final scheduled | Detector returns `final`; champion remains null. |
| E05 | Final finished and champion detected | Detector returns `completed`; champion equals final winner. |
| E06 | Invalid champion before final | Checker rejects proposed state. |
| E07 | Scheduled match with winner | Checker rejects proposed matches. |
| E08 | Finished match without score | Checker rejects proposed matches. |
| E09 | Stage regression | Checker rejects when proposed stage is earlier than persisted stage. |
| E10 | More than 104 matches | Checker rejects proposed matches. |
| E11 | API-Football missing API key | Monitor run fails clearly and public state is unchanged. |
| E12 | API-Football unknown round | Monitor run fails clearly and public state is unchanged. |
| E13 | API-Football scheduled status | Mapper produces scheduled match without fake score or winner. |
| E14 | API-Football finished status | Mapper produces finished match with scores and winner when provider winner is confirmed. |
| E15 | WorldCup26 scheduled match | Mapper produces scheduled match without fake score or winner. |
| E16 | WorldCup26 live match | Mapper produces live match with scores when present and no winner. |
| E17 | WorldCup26 finished match | Mapper produces finished match with scores and derived winner when not drawn. |
| E18 | WorldCup26 empty response | Monitor run fails and existing public matches/state remain unchanged. |
| E19 | WorldCup26 unknown stage/status | Monitor run fails clearly and public state is unchanged. |
| E20 | Full future knockout schedule exists | Detector returns the earliest unresolved stage, not the latest future fixture. |
| E21 | Finished tied knockout with penalties | Bracket/result formatting shows penalty winner and method. |
| E22 | Future placeholder participants | UI shows `Winner of Team A vs Team B` or `TBD`, never raw provider tokens. |
| E23 | Bracket coordinate layout | Left/right halves feed into center Final; semifinal losers feed Bronze Final. |
| E24 | WorldCup26 timezone-less kickoff | Mapper assumes the documented source timezone, stores UTC, displays Europe/Kyiv time, and logs a provider warning. |
| E25 | Penalty shootout score pipeline | Provider penalty fields are preserved through normalization/persistence and displayed as `1 (3 pens) - 1 (4 pens)`. |
| E26 | Missing tied-knockout decision method | Data Health warns when a finished tied knockout has a winner but no penalties, extra-time, walkover, or explicit method. |

## Business Rules Checked

- Scheduled matches cannot have winners.
- Live matches cannot have final winners.
- Finished matches require scores.
- Winner must be one of the match participants.
- Champion cannot exist before the final is finished.
- Finished final must produce champion.
- Tournament cannot exceed 104 matches.
- Current stage cannot regress from persisted accepted state.
- Final finished with winner means tournament is completed.
- Full future schedules must not advance current stage past the earliest unresolved stage.
- Finished tied knockout matches need a clear decision method: penalties, extra time, walkover, or a Data Health warning.
- Penalty shootout scores must remain distinct from regular score.

## Provider / Checker Expectations

- Providers are untrusted inputs.
- Provider mapping belongs in `src/providers`.
- Normalized matches must pass schemas before stage detection.
- Checker rejects unsafe proposed state.
- Failed runs are logged in Agent Log.
- Failed runs do not publish matches or tournament state.
- Real-provider tests should use fixtures or mocked fetch, not live network calls.
- Provider kickoff times without explicit offsets must be converted through a named source timezone and surfaced as warnings.
- Provider penalty evidence must not be dropped during mapping, normalization, persistence, or repository reads.

## UI / Product Quality Checks

- Summary explains current tournament state quickly.
- Matches page supports filters, search, and empty states.
- Bracket uses readable labels, status badges, scores, and win methods.
- Penalty shootout results show the regular score plus penalty score, for example `1 (3 pens) - 1 (4 pens)`.
- Teams page allows selecting a team path.
- Agent Log keeps successful and failed monitor runs visible.
- Data Health is compact in product views and detailed in admin context.
- User-facing timestamps use Europe/Kyiv formatting.
- UI does not expose raw backend tokens such as `WO`, `LO`, `WM`, or `LM`.

## Manual Verification Checklist

- Open live demo.
- Click **Run Monitor**.
- Confirm run feedback is visible.
- Confirm Agent Log receives the new run.
- Confirm Summary reads accepted persisted state.
- Confirm Matches filters and team search work.
- Confirm Bracket is horizontally scrollable and readable.
- Confirm Team Path can select a team.
- Confirm no secrets appear in docs or UI.
- Run all verification commands locally before submission.
