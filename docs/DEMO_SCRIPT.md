# Demo Script

## 1-2 Minute Walkthrough

This is World Cup 2026 Stage Monitor. It shows the current tournament stage, completed and remaining matches, the champion when known, recent results, upcoming matches, knockout progress, and a log of monitoring runs.

The important engineering idea is the pipeline. The Fetcher Agent reads provider data from `worldcup26.ir`, API-Football historical smoke mode, or the mock provider. The Normalizer Agent converts it into a stable internal schema, and the Stage Detector Agent proposes the current tournament state. Those are maker agents.

Before anything is published, the Checker Agent validates the proposal. It rejects impossible states such as a scheduled match with a winner, a finished match without scores, a champion before the final, stage regression, or more than 104 matches.

The monitor loop runs these steps in order and records every run. Successful runs update the public tournament state. Failed provider runs appear in the agent log, but they do not overwrite valid public data.

The current main provider is `DATA_PROVIDER=worldcup26`, which calls `worldcup26.ir/get/games` with no API key. It is a community/open-source provider, not official FIFA data, so every response still passes through normalization and checker validation before publication.

The tests and evals are part of the product. `src/tests/stage-detector.test.ts` and `src/tests/checker.test.ts` protect the core rules. `docs/EVALS.md` lists the scenarios used to review the system.

The UI is intentionally simple: homepage for the current state, matches page for all known matches, bracket page for knockout progress, and agent log page for validation history.
