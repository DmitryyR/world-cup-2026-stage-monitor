# World Cup 2026 Stage Monitor — Design Specification

## 1. Purpose

This document defines the visual and functional design direction for the World Cup 2026 Stage Monitor web application.

Use the provided dashboard screenshot as the main design reference.

The goal is not to copy the image pixel-perfect, but to follow its visual direction:

- Dark sports dashboard style
- Left sidebar navigation
- Top KPI cards
- Real knockout bracket layout
- Card-based match components
- Clear status badges
- Data health and agent monitoring
- Compact but readable tournament information

The final UI should feel like a professional sports monitoring dashboard, not like a plain technical admin table.

---

## 2. Product Goal

The interface must help the user immediately understand:

1. How much of the tournament is completed.
2. What the current stage is.
3. Which match is live now.
4. Which match is scheduled next.
5. Which teams advanced.
6. How teams advanced in knockout matches.
7. Whether the data is valid and trustworthy.
8. What changed during the latest monitor run.

The `/bracket` page is the core product screen and should receive the highest design priority.

---

## 3. Main Layout

### Desktop Layout

The app should use a fixed left sidebar and a large dashboard content area.

```text
┌──────────────────────────────────────────────────────────────────────────────┐
│ Sidebar │ Top KPI Cards                                                     │
│         │ Tournament Bracket                                                │
│         │ Recent Results | Upcoming Matches | Team Path | Data Health        │
│         │ Agent Log                                                         │
└──────────────────────────────────────────────────────────────────────────────┘
```

### Sidebar

The sidebar should contain:

- Trophy icon or World Cup visual mark
- Product title:
  - `WORLD CUP 2026`
  - `STAGE MONITOR`
- Navigation items:
  - Summary
  - Bracket
  - Matches
  - Agent Log
  - Teams
- Kyiv time block at the bottom

The active navigation item should have:

- Blue gradient background
- Subtle border
- Brighter text
- Highlighted icon

Recommended sidebar width:

```css
width: 240px;
```

---

## 4. Visual Style

### General Mood

Use a premium dark sports analytics style.

The interface should feel:

- Modern
- Focused
- Data-driven
- Tournament-oriented
- Reliable
- Clean

Avoid:

- Plain white tables
- Raw technical labels
- Overloaded text blocks
- Excessive decoration
- Unclear match states
- Vertical list-only bracket layout

---

## 5. Color System

Recommended CSS variables:

```css
:root {
  --bg-main: #050b16;
  --bg-sidebar: #06101f;
  --bg-panel: #081426;
  --bg-card: #0d1b2e;
  --bg-card-hover: #12243a;

  --border-subtle: rgba(148, 163, 184, 0.18);
  --border-strong: rgba(148, 163, 184, 0.32);

  --text-primary: #f8fafc;
  --text-secondary: #cbd5e1;
  --text-muted: #94a3b8;

  --accent-blue: #2563eb;
  --accent-green: #22c55e;
  --accent-red: #ef4444;
  --accent-yellow: #f59e0b;
  --accent-cyan: #38bdf8;
}
```

### Background

Use a deep navy / dark gradient.

```css
body {
  background:
    radial-gradient(circle at top left, rgba(37, 99, 235, 0.16), transparent 32%),
    linear-gradient(180deg, #050b16 0%, #020617 100%);
  color: var(--text-primary);
}
```

---

## 6. Typography

Recommended hierarchy:

```css
.page-title {
  font-size: 24px;
  font-weight: 700;
}

.section-title {
  font-size: 16px;
  font-weight: 700;
  text-transform: uppercase;
}

.kpi-value {
  font-size: 32px;
  font-weight: 700;
}

.card-title {
  font-size: 15px;
  font-weight: 600;
}

.body-text {
  font-size: 14px;
}

.meta-text {
  font-size: 12px;
  color: var(--text-muted);
}
```

Use uppercase carefully:

- Good for section titles
- Good for badges
- Avoid using uppercase for long labels or body text

---

## 7. Top KPI Cards

The top row should contain five KPI cards:

1. Tournament Progress
2. Current Stage
3. Live Now
4. Next Match
5. Data Health

### KPI Card Style

```css
.kpi-card {
  background: linear-gradient(
    180deg,
    rgba(15, 30, 52, 0.95),
    rgba(8, 20, 38, 0.95)
  );
  border: 1px solid var(--border-subtle);
  border-radius: 12px;
  padding: 18px;
  min-height: 130px;
}
```

### Tournament Progress

Example content:

```text
TOURNAMENT PROGRESS

89 / 104        86%

[progress bar]

Matches completed
```

Rules:

- `89 / 104` should be the dominant value.
- Percentage should be green.
- Progress bar should use green fill.

### Current Stage

Example content:

```text
CURRENT STAGE

Round of 16

16 teams remaining
```

Optional:

- Trophy icon on the right side of the card.

### Live Now

Example content:

```text
LIVE NOW      LIVE

Paraguay vs France

Paraguay 0 - 0 France

Started 20:00
```

Rules:

- Live badge must be red.
- Score should be visually prominent.
- Do not display the live match as the next scheduled match.

### Next Match

Example content:

```text
NEXT MATCH

Brazil vs Norway

Jul 5, 23:00
```

Rules:

- This card should display only the next scheduled match.
- If a match is already live, it belongs in `Live Now`, not `Next Match`.

### Data Health

Example content:

```text
DATA HEALTH

Checker passed

Unresolved: 0
Last check: 01:25
```

Rules:

- Green shield/check icon when passed.
- Yellow/orange warning if there are unresolved data issues.
- Red state if checker failed.

---

## 8. Tournament Bracket

The bracket is the most important part of the UI.

The current bracket must not look like a vertical list. It should look like a real knockout tournament tree.

### Required Columns

Use horizontal columns for:

```text
Round of 32 → Round of 16 → Quarter-finals → Semi-finals → Third Place → Final
```

Each round column should contain:

- Round title
- Number of teams
- Match cards
- Optional `View all matches` button

Example:

```text
ROUND OF 32
32 teams

[MatchCard]
[MatchCard]
[MatchCard]

View all 16 matches
```

### Bracket Tree Feel

The bracket should visually show progression.

Use connector lines between related matches where practical.

Connector lines should be:

- Thin
- Subtle
- Neutral gray/blue
- Not visually dominant

Example style:

```css
.bracket-connector {
  border-color: rgba(148, 163, 184, 0.45);
}
```

### Bracket Container

```css
.bracket-board {
  background: rgba(8, 20, 38, 0.88);
  border: 1px solid var(--border-subtle);
  border-radius: 14px;
  overflow: hidden;
}

.bracket-scroll {
  overflow-x: auto;
}

.bracket-grid {
  display: grid;
  grid-template-columns: repeat(6, minmax(220px, 1fr));
  gap: 0;
}
```

---

## 9. Match Card

### Required Match Card Data

Each match card should show:

- Status badge
- Date or time
- Team A
- Team B
- Score
- Winner or advancement method
- Placeholder text for future matches

### Finished Match Example

```text
Finished                 Jul 1

Germany              1
Paraguay             1

Paraguay won on penalties
```

### Live Match Example

```text
LIVE                     Jul 5 · 20:00

Paraguay             0
France               0

● Live now
```

### Scheduled Match Example

```text
SCHEDULED                Jul 5 · 23:00

Brazil
Norway

Tomorrow
```

### Placeholder Match Example

Bad:

```text
WM Winner Match 89
```

Good:

```text
Winner of Paraguay / France
Winner of Brazil / Norway
```

### Match Card Style

```css
.match-card {
  background: linear-gradient(
    180deg,
    rgba(17, 34, 56, 0.96),
    rgba(11, 24, 42, 0.96)
  );
  border: 1px solid var(--border-subtle);
  border-radius: 10px;
  padding: 12px;
  min-height: 104px;
}

.match-card:hover {
  background: var(--bg-card-hover);
  border-color: var(--border-strong);
}
```

### Team Row

Each team row should follow this pattern:

```text
[flag] Team name          score
```

Rules:

- Score should be aligned right.
- Flags should be small and consistent.
- Winning team can have stronger text.
- Losing team can be slightly muted.
- Do not hide scores for finished or live matches.

---

## 10. Status Badges

Use the same status badge design across all pages.

### Status Types

| Status | Visual Meaning |
|---|---|
| Live | Match is currently active |
| Finished | Match is completed |
| Scheduled | Match is planned |
| Needs review | Data is incomplete or inconsistent |
| Error | Checker failed or data is invalid |

### Badge Style

```css
.status-badge {
  border-radius: 6px;
  padding: 3px 7px;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
}
```

### Badge Colors

```css
.status-live {
  background: rgba(239, 68, 68, 0.95);
  color: white;
}

.status-finished {
  background: rgba(34, 197, 94, 0.16);
  color: #4ade80;
}

.status-scheduled {
  background: rgba(37, 99, 235, 0.22);
  color: #bfdbfe;
}

.status-needs-review {
  background: rgba(245, 158, 11, 0.18);
  color: #fbbf24;
}

.status-error {
  background: rgba(239, 68, 68, 0.18);
  color: #fca5a5;
}
```

---

## 11. Knockout Match Logic

The UI must respect knockout tournament rules.

A finished knockout match must always have a winner.

### Valid Examples

```text
Germany 1 - 1 Paraguay
Paraguay won on penalties
```

```text
Australia 1 - 1 Egypt
Egypt won after extra time
```

```text
Morocco 3 - 0 Canada
Morocco won in regular time
```

### Invalid Example

```text
Germany 1 - 1 Paraguay
Finished
Winner: empty
```

This must not be displayed as a normal finished match.

If a knockout match is finished but has no winner, mark it as:

```text
needs_review
```

---

## 12. Recommended Match Data Model

```ts
type MatchStatus =
  | "scheduled"
  | "live"
  | "finished"
  | "needs_review"
  | "error";

type WinMethod =
  | "regular_time"
  | "extra_time"
  | "penalties"
  | "walkover";

type Team = {
  id: string;
  name: string;
  flag?: string;
};

type Match = {
  id: string;
  stage: string;
  status: MatchStatus;
  kickoffAt?: string;

  homeTeam?: Team;
  awayTeam?: Team;

  homeScore?: number;
  awayScore?: number;

  winnerTeamId?: string;
  winMethod?: WinMethod;

  sourceMatchIds?: string[];
};
```

---

## 13. Knockout Validation Rules

### Rule 1: Finished Knockout Match Must Have Winner

```ts
if (
  isKnockoutStage(match.stage) &&
  match.status === "finished" &&
  !match.winnerTeamId
) {
  match.status = "needs_review";
}
```

### Rule 2: Tied Knockout Match Must Have Win Method

```ts
if (
  isKnockoutStage(match.stage) &&
  match.status === "finished" &&
  match.homeScore === match.awayScore &&
  match.winnerTeamId &&
  !match.winMethod
) {
  match.status = "needs_review";
}
```

### Rule 3: Scheduled Match Should Not Have Score

```ts
if (
  match.status === "scheduled" &&
  (match.homeScore !== undefined || match.awayScore !== undefined)
) {
  match.status = "needs_review";
}
```

### Rule 4: Live Match Should Not Be Displayed as Next Match

```ts
const liveMatch = matches.find(match => match.status === "live");

const nextScheduledMatch = matches
  .filter(match => match.status === "scheduled")
  .sort((a, b) => Date.parse(a.kickoffAt!) - Date.parse(b.kickoffAt!))[0];
```

---

## 14. Win Method Labels

Use user-friendly labels.

```ts
const winMethodLabel = {
  regular_time: "won in regular time",
  extra_time: "won after extra time",
  penalties: "won on penalties",
  walkover: "advanced by walkover",
};
```

Examples:

```text
Paraguay won on penalties
Egypt won after extra time
Morocco won in regular time
```

---

## 15. Placeholder Labels

Replace technical placeholder names with user-friendly labels.

### Bad

```text
WM Winner Match 89
WM Winner Match 90
```

### Good

```text
Winner of Paraguay / France
Winner of Brazil / Norway
```

### Better If Winner Is Known

```text
France
Winner of Brazil / Norway
```

### Function Example

```ts
function getPlaceholderLabel(match: Match, allMatches: Match[]) {
  if (!match.sourceMatchIds?.length) {
    return "To be decided";
  }

  return match.sourceMatchIds
    .map(sourceId => {
      const source = allMatches.find(m => m.id === sourceId);

      if (!source) {
        return "Winner of previous match";
      }

      if (source.winnerTeamId) {
        const winner =
          source.homeTeam?.id === source.winnerTeamId
            ? source.homeTeam
            : source.awayTeam;

        return winner?.name ?? "Winner of previous match";
      }

      const home = source.homeTeam?.name ?? "TBD";
      const away = source.awayTeam?.name ?? "TBD";

      return `Winner of ${home} / ${away}`;
    })
    .join(" vs ");
}
```

---

## 16. Lower Dashboard Blocks

Below the bracket, show three cards:

```text
Recent Results | Upcoming Matches | Team Path
```

### Recent Results

Example:

```text
RECENT RESULTS

Jul 4   Morocco 3 - 0 Canada       Finished
Jul 3   France 2 - 1 Japan          Finished
Jul 3   Brazil 4 - 0 South Korea    Finished
Jul 2   Argentina 2 - 1 Poland      Finished
```

Rules:

- Show latest finished matches.
- Use status badges.
- Keep compact row layout.
- Add `View all` link.

### Upcoming Matches

Example:

```text
UPCOMING MATCHES

Jul 5 20:00   Paraguay vs France    LIVE
Jul 5 23:00   Brazil vs Norway      Soon
Jul 6 20:00   Egypt vs Spain        Scheduled
Jul 6 23:00   USA vs Uruguay        Scheduled
```

Rules:

- Live match can appear here with red badge.
- Scheduled matches should have blue badge.
- Near matches can show `Soon`.

### Team Path

Show the selected team’s path through the tournament.

Example:

```text
TEAM PATH
Morocco

Group Stage      Brazil 1 - 1 Morocco
Round of 32      Netherlands 1 - 1 Morocco
                 Won on penalties
Round of 16      Morocco 3 - 0 Canada
Quarter-final    Pending
```

Use a vertical timeline style.

---

## 17. Data Health Panel

The Data Health panel should show validation state clearly.

Example:

```text
DATA HEALTH

Provider                    worldcup26
Checker                     Passed
Unresolved winners           0
Stale live matches           0
Placeholder dependencies     8
Last sync                    01:25 Kyiv time

[View details]
```

### Data Health States

| State | Meaning |
|---|---|
| Passed | No blocking data issues |
| Warning | Data has issues but UI can continue |
| Failed | Data cannot be trusted |
| Needs review | Some matches require manual verification |

---

## 18. Agent Log Panel

Show only the latest run by default.

Example:

```text
AGENT LOG

Latest run                  Passed
Jul 5, 01:25

Stage                       Round of 16
Changes                     0
Duration                    18s

[Show previous runs]
```

Rules:

- Do not show a long repetitive log on the main dashboard.
- Collapse previous runs.
- Highlight failed checker runs.
- Show full log only on the `/agent-log` page.

---

## 19. Matches Page

The `/matches` page should use a clean table layout.

### Required Columns

```text
Date | Stage | Teams | Score | Status | Winner
```

### Filters

Add filters above the table:

```text
All | Live | Today | Finished | Scheduled | Current Stage
```

### Table Rules

- Align score column centrally.
- Use status badges.
- Show winner only when available.
- For scheduled matches, show `—` in score and winner columns.
- Keep Kyiv time.
- Add team search if practical.

Example:

```text
Date          Stage          Teams                   Score     Status       Winner
Jul 5 20:00   Round of 16    Paraguay vs France      0 - 0     Live         —
Jul 5 23:00   Round of 16    Brazil vs Norway        —         Scheduled    —
Jul 4 20:00   Round of 16    Morocco vs Canada       3 - 0     Finished     Morocco
```

---

## 20. Agent Log Page

The `/agent-log` page should be useful for debugging but not visually noisy.

### Requirements

- Show latest run at the top.
- Show status summary.
- Group older runs by date.
- Collapse repeated zero-change runs.
- Highlight failed checker runs.
- Show checker errors clearly.

Example:

```text
Latest run
Status: Passed
Stage: Round of 16
Changes: 0
Duration: 18s
Last sync: Jul 5, 01:25 Kyiv time

Previous runs
[collapsed]
```

---

## 21. Responsive Behavior

### Desktop

- Sidebar fixed on the left.
- KPI cards in one row.
- Bracket in horizontal columns.
- Data Health and Agent Log visible on the right or below bracket depending on available width.

### Tablet

- Sidebar may become narrower.
- KPI cards wrap into two rows.
- Bracket keeps horizontal scroll.
- Lower cards stack into two columns if needed.

### Mobile

- Sidebar becomes top navigation or collapsible drawer.
- KPI cards stack vertically.
- Bracket remains horizontally scrollable.
- Match cards remain compact.
- Do not convert the bracket into a plain vertical list.

Recommended responsive behavior:

```css
@media (max-width: 1024px) {
  .dashboard-grid {
    grid-template-columns: 1fr;
  }

  .kpi-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 640px) {
  .app-shell {
    grid-template-columns: 1fr;
  }

  .sidebar {
    position: static;
    width: 100%;
  }

  .kpi-grid {
    grid-template-columns: 1fr;
  }

  .bracket-grid {
    grid-template-columns: repeat(6, minmax(220px, 240px));
  }
}
```

---

## 22. Recommended Component Structure

```text
components/
  layout/
    AppShell.tsx
    Sidebar.tsx
    PageHeader.tsx

  dashboard/
    TopMetricCard.tsx
    TournamentProgressCard.tsx
    LiveMatchCard.tsx
    NextMatchCard.tsx
    DataHealthCard.tsx

  bracket/
    BracketBoard.tsx
    BracketRound.tsx
    MatchCard.tsx
    BracketConnector.tsx

  matches/
    MatchesTable.tsx
    MatchFilters.tsx

  status/
    StatusBadge.tsx

  teams/
    TeamName.tsx
    TeamFlag.tsx
    TeamPathCard.tsx

  agent/
    AgentLogCard.tsx
    AgentRunSummary.tsx
```

---

## 23. Acceptance Criteria

The implementation is successful when:

- `/bracket` visually looks like a real tournament bracket.
- The user can immediately identify:
  - current stage
  - live match
  - next scheduled match
  - advanced teams
  - pending matches
- Finished knockout matches always show a winner.
- Tied knockout matches show the advancement method:
  - penalties
  - extra time
  - walkover
- Invalid knockout data is marked as `needs_review`.
- Technical placeholders like `WM Winner Match 89` are replaced with readable labels.
- The layout remains usable on desktop, tablet, and mobile.
- Visual style matches the dark sports dashboard reference.
- Data Health and Agent Log are present but do not dominate the main bracket experience.
- The Matches page is readable and not displayed as raw text.
- The Agent Log page is useful for debugging but not noisy.

---

## 24. Implementation Priority

Prioritize changes in this order:

1. Fix knockout winner and win method display.
2. Convert bracket from list layout to horizontal tournament layout.
3. Add reusable `MatchCard` and `StatusBadge` components.
4. Add user-friendly placeholder labels.
5. Separate `Live Now` and `Next Match`.
6. Improve the `/matches` table.
7. Add `TeamPathCard`.
8. Refine `DataHealthCard` and `AgentLogCard`.
9. Improve responsive behavior.
10. Final visual cleanup.

---

## 25. Codex Instruction

Use this document as the design specification.

Update the current World Cup 2026 Stage Monitor UI to follow this design direction, especially:

- `/bracket` page
- knockout match logic
- status badges
- KPI cards
- team path
- matches table
- data health
- agent log
- responsive layout

Do not break the existing provider/checker pipeline unless changes are required for validation or correct match state rendering.

The main success criterion is that the app should clearly communicate the tournament state, not merely display raw match data.
