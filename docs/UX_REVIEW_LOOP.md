# UX Review Improvement Loop

This project uses a repeatable product/UX review loop based on the
`product-ux-roast-review` skill.

## Goal

Raise the average product score to at least `8.5`.

The average score is calculated from:

- Functionality
- UI design
- User experience
- Overall product readiness

## Command

Run one controlled loop iteration:

```bash
npm run ux:loop
```

Optional:

```bash
npm run ux:loop -- --url https://world-cup-2026-stage-monitor.vercel.app/ --target 8.5
```

The command creates a new file in:

```text
docs/ux-review-loop/
```

Then it prints a ready-to-copy Codex prompt. Paste that prompt into Codex to run
the review/improvement loop.

## Agent Passes

### 1. Reviewer Agent

Uses `$product-ux-roast-review` against the live app.

Output:

- observed issues;
- functionality score;
- UI design score;
- user experience score;
- overall product readiness score.

### 2. Planner / Checker Agent

Computes the average score.

Rules:

- If average score is `>= 8.5`, stop and record success.
- If average score is `< 8.5`, select the smallest high-impact task set.
- Do not choose broad rewrites when a focused fix would improve the score.

### 3. Implementer Agent

Implements only the selected tasks.

Guardrails:

- Do not change providers unless the selected task explicitly requires it.
- Do not change checker logic unless the selected task explicitly requires it.
- Do not change stage detection unless the selected task explicitly requires it.
- Do not change monitor loop unless the selected task explicitly requires it.
- Keep UI changes focused on the review findings.

### 4. Verifier Agent

Runs verification after changes:

```bash
npm run lint
npm run typecheck
npm run build
```

Run `npm run test` too when domain logic or data handling changed.

### 5. Recorder Agent

Updates the iteration file with:

- review summary;
- scores;
- average score;
- target reached / not reached;
- selected tasks;
- files changed;
- verification results;
- next iteration backlog.

## Stop Condition

The loop is complete when:

```text
(Functionality + UI design + User experience + Overall product readiness) / 4 >= 8.5
```

If the score is still below `8.5`, run:

```bash
npm run ux:loop
```

again to create the next iteration file and continue the loop.
