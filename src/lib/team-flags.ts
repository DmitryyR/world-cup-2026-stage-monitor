type TeamInfo = {
  displayName: string;
  flagCode: string;
  shortCode: string;
};

const teams: TeamInfo[] = [
  { displayName: "Algeria", flagCode: "dz", shortCode: "ALG" },
  { displayName: "Argentina", flagCode: "ar", shortCode: "ARG" },
  { displayName: "Australia", flagCode: "au", shortCode: "AUS" },
  { displayName: "Austria", flagCode: "at", shortCode: "AUT" },
  { displayName: "Belgium", flagCode: "be", shortCode: "BEL" },
  { displayName: "Bosnia and Herzegovina", flagCode: "ba", shortCode: "BIH" },
  { displayName: "Brazil", flagCode: "br", shortCode: "BRA" },
  { displayName: "Canada", flagCode: "ca", shortCode: "CAN" },
  { displayName: "Cape Verde", flagCode: "cv", shortCode: "CPV" },
  { displayName: "Colombia", flagCode: "co", shortCode: "COL" },
  { displayName: "Croatia", flagCode: "hr", shortCode: "CRO" },
  { displayName: "Curaçao", flagCode: "cw", shortCode: "CUR" },
  { displayName: "Czech Republic", flagCode: "cz", shortCode: "CZE" },
  { displayName: "Denmark", flagCode: "dk", shortCode: "DEN" },
  {
    displayName: "Democratic Republic of the Congo",
    flagCode: "cd",
    shortCode: "COD",
  },
  { displayName: "Ecuador", flagCode: "ec", shortCode: "ECU" },
  { displayName: "Egypt", flagCode: "eg", shortCode: "EGY" },
  { displayName: "England", flagCode: "gb-eng", shortCode: "ENG" },
  { displayName: "France", flagCode: "fr", shortCode: "FRA" },
  { displayName: "Germany", flagCode: "de", shortCode: "GER" },
  { displayName: "Ghana", flagCode: "gh", shortCode: "GHA" },
  { displayName: "Haiti", flagCode: "ht", shortCode: "HAI" },
  { displayName: "Iran", flagCode: "ir", shortCode: "IRN" },
  { displayName: "Iraq", flagCode: "iq", shortCode: "IRQ" },
  { displayName: "Italy", flagCode: "it", shortCode: "ITA" },
  { displayName: "Ivory Coast", flagCode: "ci", shortCode: "CIV" },
  { displayName: "Japan", flagCode: "jp", shortCode: "JPN" },
  { displayName: "Jordan", flagCode: "jo", shortCode: "JOR" },
  { displayName: "Mexico", flagCode: "mx", shortCode: "MEX" },
  { displayName: "Morocco", flagCode: "ma", shortCode: "MAR" },
  { displayName: "Netherlands", flagCode: "nl", shortCode: "NED" },
  { displayName: "New Zealand", flagCode: "nz", shortCode: "NZL" },
  { displayName: "Nigeria", flagCode: "ng", shortCode: "NGA" },
  { displayName: "Norway", flagCode: "no", shortCode: "NOR" },
  { displayName: "Panama", flagCode: "pa", shortCode: "PAN" },
  { displayName: "Paraguay", flagCode: "py", shortCode: "PAR" },
  { displayName: "Portugal", flagCode: "pt", shortCode: "POR" },
  { displayName: "Qatar", flagCode: "qa", shortCode: "QAT" },
  { displayName: "Scotland", flagCode: "gb-sct", shortCode: "SCO" },
  { displayName: "Senegal", flagCode: "sn", shortCode: "SEN" },
  { displayName: "Serbia", flagCode: "rs", shortCode: "SRB" },
  { displayName: "South Africa", flagCode: "za", shortCode: "RSA" },
  { displayName: "South Korea", flagCode: "kr", shortCode: "KOR" },
  { displayName: "Saudi Arabia", flagCode: "sa", shortCode: "KSA" },
  { displayName: "Spain", flagCode: "es", shortCode: "ESP" },
  { displayName: "Sweden", flagCode: "se", shortCode: "SWE" },
  { displayName: "Switzerland", flagCode: "ch", shortCode: "SUI" },
  { displayName: "Tunisia", flagCode: "tn", shortCode: "TUN" },
  { displayName: "Turkey", flagCode: "tr", shortCode: "TUR" },
  { displayName: "Ukraine", flagCode: "ua", shortCode: "UKR" },
  { displayName: "United States", flagCode: "us", shortCode: "USA" },
  { displayName: "Uruguay", flagCode: "uy", shortCode: "URU" },
  { displayName: "Uzbekistan", flagCode: "uz", shortCode: "UZB" },
];

const aliases: Record<string, TeamInfo> = {};

for (const team of teams) {
  aliases[normalizeTeamName(team.displayName)] = team;
  aliases[team.shortCode.toLowerCase()] = team;
  aliases[team.flagCode] = team;

  const countryCode = team.flagCode.length === 2 ? team.flagCode : undefined;

  if (countryCode) {
    aliases[countryCode] = team;
  }
}

aliases.bosnia = aliases["bosnia and herzegovina"];
aliases.ivory = aliases["ivory coast"];
aliases.usa = aliases["united states"];
aliases.us = aliases["united states"];
aliases.korea = aliases["south korea"];
aliases["korea republic"] = aliases["south korea"];
aliases.eng = aliases.england;
aliases.curacao = aliases["curaçao"];
aliases.cu = aliases["curaçao"];
aliases.tu = aliases.tunisia;
if (aliases.cw) {
  aliases.cw.displayName = "Curaçao";
  aliases.curacao = aliases.cw;
  aliases.cu = aliases.cw;
  aliases["curaçao"] = aliases.cw;
}
aliases.nz = aliases["new zealand"];
aliases.sa = aliases["saudi arabia"];
aliases.irq = aliases.iraq;
aliases.ir = aliases.iran;
aliases.dr = aliases["democratic republic of the congo"];
aliases.drc = aliases["democratic republic of the congo"];
aliases["dr congo"] = aliases["democratic republic of the congo"];

export function getTeamFlag(teamName: string | null | undefined): string | null {
  return findTeam(teamName)?.flagCode ?? null;
}

export function getTeamDisplayName(teamName: string | null | undefined): string {
  const displayInput = normalizeDisplayInput(teamName);
  const normalizedInput = displayInput.toLowerCase();

  if (!normalizedInput) {
    return "Unknown team";
  }

  return findTeam(displayInput)?.displayName ?? displayInput;
}

export function formatTeamName(teamName: string | null | undefined): string {
  return getTeamDisplayName(teamName);
}

export function formatPlaceholderTeam(teamName: string | null | undefined): string {
  return normalizeDisplayInput(teamName) || "TBD";
}

export function getTeamShortCode(teamName: string | null | undefined): string {
  const team = findTeam(teamName);

  if (team) {
    return team.shortCode;
  }

  const fallback = normalizeDisplayInput(teamName);

  if (!fallback) {
    return "TBD";
  }

  return fallback.slice(0, 3).toUpperCase();
}

export function getTeamFallbackInitials(teamName: string | null | undefined): string {
  const displayName = getTeamDisplayName(teamName);

  if (isFutureParticipantLabel(displayName) || displayName === "TBD") {
    return "TBD";
  }

  if (displayName === "Unknown team") {
    return "FC";
  }

  const words = displayName.split(/\s+/).filter(Boolean);

  if (words.length >= 2) {
    return `${words[0][0]}${words[1][0]}`.toUpperCase();
  }

  return displayName.slice(0, 2).toUpperCase();
}

function findTeam(teamName: string | null | undefined): TeamInfo | undefined {
  const normalizedName = normalizeTeamName(teamName);

  if (!normalizedName) {
    return undefined;
  }

  return aliases[normalizedName];
}

function normalizeTeamName(teamName: string | null | undefined): string {
  return normalizeDisplayInput(teamName)
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();
}

function normalizeDisplayInput(teamName: string | null | undefined): string {
  const normalized = teamName?.trim().replace(/\s+/g, " ") ?? "";
  const dependencyToken = normalized.match(/^(wm|lm)\s+(winner|loser)\s+match\s+(\d+)$/i);

  if (dependencyToken) {
    return `${capitalize(dependencyToken[2])} of Match ${dependencyToken[3]}`;
  }

  const cleanedPlaceholder = normalized
    .replace(/^wo\s+/i, "")
    .replace(/^lo\s+/i, "")
    .replace(/^winner\s+match\s+(\d+)$/i, "Winner of Match $1")
    .replace(/^loser\s+match\s+(\d+)$/i, "Loser of Match $1");
  const providerPrefixMatch = cleanedPlaceholder.match(/^[A-Z]{2}\s+(.+)$/);

  return providerPrefixMatch?.[1]?.trim() ?? cleanedPlaceholder;
}

function capitalize(value: string): string {
  return `${value.slice(0, 1).toUpperCase()}${value.slice(1).toLowerCase()}`;
}

function isFutureParticipantLabel(value: string): boolean {
  return /^(winner|loser) of /i.test(value);
}
