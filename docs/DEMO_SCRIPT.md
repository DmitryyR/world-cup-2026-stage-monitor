# Demo Script

## 1-2 Minute Video Walkthrough

Hi, my name is Dmitry Remar. This is **World Cup 2026 Stage Monitor**, my fwdays Academy Agentic Engineering homework project.

The app monitors World Cup 2026 tournament state from real provider data. It detects the current stage, validates the result through a checker, persists only accepted data, and shows the result in a dashboard.

First, on the **Summary** page, I can see tournament progress, current stage, live match status, next match, latest results, upcoming matches, and compact data health.

Next, the **Matches** page shows accepted matches from the database. It includes filters for live, today, finished, scheduled, current stage, and a team search.

The **Bracket** page shows the knockout tree. It uses normalized match data, readable team labels, status badges, scores, and win methods like penalties or regular-time wins.

The **Agent Log** shows monitor runs. This is important because failed provider or checker runs are logged, but they do not overwrite the last accepted public state.

If I click **Run Monitor**, the app runs the pipeline: Fetcher Agent, Normalizer Agent, Stage Detector Agent, Checker Agent, and then persistence only if the checker passes.

From an Agentic Engineering perspective, the key idea is maker/checker separation. Maker agents propose data and state. The checker validates business rules such as scheduled matches not having winners, finished matches requiring scores, no champion before the final, and no stage regression.

The project also includes context documents like PRD, SDD, AGENTS, EVALS, and DESIGN. Verification is done with `npm run test`, `npm run typecheck`, `npm run lint`, and `npm run build`.

One more part of the process is iterative product review. After UI updates, I run the live site through a custom Codex skill called `product-ux-roast-review`. It reviews functionality, UI/UX, accessibility, responsiveness, and product readiness, then produces concrete issues with severity and recommendations. I use that review to turn feedback into the next implementation tasks instead of guessing what to improve.

The app is deployed on Vercel with Neon Postgres and is available at:

https://world-cup-2026-stage-monitor.vercel.app

That is the final demo of World Cup 2026 Stage Monitor.
