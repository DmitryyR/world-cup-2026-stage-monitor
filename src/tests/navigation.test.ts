import { describe, expect, it } from "vitest";
import { isNavItemActive, primaryNavItems } from "@/lib/navigation";

describe("navigation", () => {
  it("keeps Bracket and Teams routes independent", () => {
    const bracket = primaryNavItems.find((item) => item.label === "Bracket");
    const teams = primaryNavItems.find((item) => item.label === "Teams");

    expect(bracket?.href).toBe("/bracket");
    expect(teams?.href).toBe("/teams");
  });

  it("does not share active state between Bracket and Teams", () => {
    const bracket = primaryNavItems.find((item) => item.label === "Bracket");
    const teams = primaryNavItems.find((item) => item.label === "Teams");

    expect(bracket && isNavItemActive(bracket, "/bracket")).toBe(true);
    expect(teams && isNavItemActive(teams, "/bracket")).toBe(false);
    expect(teams && isNavItemActive(teams, "/teams")).toBe(true);
    expect(bracket && isNavItemActive(bracket, "/teams")).toBe(false);
  });
});
