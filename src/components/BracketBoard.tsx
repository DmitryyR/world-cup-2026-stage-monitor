import { Trophy } from "lucide-react";
import {
  buildBracketModel,
  formatWinMethodLabel,
  type BracketMatch,
  type BracketRound as BracketRoundModel,
} from "@/domain/bracket-builder";
import type { NormalizedMatch, TournamentStage } from "@/domain/types";
import { formatKyivDateTime } from "@/lib/date-format";
import { formatScore, formatStage } from "@/lib/format";
import { StatusBadge } from "./StatusBadge";
import { TeamName } from "./TeamName";

type BracketBoardProps = {
  matches: NormalizedMatch[];
};

type BracketSide = "left" | "right";

const bracketStages: TournamentStage[] = [
  "round_of_32",
  "round_of_16",
  "quarter_final",
  "semi_final",
];

export function BracketBoard({ matches }: BracketBoardProps) {
  const bracket = buildBracketModel(matches);
  const finalMatch = getRound(bracket.rounds, "final").matches[0] ?? null;
  const thirdPlaceMatch = getRound(bracket.rounds, "third_place").matches[0] ?? null;

  return (
    <section className="w-full min-w-0 overflow-hidden rounded-lg border border-white/10 bg-slate-950/70 shadow-2xl shadow-black/30">
      <div className="border-b border-white/10 px-4 py-3 sm:px-5 sm:py-4">
        <div className="text-xs font-black uppercase tracking-normal text-blue-300">
          Knockout Tree
        </div>
        <h1 className="mt-1 text-lg font-black uppercase text-slate-50">
          Tournament Bracket
        </h1>
      </div>

      <div className="w-full overflow-x-auto overflow-y-visible overscroll-x-contain pb-4">
        <div className="relative min-w-[1800px] overflow-visible bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.12),transparent_35%),linear-gradient(180deg,rgba(15,23,42,0.88),rgba(2,6,23,0.96))] p-5">
          <div className="pointer-events-none absolute inset-x-0 top-1/2 h-px bg-gradient-to-r from-transparent via-blue-300/25 to-transparent" />
          <div className="grid grid-cols-[250px_220px_200px_180px_280px_180px_200px_220px_250px] items-start gap-5">
            {bracketStages.map((stage) => (
              <BracketRoundColumn
                key={`left-${stage}`}
                matches={getSideMatches(getRound(bracket.rounds, stage), "left")}
                side="left"
                stage={stage}
              />
            ))}

            <CenterFinalColumn finalMatch={finalMatch} thirdPlaceMatch={thirdPlaceMatch} />

            {[...bracketStages].reverse().map((stage) => (
              <BracketRoundColumn
                key={`right-${stage}`}
                matches={getSideMatches(getRound(bracket.rounds, stage), "right")}
                side="right"
                stage={stage}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function BracketRoundColumn({
  stage,
  matches,
  side,
}: {
  stage: TournamentStage;
  matches: BracketMatch[];
  side: BracketSide;
}) {
  return (
    <div className={getColumnClass(stage)}>
      <RoundHeader matches={matches} side={side} stage={stage} />
      <div className={getRoundStackClass(stage)}>
        {matches.map((match) => (
          <BracketMatchCard key={match.externalId} match={match} side={side} />
        ))}
        {matches.length === 0 ? <PendingSlot /> : null}
      </div>
    </div>
  );
}

function CenterFinalColumn({
  finalMatch,
  thirdPlaceMatch,
}: {
  finalMatch: BracketMatch | null;
  thirdPlaceMatch: BracketMatch | null;
}) {
  const champion = finalMatch?.winner ?? null;

  return (
    <div className="relative flex min-h-[780px] flex-col items-center justify-start px-1 pt-16">
      <div className="relative z-10 w-full rounded-xl border border-amber-300/30 bg-amber-400/10 p-4 text-center shadow-2xl shadow-amber-950/20">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-400/15 text-amber-200 ring-1 ring-amber-200/35">
          <Trophy aria-hidden="true" size={30} />
        </div>
        <div className="mt-3 text-xs font-black uppercase tracking-[0.18em] text-amber-200">
          World Champion
        </div>
        <div className="mt-3 rounded-lg border border-white/10 bg-slate-950/70 p-3">
          {champion ? (
            <TeamName teamName={champion} />
          ) : (
            <div className="text-2xl font-black uppercase text-slate-300">TBD</div>
          )}
        </div>
      </div>

      <div className="my-8 h-12 w-px bg-gradient-to-b from-amber-200/40 to-blue-300/25" />

      <div className="relative w-full">
        <div className="absolute -left-5 top-1/2 h-px w-5 bg-blue-300/30" />
        <div className="absolute -right-5 top-1/2 h-px w-5 bg-blue-300/30" />
        {finalMatch ? (
          <BracketMatchCard centerLabel="Final" match={finalMatch} side="center" />
        ) : (
          <CenterPendingMatch label="Final" />
        )}
      </div>

      <div className="mt-10 h-16 w-px bg-gradient-to-b from-blue-300/25 to-slate-600/40" />

      <div className="w-full">
        <div className="mb-2 text-center text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">
          Bronze Final
        </div>
        {thirdPlaceMatch ? (
          <BracketMatchCard
            centerLabel="Third Place Match"
            match={thirdPlaceMatch}
            side="center"
          />
        ) : (
          <CenterPendingMatch label="Third Place Match" />
        )}
      </div>
    </div>
  );
}

function RoundHeader({
  stage,
  matches,
  side,
}: {
  stage: TournamentStage;
  matches: BracketMatch[];
  side: BracketSide;
}) {
  return (
    <div
      className={`mb-4 ${side === "right" ? "text-right" : "text-left"}`}
    >
      <div className="text-xs font-black uppercase text-slate-100">
        {formatStage(stage)}
      </div>
      <div className="mt-1 text-xs text-slate-500">
        {matches.length * 2 || "-"} teams
      </div>
    </div>
  );
}

function BracketMatchCard({
  match,
  side,
  centerLabel,
}: {
  match: BracketMatch;
  side: BracketSide | "center";
  centerLabel?: string;
}) {
  const status = match.needsReview ? "needs_review" : match.status;
  const winMethod = formatWinMethodLabel(match);

  return (
    <article
      className={`relative rounded-lg border border-white/10 bg-slate-900/90 p-2.5 shadow-lg shadow-black/25 ${getConnectorClass(
        side,
      )}`}
    >
      <div className="flex items-start justify-between gap-2">
        <StatusBadge status={status} />
        <span className="min-w-0 text-right text-[10px] leading-snug text-slate-500">
          {centerLabel ?? formatKyivDateTime(match.kickoffAt)}
        </span>
      </div>
      <div className="mt-2.5 space-y-1.5">
        <TeamRow
          score={match.homeScore}
          teamName={match.homeParticipant.label}
          muted={
            !match.homeParticipant.dependency?.resolvedTeam &&
            Boolean(match.homeParticipant.dependency)
          }
          winner={
            match.winner === match.homeTeam || match.winner === match.homeParticipant.label
          }
        />
        <TeamRow
          score={match.awayScore}
          teamName={match.awayParticipant.label}
          muted={
            !match.awayParticipant.dependency?.resolvedTeam &&
            Boolean(match.awayParticipant.dependency)
          }
          winner={
            match.winner === match.awayTeam || match.winner === match.awayParticipant.label
          }
        />
      </div>
      <div className="mt-2.5 text-[11px] leading-snug text-slate-400">
        {status === "needs_review"
          ? match.reviewReason ?? "Finished match needs winner review"
          : winMethod ?? (match.status === "live" ? "Live now" : formatScore(match))}
      </div>
    </article>
  );
}

function TeamRow({
  teamName,
  score,
  muted,
  winner,
}: {
  teamName: string;
  score: number | null;
  muted: boolean;
  winner: boolean;
}) {
  return (
    <div className="flex min-w-0 items-center justify-between gap-2">
      <TeamName muted={muted} teamName={teamName} />
      <span
        className={`shrink-0 text-base font-black ${
          winner ? "text-emerald-300" : "text-slate-100"
        }`}
      >
        {score ?? ""}
      </span>
    </div>
  );
}

function CenterPendingMatch({ label }: { label: string }) {
  return (
    <div className="rounded-lg border border-dashed border-white/10 bg-white/[0.03] p-3 text-center">
      <div className="text-[11px] font-black uppercase text-slate-500">{label}</div>
      <div className="mt-2 text-sm font-black text-slate-300">TBD vs TBD</div>
    </div>
  );
}

function PendingSlot() {
  return (
    <div className="rounded-lg border border-dashed border-white/10 bg-white/[0.03] p-3 text-center text-sm text-slate-500">
      Pending
    </div>
  );
}

function getRound(rounds: BracketRoundModel[], stage: TournamentStage): BracketRoundModel {
  return rounds.find((round) => round.stage === stage) ?? { stage, matches: [] };
}

function getSideMatches(round: BracketRoundModel, side: BracketSide): BracketMatch[] {
  const midpoint = Math.ceil(round.matches.length / 2);

  return side === "left"
    ? round.matches.slice(0, midpoint)
    : round.matches.slice(midpoint).reverse();
}

function getColumnClass(stage: TournamentStage): string {
  if (stage === "round_of_32") {
    return "pt-0";
  }

  if (stage === "round_of_16") {
    return "pt-16";
  }

  if (stage === "quarter_final") {
    return "pt-32";
  }

  return "pt-52";
}

function getRoundStackClass(stage: TournamentStage): string {
  if (stage === "round_of_32") {
    return "space-y-3";
  }

  if (stage === "round_of_16") {
    return "space-y-8";
  }

  if (stage === "quarter_final") {
    return "space-y-20";
  }

  return "space-y-44";
}

function getConnectorClass(side: BracketSide | "center"): string {
  if (side === "left") {
    return "after:absolute after:left-full after:top-1/2 after:h-px after:w-5 after:bg-blue-300/30";
  }

  if (side === "right") {
    return "before:absolute before:right-full before:top-1/2 before:h-px before:w-5 before:bg-blue-300/30";
  }

  return "";
}
