import { describe, expect, it } from "vitest";
import {
  getTeamDisplayName,
  getTeamFallbackInitials,
  getTeamFlag,
  getTeamShortCode,
  formatPlaceholderTeam,
} from "@/lib/team-flags";

describe("team display helpers", () => {
  it("returns polished names and flags for known full team names", () => {
    expect(getTeamDisplayName("Paraguay")).toBe("Paraguay");
    expect(getTeamFlag("Paraguay")).toBe("py");
    expect(getTeamShortCode("Paraguay")).toBe("PAR");

    expect(getTeamDisplayName("England")).toBe("England");
    expect(getTeamFlag("England")).toBe("gb-eng");
    expect(getTeamShortCode("England")).toBe("ENG");
  });

  it("maps provider country codes to full team display names", () => {
    expect(getTeamDisplayName("PY")).toBe("Paraguay");
    expect(getTeamFlag("PY")).toBe("py");
    expect(getTeamDisplayName("FR")).toBe("France");
    expect(getTeamDisplayName("CA")).toBe("Canada");
    expect(getTeamDisplayName("MA")).toBe("Morocco");
    expect(getTeamDisplayName("CO")).toBe("Colombia");
    expect(getTeamDisplayName("GH")).toBe("Ghana");
    expect(getTeamDisplayName("CV")).toBe("Cape Verde");
  });

  it("keeps unknown team names readable with a safe fallback flag", () => {
    expect(getTeamDisplayName("Winner Match 101")).toBe("Winner of Match 101");
    expect(getTeamFlag("Winner Match 101")).toBeNull();
    expect(getTeamShortCode("Winner Match 101")).toBe("WIN");
    expect(getTeamFallbackInitials("Winner Match 101")).toBe("TBD");
  });

  it("cleans raw placeholder tokens from user-facing labels", () => {
    expect(formatPlaceholderTeam("WO Winner of Portugal vs Spain")).toBe(
      "Winner of Portugal vs Spain",
    );
    expect(formatPlaceholderTeam("LO Loser of Semi-final 1")).toBe(
      "Loser of Semi-final 1",
    );
    expect(formatPlaceholderTeam("WM Winner Match 93")).toBe("Winner of Match 93");
    expect(formatPlaceholderTeam("LM Loser Match 101")).toBe("Loser of Match 101");
  });

  it("removes leaked provider prefixes from team display names", () => {
    expect(getTeamDisplayName("CU Curaçao")).toBe("Curaçao");
    expect(getTeamDisplayName("TU Tunisia")).toBe("Tunisia");
    expect(getTeamDisplayName("IR Iraq")).toBe("Iraq");
    expect(getTeamDisplayName("JO Jordan")).toBe("Jordan");
    expect(getTeamDisplayName("NZ New Zealand")).toBe("New Zealand");
    expect(getTeamDisplayName("PA Panama")).toBe("Panama");
    expect(getTeamDisplayName("SA Saudi Arabia")).toBe("Saudi Arabia");
    expect(getTeamDisplayName("UZ Uzbekistan")).toBe("Uzbekistan");
    expect(getTeamDisplayName("DR Democratic Republic of the Congo")).toBe(
      "Democratic Republic of the Congo",
    );
  });

  it("does not throw on empty or missing team names", () => {
    expect(getTeamDisplayName("")).toBe("Unknown team");
    expect(getTeamDisplayName(undefined)).toBe("Unknown team");
    expect(getTeamFlag(null)).toBeNull();
    expect(getTeamShortCode(undefined)).toBe("TBD");
    expect(getTeamFallbackInitials(undefined)).toBe("FC");
  });
});
