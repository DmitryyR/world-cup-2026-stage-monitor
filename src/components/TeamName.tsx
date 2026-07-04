import {
  getTeamDisplayName,
  getTeamFallbackInitials,
  getTeamFlag,
} from "@/lib/team-flags";

type TeamNameProps = {
  teamName: string;
  muted?: boolean;
  align?: "left" | "right";
};

export function TeamName({ teamName, muted = false, align = "left" }: TeamNameProps) {
  const flagCode = getTeamFlag(teamName);
  const displayName = getTeamDisplayName(teamName);
  const initials = getTeamFallbackInitials(teamName);

  return (
    <span
      className={`flex min-w-0 items-center gap-2 ${
        align === "right" ? "justify-end text-right" : ""
      } ${muted ? "text-slate-400" : "text-slate-100"}`}
    >
      <span className="flex h-6 w-8 shrink-0 items-center justify-center overflow-hidden rounded bg-slate-800 ring-1 ring-white/10">
        {flagCode ? (
          <span className={`fi fi-${flagCode} text-xl`} aria-hidden="true" />
        ) : (
          <span className="text-[10px] font-black text-slate-400">{initials}</span>
        )}
      </span>
      <span className="truncate text-sm font-semibold">{displayName}</span>
    </span>
  );
}
