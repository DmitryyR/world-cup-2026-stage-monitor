# Review Trace

## 2026-07-07 Timezone Display Fix

Issue observed: `Argentina vs Egypt` was shown as `Jul 7, 2026, 3:00 PM Kyiv time`, while the provider source time represented `Jul 7, 2026, 12:00 PM America/New_York`, which should display as `Jul 7, 2026, 7:00 PM Kyiv time`.

Root cause: `worldcup26.local_date` has no timezone offset, and the mapper treated it as UTC by calling `Date.UTC(...)` directly.

Fix:

- Added a shared source-time conversion helper.
- WorldCup26 provider mapping now assumes `America/New_York` before converting to UTC.
- Stored match kickoff values remain UTC ISO strings.
- UI formatting remains centralized through Europe/Kyiv helpers.
- Provider diagnostics now warn when a timezone-less source field required an assumption.

Checker note: the checker did not catch this because its responsibility is tournament-state consistency, not provider timezone semantics. The new provider diagnostic makes the assumption visible in Data Health and Agent Log without rejecting otherwise valid data.

## 2026-07-10 Penalty Shootout Score Display

Issue observed: completed tied knockout matches such as Germany vs Paraguay, Netherlands vs Morocco, and Australia vs Egypt showed only the regular score (`1 - 1`) or required winner review, so the penalty winner was not clear.

Root cause: penalty evidence was not represented as first-class normalized match data. Raw provider fields could be lost between provider mapping, normalization, persistence, repository reads, and UI score formatting. The checker also only validated score/winner consistency, not whether a tied knockout winner had a visible decision method.

Fix:

- Added normalized `penaltyScore` support.
- Preserved compact raw provider match evidence through normalization and persistence.
- Restored `rawPayload` and derived penalty scores when reading accepted matches from the database.
- Extended penalty extraction to common provider field names and nested score shapes.
- Updated score formatting to display penalty shootout scores.
- Added Data Health diagnostics for tied knockout winners that lack a penalty or decision method.

Checker note: this is a warning-level product/data-health issue, not always a hard rejection. If a provider confirms a winner but does not provide penalties or another method, the accepted state can remain usable while Data Health flags the missing decision method for review.
