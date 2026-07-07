export const KYIV_TIME_ZONE = "Europe/Kyiv";
export const WORLDCUP26_SOURCE_TIME_ZONE = "America/New_York";

type DateTimeParts = {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
};

export type SourceDateTimeParseResult = {
  utcInstant: string;
  warning: string | null;
};

export function parseWorldCup26LocalDateToUtc(
  value: string,
): SourceDateTimeParseResult {
  const parts = parseSlashDateTime(value);

  if (!parts) {
    throw new Error(`Invalid worldcup26 local_date: ${value}`);
  }

  return {
    utcInstant: zonedDateTimeToUtcInstant(parts, WORLDCUP26_SOURCE_TIME_ZONE),
    warning:
      `worldcup26 local_date has no timezone offset; assumed ${WORLDCUP26_SOURCE_TIME_ZONE} before UTC/Kyiv conversion`,
  };
}

export function parseSourceDateAndTimeToUtc(
  date: string,
  time: string,
  sourceTimeZone: string,
): string {
  const parts = parseIsoDateAndClockTime(date, time);

  if (!parts) {
    throw new Error(`Invalid source date/time: ${date} ${time}`);
  }

  return zonedDateTimeToUtcInstant(parts, sourceTimeZone);
}

export function zonedDateTimeToUtcInstant(
  parts: DateTimeParts,
  timeZone: string,
): string {
  validateDateTimeParts(parts);

  const desiredAsUtc = Date.UTC(
    parts.year,
    parts.month - 1,
    parts.day,
    parts.hour,
    parts.minute,
  );
  let guess = desiredAsUtc;

  for (let attempt = 0; attempt < 3; attempt += 1) {
    const actualParts = getTimeZoneParts(new Date(guess), timeZone);
    const actualAsUtc = Date.UTC(
      actualParts.year,
      actualParts.month - 1,
      actualParts.day,
      actualParts.hour,
      actualParts.minute,
    );
    const delta = desiredAsUtc - actualAsUtc;

    if (delta === 0) {
      return new Date(guess).toISOString();
    }

    guess += delta;
  }

  return new Date(guess).toISOString();
}

function parseSlashDateTime(value: string): DateTimeParts | null {
  const match = value.match(
    /^(?<month>\d{1,2})\/(?<day>\d{1,2})\/(?<year>\d{4}) (?<hour>\d{1,2}):(?<minute>\d{2})$/,
  );

  if (!match?.groups) {
    return null;
  }

  return {
    year: Number(match.groups.year),
    month: Number(match.groups.month),
    day: Number(match.groups.day),
    hour: Number(match.groups.hour),
    minute: Number(match.groups.minute),
  };
}

function parseIsoDateAndClockTime(date: string, time: string): DateTimeParts | null {
  const dateMatch = date.match(
    /^(?<year>\d{4})-(?<month>\d{2})-(?<day>\d{2})$/,
  );
  const timeMatch = time.trim().match(
    /^(?<hour>\d{1,2}):(?<minute>\d{2})(?:\s*(?<period>AM|PM))?$/i,
  );

  if (!dateMatch?.groups || !timeMatch?.groups) {
    return null;
  }

  let hour = Number(timeMatch.groups.hour);
  const minute = Number(timeMatch.groups.minute);
  const period = timeMatch.groups.period?.toUpperCase();

  if (period === "AM" && hour === 12) {
    hour = 0;
  } else if (period === "PM" && hour !== 12) {
    hour += 12;
  }

  return {
    year: Number(dateMatch.groups.year),
    month: Number(dateMatch.groups.month),
    day: Number(dateMatch.groups.day),
    hour,
    minute,
  };
}

function getTimeZoneParts(date: Date, timeZone: string): DateTimeParts {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  });
  const values = Object.fromEntries(
    formatter
      .formatToParts(date)
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, part.value]),
  );

  return {
    year: Number(values.year),
    month: Number(values.month),
    day: Number(values.day),
    hour: Number(values.hour),
    minute: Number(values.minute),
  };
}

function validateDateTimeParts(parts: DateTimeParts): void {
  if (
    !Number.isInteger(parts.year) ||
    !Number.isInteger(parts.month) ||
    !Number.isInteger(parts.day) ||
    !Number.isInteger(parts.hour) ||
    !Number.isInteger(parts.minute) ||
    parts.month < 1 ||
    parts.month > 12 ||
    parts.day < 1 ||
    parts.day > 31 ||
    parts.hour < 0 ||
    parts.hour > 23 ||
    parts.minute < 0 ||
    parts.minute > 59
  ) {
    throw new Error(`Invalid date/time parts: ${JSON.stringify(parts)}`);
  }
}
