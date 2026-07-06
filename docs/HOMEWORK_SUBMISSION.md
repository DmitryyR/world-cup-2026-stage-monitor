# Здача домашнього завдання fwdays Academy Agentic Engineering

## Студент

Dmitry Remar

## Проєкт

World Cup 2026 Stage Monitor

## Посилання

- Live demo: https://world-cup-2026-stage-monitor.vercel.app
- GitHub repo: https://github.com/DmitryyR/world-cup-2026-stage-monitor
- Demo video: TODO вставити посилання

## Що було побудовано

Я побудував real-data-first застосунок для моніторингу стану Чемпіонату світу 2026. Застосунок отримує дані про матчі від провайдера, нормалізує їх, визначає поточну стадію турніру, перевіряє запропонований стан через checker, зберігає тільки прийняті дані та показує результат у dashboard.

Основні частини продукту:

- Summary dashboard
- Match Center
- Knockout bracket
- Teams і Team Path
- Agent Log
- Run Monitor action
- Data health diagnostics

## Чому я обрав цей проєкт

Моніторинг турніру добре підходить для демонстрації Agentic Engineering, бо дані можуть бути неповними, затриманими, залежними від часу або представленими у provider-specific форматі. Простий UI, який напряму читає live API, був би крихким. Тому тут потрібен контрольований pipeline, де maker-частина пропонує стан, а checker окремо перевіряє його перед публікацією.

## Як проєкт демонструє Agentic Engineering

У проєкті є maker/checker pipeline:

```text
Fetcher Agent
-> Normalizer Agent
-> Stage Detector Agent
-> Checker Agent
-> Persistence
-> AgentRun Log
```

Maker-частина отримує, мапить і пропонує стан турніру. Checker-частина перевіряє консистентність і може відхилити результат. Monitor loop логує як успішні, так і невдалі запуски. UI читає тільки прийнятий persisted state, а не довіряє live provider response напряму.

## Що вирішував я як human engineer

Я контролював:

- продуктову ідею та scope;
- PRD і acceptance criteria;
- рішення використати maker/checker pipeline;
- рішення тримати provider logic окремо від domain validation;
- правило зберігати тільки accepted state;
- real provider strategy;
- напрям UI та dashboard;
- deployment target: Vercel + Neon Postgres;
- фінальний verification checklist.

## Що було делеговано AI / Codex

Codex допомагав реалізовувати та ітерувати:

- TypeScript domain model;
- Zod schemas;
- provider adapters;
- monitor loop;
- tests і eval coverage;
- Prisma repository та API routes;
- dashboard UI;
- bracket layout;
- Vercel/Neon deployment fixes;
- README і submission documentation.

Усі зміни виконувалися з явними обмеженнями: не bypass-ити checker, не hardcode-ити результати, не міняти provider logic без потреби, і тримати UI на accepted persisted data.

## Agentic practices

- Context engineering через `AGENTS.md`, `PRD.md`, `PRD-v2.md`, `SDD.md`, `EVALS.md` і `DESIGN.md`.
- Loop engineering через ітеративну реалізацію та повторну верифікацію.
- Maker/checker separation між agent pipeline і domain validation.
- Tests before/during feature work.
- Provider abstraction із mock і real provider.
- Real-data provider через `worldcup26.ir`.
- Deployment verification через Vercel і Neon Postgres.
- Custom UX/product review skill `product-ux-roast-review`.
- CodeRabbit review readiness через документацію, PR description, tests і чіткі constraints.

## Фінальний verification checklist

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

## Обмеження

- `worldcup26.ir` є community/open-source provider, не офіційним FIFA API.
- Live provider data може бути затриманою або неповною.
- Monitor execution запускається вручну через UI, а не за розкладом.
- Bracket visual QA можна покращити через automated browser screenshots.
- Raw provider payload зберігається як serialized text для auditability, а не як queryable JSON.
