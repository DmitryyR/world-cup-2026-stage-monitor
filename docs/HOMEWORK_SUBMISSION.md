# fwdays Academy Agentic Engineering Homework Submission

## Student

Dmitry Remar

## Project

World Cup 2026 Stage Monitor

## Links

- Live demo: https://world-cup-2026-stage-monitor.vercel.app
- GitHub repo: https://github.com/DmitryyR/world-cup-2026-stage-monitor
- Demo video: TODO paste link

## What Was Built

A real-data-first tournament monitoring app for FIFA World Cup 2026. The app fetches provider match data, normalizes it, detects the current tournament stage, validates the proposed state through a checker, persists only accepted data, and presents the result in a dashboard UI.

Main product surfaces:

- Summary dashboard
- Match Center
- Coordinate-based knockout bracket
- Teams and Team Path
- Agent Log
- Run Monitor action
- Data health diagnostics

## Why This Project Was Chosen

Tournament monitoring is a good Agentic Engineering homework problem because the data can be messy, time-dependent, and externally sourced. A simple direct-fetch UI would be fragile. This project needs a disciplined pipeline where maker agents propose state and a checker validates it before publication.

## How It Demonstrates Agentic Engineering

The project uses a maker/checker pipeline:

```text
Fetcher Agent
-> Normalizer Agent
-> Stage Detector Agent
-> Checker Agent
-> Persistence
-> AgentRun Log
```

The maker side fetches, maps, and proposes. The checker side validates and can reject. The monitor loop logs both success and failure. The UI reads accepted persisted state instead of trusting live provider responses directly.

## Human Decisions

As the human engineer, I controlled:

- product scope and the PRD;
- decision to use a maker/checker pipeline;
- decision to keep provider logic separate from domain validation;
- decision to persist only accepted state;
- selection of the real provider strategy;
- UI acceptance criteria and dashboard direction;
- deployment target: Vercel with Neon Postgres;
- final verification checklist.

## What Was Delegated To AI / Codex

Codex helped implement and iterate on:

- TypeScript domain model;
- Zod schemas;
- provider adapters;
- monitor loop;
- tests and eval coverage;
- Prisma repository and API routes;
- dashboard UI;
- bracket layout;
- Vercel/Neon deployment fixes;
- README and submission documentation.

All changes were guided by explicit constraints such as not bypassing the checker, not hardcoding results, and keeping UI reads on accepted persisted data.

## Agentic Practices Used

- Context engineering through `AGENTS.md`, `PRD.md`, `PRD-v2.md`, `SDD.md`, `EVALS.md`, and `DESIGN.md`.
- Loop engineering through iterative implementation and repeated verification.
- Maker/checker separation across agents and domain logic.
- Tests before and during feature work.
- Provider abstraction with mock and real providers.
- Real-data provider through `worldcup26.ir`.
- Deployment verification with Vercel and Neon Postgres.
- CodeRabbit review readiness through focused docs, PR description, tests, and clear constraints.

## Final Verification Checklist

- [x] `npm run test`
- [x] `npm run typecheck`
- [x] `npm run lint`
- [x] `npm run build`
- [x] Live demo deployed
- [x] Postgres production persistence configured
- [x] Real provider mode documented
- [x] Mock provider mode preserved
- [x] Maker/checker separation documented
- [x] Agent Log preserved
- [x] Run Monitor preserved
- [x] No secrets committed

## Remaining Limitations

- `worldcup26.ir` is a community/open-source provider, not official FIFA data.
- Live provider data may be delayed or incomplete.
- Monitor execution is manual through the UI, not scheduled.
- Bracket visual QA could be improved with automated browser screenshots.
- Raw provider payload is stored as serialized text for auditability, not as queryable JSON.
