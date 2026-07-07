import { describe, expect, it } from "vitest";
import { normalizeProviderPayload } from "@/domain/normalizer";
import { formatKyivDateTime } from "@/lib/date-format";
import {
  mapWorldCup26GameToRawProviderMatch,
  mapWorldCup26ResponseToRawProviderPayload,
  mapWorldCup26TypeToStage,
} from "@/providers/worldcup26.mapper";
import { makeWorldCup26Game } from "./worldcup26.fixtures";

describe("worldcup26 mapper", () => {
  it("converts scheduled match without fake score or winner", () => {
    const match = mapWorldCup26GameToRawProviderMatch(
      makeWorldCup26Game({
        home_score: "0",
        away_score: "0",
        finished: "FALSE",
        time_elapsed: "notstarted",
      }),
    );

    expect(match.status).toBe("scheduled");
    expect(match.homeScore).toBeNull();
    expect(match.awayScore).toBeNull();
    expect(match.winner).toBeNull();
  });

  it("converts live match", () => {
    const match = mapWorldCup26GameToRawProviderMatch(
      makeWorldCup26Game({
        home_score: "1",
        away_score: "0",
        finished: "FALSE",
        time_elapsed: "45",
      }),
    );

    expect(match.status).toBe("live");
    expect(match.homeScore).toBe(1);
    expect(match.awayScore).toBe(0);
    expect(match.winner).toBeNull();
  });

  it("converts finished match", () => {
    const match = mapWorldCup26GameToRawProviderMatch(
      makeWorldCup26Game({
        home_score: "2",
        away_score: "0",
        finished: "TRUE",
        time_elapsed: "finished",
      }),
    );

    expect(match.status).toBe("finished");
    expect(match.homeScore).toBe(2);
    expect(match.awayScore).toBe(0);
    expect(match.winner).toBe("Mexico");
  });

  it("maps knockout stages", () => {
    expect(mapWorldCup26TypeToStage("r32")).toBe("round_of_32");
    expect(mapWorldCup26TypeToStage("r16")).toBe("round_of_16");
    expect(mapWorldCup26TypeToStage("qf")).toBe("quarter_final");
    expect(mapWorldCup26TypeToStage("sf")).toBe("semi_final");
    expect(mapWorldCup26TypeToStage("third")).toBe("third_place");
    expect(mapWorldCup26TypeToStage("final")).toBe("final");
  });

  it("allows scheduled placeholder teams", () => {
    const payload = mapWorldCup26ResponseToRawProviderPayload({
      games: [
        makeWorldCup26Game({
          id: "104",
          type: "final",
          home_team_name_en: null,
          away_team_name_en: null,
          home_team_label: "Winner Match 101",
          away_team_label: "Winner Match 102",
          finished: "FALSE",
          time_elapsed: "notstarted",
        }),
      ],
    });
    const [match] = normalizeProviderPayload(payload);

    expect(match?.homeTeam).toBe("Winner Match 101");
    expect(match?.awayTeam).toBe("Winner Match 102");
    expect(match?.winner).toBeNull();
    expect(match?.status).toBe("scheduled");
  });

  it("converts timezone-less local_date from source timezone into UTC and Kyiv time", () => {
    const match = mapWorldCup26GameToRawProviderMatch(
      makeWorldCup26Game({
        id: "arg-egy",
        type: "r16",
        local_date: "07/07/2026 12:00",
        home_team_name_en: "Argentina",
        away_team_name_en: "Egypt",
      }),
    );

    expect(match.kickoffAt).toBe("2026-07-07T16:00:00.000Z");
    expect(formatKyivDateTime(match.kickoffAt)).toBe("Jul 7, 2026, 7:00 PM");
  });

  it("adds diagnostics when provider local dates require a timezone assumption", () => {
    const payload = mapWorldCup26ResponseToRawProviderPayload({
      games: [
        makeWorldCup26Game({
          id: "arg-egy",
          local_date: "07/07/2026 12:00",
        }),
      ],
    });

    expect(payload.diagnostics).toContainEqual(
      expect.objectContaining({
        severity: "warning",
        code: "assumed_source_timezone",
        matchId: "arg-egy",
      }),
    );
  });

  it("keeps normalized kickoff sorting stable after source timezone conversion", () => {
    const payload = mapWorldCup26ResponseToRawProviderPayload({
      games: [
        makeWorldCup26Game({
          id: "later",
          local_date: "07/07/2026 13:00",
        }),
        makeWorldCup26Game({
          id: "earlier",
          local_date: "07/07/2026 12:00",
        }),
      ],
    });
    const sortedMatchIds = normalizeProviderPayload(payload)
      .sort((first, second) => first.kickoffAt.localeCompare(second.kickoffAt))
      .map((match) => match.externalId);

    expect(sortedMatchIds).toEqual(["earlier", "later"]);
  });

  it("missing scores do not create fake winners or finished status", () => {
    const match = mapWorldCup26GameToRawProviderMatch(
      makeWorldCup26Game({
        home_score: "null",
        away_score: "null",
        finished: "TRUE",
        time_elapsed: "finished",
      }),
    );

    expect(match.status).not.toBe("finished");
    expect(match.winner).toBeNull();
  });

  it("empty response fails", () => {
    expect(() =>
      mapWorldCup26ResponseToRawProviderPayload({ games: [] }),
    ).toThrow("WorldCup26Provider returned zero games");
  });

  it("unknown stage fails with diagnostics", () => {
    expect(() => mapWorldCup26TypeToStage("mystery")).toThrow(
      "Unknown worldcup26 stage/type",
    );
  });
});
