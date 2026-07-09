import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const DEFAULT_URL = "https://world-cup-2026-stage-monitor.vercel.app/";
const DEFAULT_TARGET_SCORE = "8.5";

const args = process.argv.slice(2);
const url = getArgValue("--url") ?? DEFAULT_URL;
const targetScore = getArgValue("--target") ?? DEFAULT_TARGET_SCORE;
const timestamp = formatTimestamp(new Date());
const outputDir = join(process.cwd(), "docs", "ux-review-loop");
const outputPath = join(outputDir, `iteration-${timestamp}.md`);

mkdirSync(outputDir, { recursive: true });
writeFileSync(outputPath, buildIterationTemplate({ url, targetScore, timestamp }));

const prompt = buildCodexPrompt({ url, targetScore, outputPath });

console.log(`Created UX review loop file:\n${outputPath}\n`);
console.log("Copy this prompt into Codex to run the next agentic UX loop:\n");
console.log(prompt);

function getArgValue(name: string): string | undefined {
  const index = args.indexOf(name);

  if (index === -1) {
    return undefined;
  }

  return args[index + 1];
}

function formatTimestamp(date: Date): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Kyiv",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const values = Object.fromEntries(
    parts
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, part.value]),
  );

  return `${values.year}${values.month}${values.day}-${values.hour}${values.minute}${values.second}`;
}

function buildIterationTemplate({
  url,
  targetScore,
  timestamp,
}: {
  url: string;
  targetScore: string;
  timestamp: string;
}): string {
  return `# UX Review Loop Iteration ${timestamp}

## Configuration

- URL: ${url}
- Target average score: ${targetScore}
- Skill: product-ux-roast-review
- Status: pending

## Reviewer Output

Paste or summarize the skill audit here.

## Scores

| Area | Score |
| --- | ---: |
| Functionality | TBD |
| UI design | TBD |
| User experience | TBD |
| Overall product readiness | TBD |
| Average | TBD |

## Decision

- Target reached: TBD
- Continue loop: TBD

## Tasks Selected For This Iteration

- TBD

## Changes Made

- TBD

## Verification

- TBD

## Next Iteration Backlog

- TBD
`;
}

function buildCodexPrompt({
  url,
  targetScore,
  outputPath,
}: {
  url: string;
  targetScore: string;
  outputPath: string;
}): string {
  return `Run one controlled UX improvement loop for this app: ${url}

Use $product-ux-roast-review to audit the live app first.

Target:
- Compute the average of the four final scores: Functionality, UI design, User experience, Overall product readiness.
- Stop only when the average score is >= ${targetScore}.

Loop rules for this command:
1. Reviewer pass:
   - Use the product-ux-roast-review skill.
   - Record the observed issues and all four scores.
2. Planner/checker pass:
   - Compute the average score.
   - If average >= ${targetScore}, do not change code. Record that the target is reached.
   - If average < ${targetScore}, select the smallest high-impact task set that can improve the score.
3. Implementer pass:
   - Make only minimal, relevant product/UI/UX fixes.
   - Do not change providers, checker logic, stage detection, monitor loop, or database schema unless the selected task explicitly requires it.
4. Verifier pass:
   - Run available verification commands: npm run lint, npm run typecheck, npm run build. Run npm run test if logic changed.
5. Recorder pass:
   - Update this exact file with the review, scores, selected tasks, changes made, verification results, and next backlog:
     ${outputPath}

If the average is still below ${targetScore} after the fixes, end with the next recommended tasks and tell me to run npm run ux:loop again.`;
}
