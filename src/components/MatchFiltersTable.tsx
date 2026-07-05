"use client";

import { useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import type { NormalizedMatch, TournamentStage } from "@/domain/types";
import { formatKyivDate } from "@/lib/date-format";
import {
  filterMatches,
  formatPlural,
  getEmptyMatchMessage,
  getMatchFilterCounts,
  type MatchFilter,
} from "@/lib/match-filters";
import { MatchTable } from "./MatchTable";

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
  const [searchQuery, setSearchQuery] = useState("");
  const today = formatKyivDate(new Date());
  const counts = useMemo(
    () => getMatchFilterCounts(matches, currentStage, today),
    [currentStage, matches, today],
  );

  const filteredMatches = useMemo(() => {
    return filterMatches({
      activeFilter,
      currentStage,
      matches,
      searchQuery,
      today,
    });
  }, [activeFilter, currentStage, matches, searchQuery, today]);

  return (
    <section className="space-y-4">
      <div className="rounded-lg border border-white/10 bg-slate-950/45 p-4">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-wrap gap-2">
            {filters.map((filter) => (
              <button
                key={filter.id}
                aria-label={`${filter.label}, ${formatPlural(counts[filter.id], "match")}`}
                aria-pressed={activeFilter === filter.id}
                className={
                  activeFilter === filter.id
                    ? "rounded-md bg-blue-500 px-3 py-2 text-sm font-black text-white outline-none ring-2 ring-blue-300/35"
                    : "rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold text-slate-300 outline-none hover:border-blue-400/40 hover:bg-blue-500/15 focus-visible:ring-2 focus-visible:ring-blue-300/50"
                }
                onClick={() => setActiveFilter(filter.id)}
                type="button"
              >
                {filter.label}{" "}
                <span className="ml-1 text-xs opacity-80">{counts[filter.id]}</span>
              </button>
            ))}
          </div>
          <label className="relative block min-w-0 xl:w-80">
            <span className="sr-only">Search by team name</span>
            <Search
              aria-hidden="true"
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
              size={16}
            />
            <input
              className="h-10 w-full rounded-md border border-white/10 bg-white/5 pl-9 pr-10 text-sm text-slate-100 outline-none placeholder:text-slate-500 focus:border-blue-300/50 focus:ring-2 focus:ring-blue-300/25"
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search team"
              type="search"
              value={searchQuery}
            />
            {searchQuery ? (
              <button
                aria-label="Clear team search"
                className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded text-slate-400 hover:bg-white/10 hover:text-slate-100"
                onClick={() => setSearchQuery("")}
                type="button"
              >
                <X aria-hidden="true" size={15} />
              </button>
            ) : null}
          </label>
        </div>
      </div>
      <MatchTable
        emptyMessage={getEmptyMatchMessage(activeFilter, searchQuery)}
        matches={filteredMatches}
      />
    </section>
  );
}
