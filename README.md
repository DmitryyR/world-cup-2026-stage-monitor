# World Cup 2026 Stage Monitor

A small Next.js application that monitors FIFA World Cup 2026 tournament progress, detects the current stage, validates proposed state through a checker, and publishes only accepted tournament data.

The app is intentionally compact. Its main purpose is to demonstrate Agentic Engineering practices: clear context, maker/checker separation, loop engineering, validation, tests, and evals.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Prisma
- PostgreSQL
- Zod
- Vitest

## Agentic Engineering Shape

Maker agents:

- Fetcher Agent reads provider data.
- Normalizer Agent converts provider payloads into the internal schema.
- Stage Detector Agent proposes the current tournament state.

Checker agent:

- Checker Agent validates matches and proposed state.
- Invalid runs are logged but not published.

Monitor loop:

```text
Fetcher Agent
-> Normalizer Agent
-> Stage Detector Agent
-> Checker Agent
-> Persistence
-> AgentRun Log
```

## Setup

```bash
npm install
copy .env.example .env
npm run prisma:migrate
npm run monitor
npm run dev
```

Open `http://localhost:3000`.

Set `DATABASE_URL` to a local or hosted Postgres database before running migrations.

The main free provider for current World Cup 2026 data is `worldcup26`, backed by the community/open-source `worldcup26.ir` API. It does not require an API key.

```env
DATA_PROVIDER=worldcup26
WORLDCUP26_BASE_URL=https://worldcup26.ir
API_REQUEST_TIMEOUT_MS=10000
```

API-Football remains available for historical provider smoke testing, for example `season=2022`, if you have an API key.

For deterministic offline development, use:

```env
DATA_PROVIDER=mock
```

The production database is PostgreSQL. Local development should use the same Postgres-backed Prisma schema.

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

## Vercel Deployment

This project is ready to deploy from GitHub to Vercel with a production PostgreSQL database.

### GitHub

1. Commit the project, including `prisma/schema.prisma`, `prisma/migrations/**`, `package.json`, `package-lock.json`, and this README.
2. Push the branch to GitHub.

### Vercel Import

1. In Vercel, create a new project from the GitHub repository.
2. Keep the framework preset as Next.js.
3. Set the build command to:

```bash
npm run vercel-build
```

4. Add a Postgres database from the Vercel Marketplace or attach an existing Postgres provider.
5. Ensure the database integration exposes a production `DATABASE_URL` and a direct/unpooled migration URL as `DIRECT_URL`. With Neon, use the pooled/runtime connection for `DATABASE_URL` and the unpooled/non-pooling connection string for `DIRECT_URL`.
6. Add the environment variables below.
7. Deploy.

### Vercel Environment Variables

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?sslmode=require"
DIRECT_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?sslmode=require"
DATA_PROVIDER="worldcup26"
WORLDCUP26_BASE_URL="https://worldcup26.ir"
API_REQUEST_TIMEOUT_MS="10000"
```

`DATABASE_URL` is the runtime database URL used by the application. `DIRECT_URL` is the direct/unpooled database URL used by Prisma migrations during `npm run vercel-build`.

For Neon/Vercel, set `DIRECT_URL` from the unpooled/non-pooling connection string. The build script checks these variables for migration connectivity in order:

```text
DIRECT_URL
DATABASE_URL_UNPOOLED
DATABASE_POSTGRES_URL_NON_POOLING
POSTGRES_URL_NON_POOLING
DATABASE_POSTGRES_URL
POSTGRES_URL
```

If `DIRECT_URL` is not explicitly set, the wrapper will use the first available value from that list. Setting `DIRECT_URL` directly is the clearest option and avoids Prisma `P1002` timeouts when `DATABASE_URL` points at a pooled Neon endpoint.

### First Production Run

After the first deploy, open the production site and click **Run Monitor**. That calls the existing monitor route, fetches `worldcup26` data, validates it through the checker, persists accepted `Match`, `TournamentState`, and `AgentRun` rows, and populates the dashboard.

## API Routes

- `GET /api/tournament-state`
- `GET /api/matches`
- `GET /api/agent-runs`
- `POST /api/monitor/run`

## Pages

- `/` tournament summary, latest results, upcoming matches
- `/matches` accepted match table
- `/bracket` knockout rounds
- `/agent-log` monitor runs and checker results

## Project Structure

```text
docs/
prisma/
src/app/
src/agents/
src/components/
src/data/
src/domain/
src/lib/
src/providers/
src/scripts/
src/tests/
```

## Verification

The domain logic is protected before UI work:

- `src/tests/stage-detector.test.ts`
- `src/tests/checker.test.ts`
- `src/tests/monitor-loop.test.ts`

Run:

```bash
npm run test
```

## Documentation

- `docs/PRD.md`
- `docs/PRD-v2.md`
- `docs/SDD.md`
- `docs/AGENTS.md`
- `docs/EVALS.md`
- `docs/DEMO_SCRIPT.md`
- `docs/ADR-001-real-data-provider.md`

Note: `rawPayload` remains serialized text for portability and auditability. Runtime tournament data is persisted in Postgres for production deployments.
