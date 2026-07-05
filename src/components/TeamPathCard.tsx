"use client";

import { useMemo, useState } from "react";
import type { NormalizedMatch } from "@/domain/types";
import { formatKyivDateTime } from "@/lib/date-format";
import { formatScore, formatStage } from "@/lib/format";
import { getWinMethodLabel } from "@/lib/knockout-display";
import { getTeamDisplayName } from "@/lib/team-flags";
import { TeamName } from "./TeamName";

type TeamPathCardProps = {
  matches: NormalizedMatch[];
};

export function TeamPathCard({ matches }: TeamPathCardProps) {
  const defaultTeam = useMemo(() => pickTeam(matches), [matches]);
  const teamOptions = useMemo(() => getTeamOptions(matches), [matches]);
  const [chosenTeam, setChosenTeam] = useState("");
  const selectedTeam = chosenTeam || defaultTeam;

  if (!selectedTeam) {
    return (
      <section className="min-w-0 rounded-lg border border-white/10 bg-slate-900/75 p-4">
        <h2 className="text-sm font-black uppercase text-slate-100">Team Path</h2>
        <p className="mt-4 text-sm text-slate-400">No accepted team path yet.</p>
      </section>
    );
  }

  const teamMatches = matches
    .filter((match) => match.homeTeam === selectedTeam || match.awayTeam === selectedTeam)
    .sort((first, second) => first.kickoffAt.localeCompare(second.kickoffAt));
  const finished = teamMatches.filter((match) => match.status === "finished");
  const nextMatch = teamMatches.find((match) => match.status !== "finished") ?? null;

  return (
    <section className="min-w-0 rounded-lg border border-white/10 bg-slate-900/75 p-4 shadow-xl shadow-black/20">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-black uppercase text-slate-100">Team Path</h2>
        <span className="text-xs font-semibold text-blue-300">
          {chosenTeam ? "Selected" : "Auto-selected"}
        </span>
      </div>
      <label className="mt-4 block">
        <span className="text-xs font-bold uppercase text-slate-500">Choose team</span>
        <select
          className="mt-2 h-10 w-full rounded-md border border-white/10 bg-slate-950/70 px-3 text-sm font-semibold text-slate-100 outline-none focus:border-blue-300/50 focus:ring-2 focus:ring-blue-300/25"
          onChange={(event) => setChosenTeam(event.target.value)}
          value={chosenTeam}
        >
          <option value="">
            {defaultTeam ? `Auto: ${getTeamDisplayName(defaultTeam)}` : "Select a team"}
          </option>
          {teamOptions.map((team) => (
            <option key={team.value} value={team.value}>
              {team.label}
            </option>
          ))}
        </select>
      </label>
      <p className="mt-2 text-xs text-slate-500">
        Select a team to inspect its route through accepted tournament data.
      </p>
      <div className="mt-4">
        <TeamName teamName={selectedTeam} />
      </div>
      <div className="mt-4 space-y-3 border-l border-slate-700 pl-4">
        {finished.slice(-4).map((match) => (
          <TeamPathMatch key={match.externalId} match={match} />
        ))}
        <div className="relative text-sm">
          <span className="absolute -left-[21px] top-1.5 h-2.5 w-2.5 rounded-full border border-slate-500 bg-slate-900" />
          <div className="text-xs font-semibold text-slate-400">
            {nextMatch ? formatStage(nextMatch.stage) : "Next step"}
          </div>
          <div className="mt-1 text-slate-300">
            {nextMatch
              ? `${formatKyivDateTime(nextMatch.kickoffAt)} Kyiv time`
              : "Pending"}
          </div>
        </div>
      </div>
    </section>
  );
}

function TeamPathMatch({ match }: { match: NormalizedMatch }) {
  const winMethodLabel = getWinMethodLabel(match);

  return (
    <div className="relative text-sm">
            <span className="absolute -left-[21px] top-1.5 h-2.5 w-2.5 rounded-full bg-emerald-400" />
            <div className="text-xs font-semibold text-slate-400">
              {formatStage(match.stage)}
            </div>
            <div className="mt-1 text-slate-100">
              {getTeamDisplayName(match.homeTeam)} {formatScore(match)}{" "}
              {getTeamDisplayName(match.awayTeam)}
            </div>
            {winMethodLabel ? (
              <div className="mt-1 text-xs font-semibold text-emerald-300">
                {winMethodLabel}
              </div>
            ) : null}
    </div>
  );
}

function pickTeam(matches: NormalizedMatch[]): string | null {
  const latestFinished = [...matches]
    .filter((match) => match.status === "finished")
    .sort((first, second) => second.kickoffAt.localeCompare(first.kickoffAt))[0];

  return latestFinished?.winner ?? latestFinished?.homeTeam ?? null;
}

function getTeamOptions(matches: NormalizedMatch[]): Array<{ value: string; label: string }> {
  const teams = new Map<string, string>();

  for (const match of matches) {
    for (const team of [match.homeTeam, match.awayTeam]) {
      const label = getTeamDisplayName(team);

      if (!isPlaceholderLabel(label)) {
        teams.set(team, label);
      }
    }
  }

  return [...teams.entries()]
    .map(([value, label]) => ({ value, label }))
    .sort((first, second) => first.label.localeCompare(second.label));
}

function isPlaceholderLabel(value: string): boolean {
  return /^(winner|loser) of /i.test(value) || value === "Unknown team";
}
