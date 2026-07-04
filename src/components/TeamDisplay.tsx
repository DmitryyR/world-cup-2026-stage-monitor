import {
  getTeamDisplayName,
  getTeamFallbackInitials,
  getTeamFlag,
  getTeamShortCode,
} from "@/lib/team-flags";

type TeamDisplayProps = {
  teamName: string | null | undefined;
  align?: "left" | "center" | "right";
  variant?: "full" | "compact";
  showCode?: boolean;
};

export function TeamDisplay({
  teamName,
  align = "left",
  variant = "full",
  showCode = false,
}: TeamDisplayProps) {
  const displayName = getTeamDisplayName(teamName);
  const flagCode = getTeamFlag(teamName);
  const fallbackInitials = getTeamFallbackInitials(teamName);
  const shortCode = getTeamShortCode(teamName);
  const shouldShowCode =
    showCode && shortCode !== "TBD" && shortCode.toLowerCase() !== displayName.toLowerCase();

  const alignmentClass =
    align === "right"
      ? "items-end text-right"
      : align === "center"
        ? "items-center text-center"
        : "items-start text-left";
  const flagSizeClass =
    variant === "compact" ? "h-8 w-8" : "h-11 w-11";
  const flagInnerSizeClass = variant === "compact" ? "text-xl" : "text-3xl";
  const nameClass =
    variant === "compact"
      ? "text-sm font-semibold leading-tight"
      : "text-sm font-bold leading-tight";

  return (
    <span className={`flex min-w-0 flex-col gap-2 ${alignmentClass}`}>
      <span
        className={`flex shrink-0 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-white shadow-sm ${flagSizeClass}`}
        aria-hidden="true"
      >
        {flagCode ? (
          <span className={`fi fi-${flagCode} ${flagInnerSizeClass}`} />
        ) : (
          <span className="flex h-full w-full items-center justify-center bg-slate-100 text-[11px] font-black uppercase text-slate-500">
            {fallbackInitials}
          </span>
        )}
      </span>
      <span className="min-w-0">
        <span className={`block max-w-full break-words text-slate-950 ${nameClass}`}>
          {displayName}
        </span>
        {shouldShowCode ? (
          <span className="mt-0.5 block text-[11px] font-bold uppercase tracking-normal text-slate-400">
            {shortCode}
          </span>
        ) : null}
      </span>
    </span>
  );
}
