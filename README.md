# World Cup 2026 Stage Monitor

World Cup 2026 Stage Monitor is a Next.js application that monitors FIFA World Cup 2026 tournament progress, detects the current stage, validates proposed state through a checker, and publishes only accepted tournament data.

This repository was prepared as a greenfield homework submission for **fwdays Academy Agentic Engineering**. The project demonstrates context engineering, maker/checker separation, loop engineering, real-data provider abstraction, verification, and deployment readiness.

## Live Demo

- Live demo: https://world-cup-2026-stage-monitor.vercel.app
- GitHub repo: https://github.com/DmitryyR/world-cup-2026-stage-monitor

## Problem / Goal

Tournament data from external providers can be incomplete, delayed, inconsistent, or represented with provider-specific labels. The goal is to build a small monitoring system that:

- fetches World Cup 2026 match data from a real provider;
- normalizes it into a stable internal model;
- detects the current tournament stage;
- validates proposed state before publication;
- persists only checker-approved data;
- exposes a dashboard, match center, bracket, team paths, and agent logs.

## Features

- Summary dashboard with tournament progress, current stage, live match, next match, and compact data health.
- Match Center with search, filters, status badges, Kyiv time formatting, and accepted persisted matches.
- Coordinate-based knockout bracket board with internal scale controls and horizontal scrolling.
- Teams page with team search and selectable Team Path.
- Agent Log with monitor run history and checker outcomes.
- Run Monitor action that executes the maker/checker loop and refreshes accepted data.
- Real-data-first provider strategy using `worldcup26.ir`, plus mock mode for deterministic local demos.
- PostgreSQL persistence through Prisma, deployed on Vercel with Neon Postgres.

## Architecture

```text
Fetcher Agent
-> Normalizer Agent
-> Stage Detector Agent
-> Checker Agent
-> Persistence
-> AgentRun Log
-> UI reads accepted database state
```

The UI does not call external sports APIs directly. It reads accepted state from the database/repository/API routes. Provider-specific parsing stays in `src/providers`; shared validation stays in `src/domain`.

## Agentic Engineering Practices

### Context Engineering

Project context is captured in:

- `docs/PRD.md`
- `docs/PRD-v2.md`
- `docs/SDD.md`
- `docs/AGENTS.md`
- `docs/EVALS.md`
- `docs/DESIGN.md`
- `docs/ADR-001-real-data-provider.md`

These docs guided implementation, review, provider migration, UI iteration, and deployment decisions.

### Maker / Checker Separation

Maker responsibilities:

- fetch provider payloads;
- normalize data;
- propose tournament stage.

Checker responsibilities:

- reject inconsistent match data;
- reject unsafe tournament state;
- prevent invalid runs from being published.

The monitor loop persists data only after checker approval.

### Loop Engineering

The project was built iteratively:

- domain model and tests first;
- mock provider MVP;
- real provider abstraction;
- checker-protected monitor loop;
- persisted state and Agent Log;
- Vercel/Postgres deployment;
- UI and accessibility refinements;
- bracket and team path improvements.

### Verification

Core rules are covered by Vitest tests:

- stage detector behavior;
- checker rejection rules;
- provider mapping;
- monitor loop persistence;
- bracket layout and formatting helpers;
- date formatting and match filters.

Run the full verification set:

```bash
npm run test
npm run typecheck
npm run lint
npm run build
```

### Reusable Review Skill

The repository includes a reusable Codex skill for product and UX review:

- `skills/product-ux-roast-review/SKILL.md`

Example invocation:

```text
Use $product-ux-roast-review to audit this web app: https://world-cup-2026-stage-monitor.vercel.app/
```

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Prisma
- PostgreSQL
- Zod
- Vitest
- Vercel
- Neon Postgres

## Local Setup

```bash
npm install
copy .env.example .env
npm run prisma:migrate
npm run monitor
npm run dev
```

Open `http://localhost:3000`.

The production database is PostgreSQL. Local development should use the same Postgres-backed Prisma schema.

## Environment Variables

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?sslmode=require"
DIRECT_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?sslmode=require"
DATA_PROVIDER="worldcup26"
WORLDCUP26_BASE_URL="https://worldcup26.ir"
API_REQUEST_TIMEOUT_MS="10000"
```

- `DATABASE_URL`: runtime database URL used by the application.
- `DIRECT_URL`: direct/unpooled database URL used by Prisma migrations.
- `DATA_PROVIDER`: `worldcup26` for real data, or `mock` for deterministic local demos.
- `WORLDCUP26_BASE_URL`: community/open-source World Cup 2026 provider base URL.
- `API_REQUEST_TIMEOUT_MS`: provider request timeout.

No secrets are committed. `.env.local` and database files are ignored.

## Commands

```bash
npm run dev
npm run test
npm run lint
npm run typecheck
npm run build
npm run prisma:migrate
npm run prisma:studio
npm run monitor
```

## Deployment

The app is deployed on Vercel with Neon Postgres.

### Vercel Build Command

```bash
npm run vercel-build
```

### Required Vercel Variables

```env
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."
DATA_PROVIDER="worldcup26"
WORLDCUP26_BASE_URL="https://worldcup26.ir"
API_REQUEST_TIMEOUT_MS="10000"
```

For Neon, `DIRECT_URL` should be the direct/unpooled/non-pooling connection string. This prevents Prisma migration timeout `P1002` during `prisma migrate deploy`.

After the first production deploy, open the site and click **Run Monitor** to fetch real provider data, validate it, persist accepted rows, and populate the dashboard.

## Pages

- `/` summary dashboard
- `/matches` match center
- `/bracket` knockout bracket
- `/teams` team paths
- `/agent-log` monitor runs and checker results

## Known Limitations

- `worldcup26.ir` is a community/open-source provider, not official FIFA data.
- Live data can be delayed or incomplete before/after matches.
- The bracket board is coordinate-based and horizontally scrollable; visual QA may still be improved with browser screenshot testing.
- `rawPayload` remains serialized text for portability and auditability.
- Runtime monitor execution is manual through **Run Monitor**, not scheduled automatically.

## Demo Video Script

The 1-2 minute demo script is in `docs/DEMO_SCRIPT.md`.

## Homework Submission Notes

See `docs/HOMEWORK_SUBMISSION.md` for the fwdays Academy Agentic Engineering submission summary and final checklist.
