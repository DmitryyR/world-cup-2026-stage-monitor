"use client";

import { useMemo, useState } from "react";
import type { NormalizedMatch, TournamentStage } from "@/domain/types";
import { formatKyivDate } from "@/lib/date-format";
import { MatchTable } from "./MatchTable";

type MatchFilter = "all" | "live" | "today" | "finished" | "scheduled" | "current";

type MatchFiltersTableProps = {
  currentStage: TournamentStage | null;
  matches: NormalizedMatch[];
};

const filters: Array<{ id: MatchFilter; label: string }> = [
  { id: "all", label: "All" },
  { id: "live", label: "Live" },
  { id: "today", label: "Today" },
  { id: "finished", label: "Finished" },
  { id: "scheduled", label: "Scheduled" },
  { id: "current", label: "Current Stage" },
];

export function MatchFiltersTable({ currentStage, matches }: MatchFiltersTableProps) {
  const [activeFilter, setActiveFilter] = useState<MatchFilter>("all");
  const today = formatKyivDate(new Date());

  const filteredMatches = useMemo(() => {
    return matches.filter((match) => {
      if (activeFilter === "all") {
        return true;
      }

      if (activeFilter === "today") {
        return formatKyivDate(match.kickoffAt) === today;
      }

      if (activeFilter === "current") {
        return currentStage ? match.stage === currentStage : true;
      }

      return match.status === activeFilter;
    });
  }, [activeFilter, currentStage, matches, today]);

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {filters.map((filter) => (
          <button
            key={filter.id}
            className={
              activeFilter === filter.id
                ? "rounded-md bg-blue-500 px-3 py-2 text-sm font-black text-white"
                : "rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold text-slate-300 hover:border-blue-400/40 hover:bg-blue-500/15"
            }
            onClick={() => setActiveFilter(filter.id)}
            type="button"
          >
            {filter.label}
          </button>
        ))}
      </div>
      <MatchTable matches={filteredMatches} />
    </section>
  );
}
