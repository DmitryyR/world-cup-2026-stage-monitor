"use client";

import { useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import type { NormalizedMatch } from "@/domain/types";
import { formatKyivDateTime } from "@/lib/date-format";
import { formatScore, formatStage } from "@/lib/format";
import { getTeamSummaries } from "@/lib/team-directory";
import { StatusBadge } from "./StatusBadge";
import { TeamName } from "./TeamName";
import { TeamPathCard } from "./TeamPathCard";

type TeamDirectoryProps = {
  matches: NormalizedMatch[];
};

export function TeamDirectory({ matches }: TeamDirectoryProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTeam, setSelectedTeam] = useState("");
  const summaries = useMemo(() => getTeamSummaries(matches), [matches]);
  const normalizedSearch = searchQuery.trim().toLowerCase();
  const filteredSummaries = summaries.filter((summary) =>
    summary.displayName.toLowerCase().includes(normalizedSearch),
  );

  return (
    <div className="grid min-w-0 items-start gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
      <section className="min-w-0 rounded-lg border border-white/10 bg-slate-950/45 p-4 shadow-xl shadow-black/20">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-sm font-black uppercase text-slate-100">Teams</h2>
            <p className="mt-1 text-sm text-slate-400">
              Select a team to inspect its accepted tournament route.
            </p>
          </div>
          <label className="relative block min-w-0 sm:w-80">
            <span className="sr-only">Search teams</span>
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

        <div className="mt-4 grid gap-3 md:grid-cols-2 2xl:grid-cols-3">
          {filteredSummaries.map((summary) => (
            <button
              aria-pressed={selectedTeam === summary.team}
              className={
                selectedTeam === summary.team
                  ? "rounded-lg border border-blue-300/40 bg-blue-500/15 p-3 text-left shadow-lg shadow-blue-950/20 outline-none ring-2 ring-blue-300/25"
                  : "rounded-lg border border-white/10 bg-slate-900/75 p-3 text-left outline-none hover:border-blue-400/40 hover:bg-blue-500/10 focus-visible:ring-2 focus-visible:ring-blue-300/50"
              }
              key={summary.team}
              onClick={() => setSelectedTeam(summary.team)}
              type="button"
            >
              <div className="flex items-start justify-between gap-3">
                <TeamName teamName={summary.team} />
                {summary.status === "idle" ? null : <StatusBadge status={summary.status} />}
              </div>
              <dl className="mt-3 grid gap-2 text-xs text-slate-400">
                <div className="flex justify-between gap-3">
                  <dt>Matches</dt>
                  <dd className="font-semibold text-slate-200">{summary.played}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt>Stage</dt>
                  <dd className="text-right font-semibold text-slate-200">
                    {summary.latestStage ? formatStage(summary.latestStage) : "-"}
                  </dd>
                </div>
                <div className="border-t border-white/10 pt-2">
                  {summary.nextMatch ? (
                    <span>
                      Next: {formatKyivDateTime(summary.nextMatch.kickoffAt)} Kyiv time
                    </span>
                  ) : summary.lastMatch ? (
                    <span>
                      Last: {formatScore(summary.lastMatch)} -{" "}
                      {formatStage(summary.lastMatch.stage)}
                    </span>
                  ) : (
                    <span>No accepted matches yet</span>
                  )}
                </div>
              </dl>
            </button>
          ))}
        </div>

        {filteredSummaries.length === 0 ? (
          <div className="mt-4 rounded-lg border border-dashed border-white/10 bg-white/[0.03] p-6 text-center text-sm text-slate-400">
            No teams found for that search.
          </div>
        ) : null}
      </section>

      <TeamPathCard
        matches={matches}
        onSelectedTeamChange={setSelectedTeam}
        selectedTeam={selectedTeam}
      />
    </div>
  );
}
