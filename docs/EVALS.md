# Evals

These eval scenarios protect the domain contract and reviewer-facing Agentic Engineering requirements.

## Required Eval Cases

| ID | Scenario | Expected Result |
| --- | --- | --- |
| E01 | Group stage still active | Detector returns `group_stage`; checker passes valid matches. |
| E02 | Transition to Round of 32 | Detector returns `round_of_32` when Round of 32 has scheduled or live matches. |
| E03 | Transition to Round of 16 | Detector returns `round_of_16` when Round of 16 has scheduled or live matches. |
| E04 | Final scheduled | Detector returns `final`; champion remains null. |
| E05 | Final finished and champion detected | Detector returns `completed`; champion equals final winner. |
| E06 | Invalid champion before final | Checker rejects proposed state. |
| E07 | Scheduled match with winner | Checker rejects proposed matches. |
| E08 | Finished match without score | Checker rejects proposed matches. |
| E09 | Stage regression | Checker rejects when proposed stage is earlier than persisted stage. |
| E10 | More than 104 matches | Checker rejects proposed matches. |

## Manual Review Checklist

- Maker modules can generate proposed state without checker approval.
- Checker module can reject proposed state with clear errors.
- Monitor loop logs failed runs.
- Failed runs do not update public tournament state.
- Tests cover detector and checker before UI code exists.
