import { ArrowDown, ArrowRight, Circle, Trophy } from "lucide-react";
import type { TournamentPathStage } from "@/lib/tournament-path";
import { getTeamDisplayName, getTeamFlag } from "@/lib/team-flags";
import { TeamDisplay } from "./TeamDisplay";

type TournamentPathProps = {
  stages: TournamentPathStage[];
};

const stageToneClasses: Record<TournamentPathStage["status"], string> = {
  completed: "border-slate-200 bg-white text-slate-700",
  current: "border-emerald-300 bg-emerald-50 text-emerald-900 shadow-emerald-100",
  future: "border-slate-200 bg-slate-50 text-slate-400",
};

const stageWidthClasses: Record<TournamentPathStage["id"], string> = {
  group_stage: "md:w-[240px] md:min-w-[240px]",
  round_of_32: "md:w-[260px] md:min-w-[260px]",
  round_of_16: "md:w-[180px] md:min-w-[180px]",
  quarter_final: "md:w-[160px] md:min-w-[160px]",
  semi_final: "md:w-[160px] md:min-w-[160px]",
  final: "md:w-[140px] md:min-w-[140px]",
  champion: "md:w-[140px] md:min-w-[140px]",
};

export function TournamentPath({ stages }: TournamentPathProps) {
  return (
    <section className="space-y-4">
      <div className="overflow-x-auto pb-4">
        <div className="flex min-w-0 flex-col gap-4 md:min-w-max md:flex-row md:items-stretch md:gap-5">
          {stages.map((stage, index) => (
            <div
              key={stage.id}
              className="flex min-w-0 flex-col gap-3 md:flex-row md:items-center md:gap-4"
            >
              <PathStageCard stage={stage} />
              {index < stages.length - 1 ? (
                <div className="flex shrink-0 items-center justify-center text-slate-300">
                  <ArrowRight
                    aria-hidden="true"
                    className="hidden md:block"
                    size={22}
                    strokeWidth={2.4}
                  />
                  <ArrowDown
                    aria-hidden="true"
                    className="md:hidden"
                    size={22}
                    strokeWidth={2.4}
                  />
                </div>
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function PathStageCard({ stage }: { stage: TournamentPathStage }) {
  const isChampion = stage.id === "champion";
  const toneClass = isChampion
    ? "border-violet-200 bg-violet-50 text-violet-950 shadow-violet-100"
    : stageToneClasses[stage.status];
  const widthClass = stageWidthClasses[stage.id];

  return (
    <article
      className={`flex w-full min-w-0 flex-col rounded-lg border p-4 shadow-sm ${widthClass} ${toneClass}`}
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="max-w-full break-words text-xs font-black uppercase leading-snug tracking-normal opacity-70">
            {stage.label}
          </div>
          <div className="mt-1 text-3xl font-black">
            {stage.slotCount}
            <span className="ml-1 text-sm font-bold uppercase opacity-60">slots</span>
          </div>
        </div>
        <div className="shrink-0">
          <StageStatusBadge stage={stage} />
        </div>
      </div>

      <div className="mt-4 min-h-28">
        {isChampion ? <ChampionSlot stage={stage} /> : <TeamSlotGrid stage={stage} />}
      </div>
    </article>
  );
}

function StageStatusBadge({ stage }: { stage: TournamentPathStage }) {
  if (stage.id === "champion") {
    return (
      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-violet-600 text-white">
        <Trophy aria-hidden="true" size={18} />
      </span>
    );
  }

  if (stage.status === "current") {
    return (
      <span className="inline-flex whitespace-nowrap rounded-full bg-emerald-600 px-2.5 py-1 text-xs font-bold uppercase text-white">
        Current
      </span>
    );
  }

  if (stage.status === "completed") {
    return (
      <span className="inline-flex whitespace-nowrap rounded-full bg-slate-900 px-2.5 py-1 text-xs font-bold uppercase text-white">
        Complete
      </span>
    );
  }

  return (
    <span className="inline-flex whitespace-nowrap rounded-full bg-slate-200 px-2.5 py-1 text-xs font-bold uppercase text-slate-500">
      Future
    </span>
  );
}

function ChampionSlot({ stage }: { stage: TournamentPathStage }) {
  const champion = stage.teams[0];

  if (!champion) {
    return (
      <div className="flex h-full min-h-28 flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-violet-200 bg-white/70 px-3 py-5 text-center text-violet-400">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-lime-300 text-lime-700">
          <Circle aria-hidden="true" size={18} fill="currentColor" strokeWidth={0} />
        </span>
        <div className="text-sm font-bold">Champion pending</div>
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-28 items-center justify-center rounded-lg bg-white/75 px-3 py-5">
      <TeamDisplay align="center" teamName={champion} />
    </div>
  );
}

function TeamSlotGrid({ stage }: { stage: TournamentPathStage }) {
  const knownTeams = stage.teams.slice(0, stage.slotCount);
  const placeholders = Array.from({ length: stage.placeholderCount });

  return (
    <div className="flex flex-wrap gap-2">
      {knownTeams.map((team) => (
        <TeamFlagDot key={team} team={team} muted={stage.status === "future"} />
      ))}
      {placeholders.map((_, index) => (
        <span
          key={`placeholder-${index}`}
          className="h-7 w-7 rounded-full border border-dashed border-slate-300 bg-slate-100"
          title="Slot pending"
        />
      ))}
    </div>
  );
}

function TeamFlagDot({ team, muted }: { team: string; muted: boolean }) {
  const flagCode = getTeamFlag(team);
  const displayName = getTeamDisplayName(team);

  return (
    <span
      className={`flex h-7 w-7 items-center justify-center overflow-hidden rounded-full border border-white bg-white shadow-sm ${
        muted ? "opacity-55 grayscale" : ""
      }`}
      title={displayName}
      aria-label={displayName}
    >
      {flagCode ? (
        <span className={`fi fi-${flagCode} text-lg`} aria-hidden="true" />
      ) : (
        <span className="h-2.5 w-2.5 rounded-full bg-slate-300" aria-hidden="true" />
      )}
    </span>
  );
}
