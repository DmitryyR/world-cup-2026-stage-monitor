# Опис PR для здачі домашнього завдання

## Імʼя

Dmitry Remar

## Демо

- Demo video: https://www.loom.com/share/cb81485456fb46ed9b47df7ba1e94751
- Live demo: https://world-cup-2026-stage-monitor.vercel.app
- GitHub repo: https://github.com/DmitryyR/world-cup-2026-stage-monitor

## Короткий опис проєкту

**World Cup 2026 Stage Monitor** - це real-data-first застосунок для моніторингу стану Чемпіонату світу 2026. Він отримує дані про матчі, нормалізує provider payload, визначає поточну стадію турніру, перевіряє запропонований стан через checker, зберігає тільки accepted data і показує результат через dashboard, match center, bracket, teams view та agent log.

## Agentic Engineering практики

- Context engineering через PRD, SDD, AGENTS, EVALS, DESIGN і ADR docs.
- Maker/checker separation між fetching/normalization/stage detection та validation.
- Monitor loop, який логує успішні й невдалі запуски.
- Provider abstraction із mock і real provider.
- Real provider integration через `worldcup26.ir`.
- Tests і verification для detector, checker, providers, monitor loop, UI helpers і bracket layout.
- Deployment verification на Vercel із Neon Postgres.
- Custom Codex skill `product-ux-roast-review` для ітеративного UX/product review.

## Що я контролював як human engineer

- Product goal і scope.
- Architecture constraints.
- Acceptance criteria.
- Provider strategy.
- UI review direction.
- Deployment target.
- Verification requirements.
- Final submission packaging.

## Що допоміг реалізувати Codex / AI

- Domain model і schemas.
- Provider adapters і mappers.
- Stage detector і checker tests.
- Monitor loop і persistence flow.
- API routes і repository layer.
- Dashboard, matches, bracket, teams і agent log UI.
- Vercel/Neon deployment fixes.
- Documentation і PR summary.
- Product/UX review skill для повторного аудиту сайту.

## Verification evidence

Фінальні команди:

```bash
npm run test
npm run typecheck
npm run lint
npm run build
```

Очікуваний результат: усі команди проходять успішно.

## Відомі обмеження

- `worldcup26.ir` не є офіційним FIFA API.
- Live provider data може бути затриманою або неповною.
- Run Monitor запускається вручну, а не за розкладом.
- Bracket visual QA можна покращити через screenshot automation.
- Raw provider payload зберігається як serialized text для portability.

## Screenshots

TODO додати screenshots, якщо потрібно:

- Summary dashboard
- Match Center
- Bracket
- Agent Log
