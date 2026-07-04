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
| E11 | API-Football missing API key | Monitor run fails clearly and public state is unchanged. |
| E12 | API-Football unknown round | Monitor run fails clearly and public state is unchanged. |
| E13 | API-Football scheduled status | Mapper produces scheduled match without fake score or winner. |
| E14 | API-Football finished status | Mapper produces finished match with scores and winner when provider winner is confirmed. |
| E15 | WorldCup26 scheduled match | Mapper produces scheduled match without fake score or winner. |
| E16 | WorldCup26 live match | Mapper produces live match with scores when present and no winner. |
| E17 | WorldCup26 finished match | Mapper produces finished match with scores and derived winner when not drawn. |
| E18 | WorldCup26 empty response | Monitor run fails and existing public matches/state remain unchanged. |
| E19 | WorldCup26 unknown stage/status | Monitor run fails clearly and public state is unchanged. |
| E20 | Full future knockout schedule exists | Detector returns the earliest unresolved stage, not the latest future fixture. |

## Manual Review Checklist

- Maker modules can generate proposed state without checker approval.
- Checker module can reject proposed state with clear errors.
- Monitor loop logs failed runs.
- Failed runs do not update public tournament state.
- Tests cover detector and checker before UI code exists.
- Real-provider tests use fixtures or mocked fetch, not the live API.
- `worldcup26.ir` is treated as untrusted external data, not official FIFA truth.
