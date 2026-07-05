# Homework Submission PR

## Name

Dmitry Remar

## Demo

- Demo video: TODO paste link
- Live demo: https://world-cup-2026-stage-monitor.vercel.app
- GitHub repo: https://github.com/DmitryyR/world-cup-2026-stage-monitor

## Project Summary

World Cup 2026 Stage Monitor is a real-data-first tournament monitoring app. It fetches World Cup 2026 match data, normalizes provider payloads, detects the current stage, validates proposed state through a checker, persists only accepted data, and exposes the result through a dashboard, match center, bracket, teams view, and agent log.

## Agentic Practices Used

- Context engineering with PRD, SDD, AGENTS, EVALS, DESIGN, and ADR docs.
- Maker/checker separation between fetching/normalizing/stage detection and validation.
- Monitor loop that logs failed and successful runs.
- Provider abstraction with mock and real provider support.
- Real provider integration using `worldcup26.ir`.
- Tests and verification for detector, checker, providers, monitor loop, UI helpers, and bracket layout.
- Deployment verification on Vercel with Neon Postgres.

## What I Controlled As The Human Engineer

- Product goal and scope.
- Architecture constraints.
- Acceptance criteria.
- Provider strategy.
- UI review direction.
- Deployment target.
- Verification requirements.
- Final submission packaging.

## What Codex / AI Helped Implement

- Domain model and schemas.
- Provider adapters and mappers.
- Stage detector and checker tests.
- Monitor loop and persistence flow.
- API routes and repository layer.
- Dashboard, matches, bracket, teams, and agent log UI.
- Vercel/Neon deployment fixes.
- Documentation and PR summary.

## Verification Evidence

Final commands:

```bash
npm run test
npm run typecheck
npm run lint
npm run build
```

Expected result: all commands pass.

## Known Limitations

- `worldcup26.ir` is not official FIFA data.
- Live provider data may be delayed or incomplete.
- Run Monitor is manual, not scheduled.
- Bracket visual QA could be improved with screenshot automation.
- Raw provider payload is serialized text for portability.

## Screenshots

TODO add screenshots if required:

- Summary dashboard
- Match Center
- Bracket
- Agent Log
