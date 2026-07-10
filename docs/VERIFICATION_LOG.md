# Verification Log

## 2026-07-07 Timezone Pipeline

Change verified:

- WorldCup26 timezone-less `local_date` is interpreted as `America/New_York`.
- `07/07/2026 12:00` converts to `2026-07-07T16:00:00.000Z`.
- Europe/Kyiv display becomes `Jul 7, 2026, 7:00 PM`.
- Provider warning is logged for the timezone assumption.

Commands to run:

```bash
npm run test
npm run typecheck
npm run lint
npm run build
```

Result:

- `npm run test` - passed, 17 files / 92 tests.
- `npm run typecheck` - passed.
- `npm run lint` - passed.
- `npm run build` - passed.

## 2026-07-10 Penalty Shootout Pipeline

Change verified:

- Provider penalty fields are mapped into normalized `penaltyScore`.
- Normalization preserves compact raw match evidence.
- Repository reads restore raw provider evidence and derived penalty scores.
- Score formatting displays penalty results such as `1 (3 pens) - 1 (4 pens)`.
- Bracket/Data Health warns when a tied knockout winner has no visible decision method.

Commands to run:

```bash
npm run test
npm run typecheck
npm run lint
npm run build
```

Result:

- `npm run test` - passed, 20 files / 109 tests.
- `npm run typecheck` - passed.
- `npm run lint` - passed.
- `npm run build` - passed.
