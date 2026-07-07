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
