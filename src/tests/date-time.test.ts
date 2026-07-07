import { describe, expect, it } from "vitest";
import { formatKyivDateTime } from "@/lib/date-format";
import {
  parseSourceDateAndTimeToUtc,
  parseWorldCup26LocalDateToUtc,
} from "@/lib/date-time";

describe("date/time conversion", () => {
  it("converts New York source date and 12:00 PM into 19:00 Kyiv display time", () => {
    const utcInstant = parseSourceDateAndTimeToUtc(
      "2026-07-07",
      "12:00 PM",
      "America/New_York",
    );

    expect(formatKyivDateTime(utcInstant)).toBe("Jul 7, 2026, 7:00 PM");
  });

  it("converts New York source date and 12:00 PM into the correct UTC instant", () => {
    expect(
      parseSourceDateAndTimeToUtc("2026-07-07", "12:00 PM", "America/New_York"),
    ).toBe("2026-07-07T16:00:00.000Z");
  });

  it("normalizes timezone-less worldcup26 local_date with an explicit warning", () => {
    const result = parseWorldCup26LocalDateToUtc("07/07/2026 12:00");

    expect(result.utcInstant).toBe("2026-07-07T16:00:00.000Z");
    expect(result.warning).toContain("assumed America/New_York");
  });

  it("throws a clear error for invalid worldcup26 local_date values", () => {
    expect(() => parseWorldCup26LocalDateToUtc("bad date")).toThrow(
      "Invalid worldcup26 local_date",
    );
  });
});
