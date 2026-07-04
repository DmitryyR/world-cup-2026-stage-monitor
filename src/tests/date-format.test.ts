import { describe, expect, it } from "vitest";
import { formatKyivDate, formatKyivDateTime } from "@/lib/date-format";

describe("Kyiv date formatting", () => {
  it("formats UTC timestamps in Europe/Kyiv time", () => {
    expect(formatKyivDateTime("2026-07-04T19:15:00.000Z")).toBe(
      "Jul 4, 2026, 10:15 PM",
    );
    expect(formatKyivDate("2026-07-04T19:15:00.000Z")).toBe("Jul 4, 2026");
  });

  it("does not throw on invalid or missing dates", () => {
    expect(formatKyivDateTime("not-a-date")).toBe("Invalid date");
    expect(formatKyivDate(undefined)).toBe("Invalid date");
  });
});
