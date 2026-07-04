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
  { displayName: "Czech Republic", flagCode: "cz", shortCode: "CZE" },
  { displayName: "Denmark", flagCode: "dk", shortCode: "DEN" },
  { displayName: "Ecuador", flagCode: "ec", shortCode: "ECU" },
  { displayName: "Egypt", flagCode: "eg", shortCode: "EGY" },
  { displayName: "England", flagCode: "gb-eng", shortCode: "ENG" },
  { displayName: "France", flagCode: "fr", shortCode: "FRA" },
  { displayName: "Germany", flagCode: "de", shortCode: "GER" },
  { displayName: "Ghana", flagCode: "gh", shortCode: "GHA" },
  { displayName: "Haiti", flagCode: "ht", shortCode: "HAI" },
  { displayName: "Iran", flagCode: "ir", shortCode: "IRN" },
  { displayName: "Italy", flagCode: "it", shortCode: "ITA" },
  { displayName: "Ivory Coast", flagCode: "ci", shortCode: "CIV" },
  { displayName: "Japan", flagCode: "jp", shortCode: "JPN" },
  { displayName: "Mexico", flagCode: "mx", shortCode: "MEX" },
  { displayName: "Morocco", flagCode: "ma", shortCode: "MAR" },
  { displayName: "Netherlands", flagCode: "nl", shortCode: "NED" },
  { displayName: "Nigeria", flagCode: "ng", shortCode: "NGA" },
  { displayName: "Norway", flagCode: "no", shortCode: "NOR" },
  { displayName: "Paraguay", flagCode: "py", shortCode: "PAR" },
  { displayName: "Portugal", flagCode: "pt", shortCode: "POR" },
  { displayName: "Qatar", flagCode: "qa", shortCode: "QAT" },
  { displayName: "Scotland", flagCode: "gb-sct", shortCode: "SCO" },
  { displayName: "Senegal", flagCode: "sn", shortCode: "SEN" },
  { displayName: "Serbia", flagCode: "rs", shortCode: "SRB" },
  { displayName: "South Africa", flagCode: "za", shortCode: "RSA" },
  { displayName: "South Korea", flagCode: "kr", shortCode: "KOR" },
  { displayName: "Spain", flagCode: "es", shortCode: "ESP" },
  { displayName: "Sweden", flagCode: "se", shortCode: "SWE" },
  { displayName: "Switzerland", flagCode: "ch", shortCode: "SUI" },
  { displayName: "Turkey", flagCode: "tr", shortCode: "TUR" },
  { displayName: "Ukraine", flagCode: "ua", shortCode: "UKR" },
  { displayName: "United States", flagCode: "us", shortCode: "USA" },
  { displayName: "Uruguay", flagCode: "uy", shortCode: "URU" },
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

export function getTeamFlag(teamName: string | null | undefined): string | null {
  return findTeam(teamName)?.flagCode ?? null;
}

export function getTeamDisplayName(teamName: string | null | undefined): string {
  const normalizedInput = normalizeTeamName(teamName);

  if (!normalizedInput) {
    return "Unknown team";
  }

  return findTeam(teamName)?.displayName ?? teamName?.trim() ?? "Unknown team";
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
  return normalizeDisplayInput(teamName).toLowerCase();
}

function normalizeDisplayInput(teamName: string | null | undefined): string {
  return teamName?.trim().replace(/\s+/g, " ") ?? "";
}
