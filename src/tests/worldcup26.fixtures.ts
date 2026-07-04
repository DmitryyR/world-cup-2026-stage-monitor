import type { WorldCup26Game } from "@/providers/worldcup26.schemas";

export function makeWorldCup26Game(
  overrides: Partial<WorldCup26Game> = {},
): WorldCup26Game {
  return {
    _id: "679c9c8a5749c4077500e001",
    id: "1",
    home_team_id: "1",
    away_team_id: "2",
    home_score: "0",
    away_score: "0",
    group: "A",
    matchday: "1",
    local_date: "06/11/2026 13:00",
    persian_date: "1405-03-21 13:00",
    stadium_id: "1",
    finished: "FALSE",
    time_elapsed: "notstarted",
    type: "group",
    home_team_name_en: "Mexico",
    away_team_name_en: "South Africa",
    ...overrides,
  };
}
