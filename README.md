# World Cup 2026 Stage Monitor

A small Next.js application that monitors FIFA World Cup 2026 tournament progress, detects the current stage, validates proposed state through a checker, and publishes only accepted tournament data.

The app is intentionally compact. Its main purpose is to demonstrate Agentic Engineering practices: clear context, maker/checker separation, loop engineering, validation, tests, and evals.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Prisma
- SQLite
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

The mock provider works without external API keys. The local SQLite database lives at `prisma/dev.db` when `DATABASE_URL="file:./dev.db"`.

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
- `docs/SDD.md`
- `docs/AGENTS.md`
- `docs/EVALS.md`
- `docs/DEMO_SCRIPT.md`

Note: the PRD model includes `rawPayload Json?`, but this local SQLite MVP stores raw provider payloads as serialized text in Prisma for smoother local portability.
