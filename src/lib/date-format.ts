import { KYIV_TIME_ZONE } from "./date-time";
const APP_LOCALE = "en-US";

export function formatKyivDateTime(date: string | Date | null | undefined): string {
  const parsedDate = parseDate(date);

  if (!parsedDate) {
    return "Invalid date";
  }

  return new Intl.DateTimeFormat(APP_LOCALE, {
    timeZone: KYIV_TIME_ZONE,
    dateStyle: "medium",
    timeStyle: "short",
  }).format(parsedDate);
}

export function formatKyivDate(date: string | Date | null | undefined): string {
  const parsedDate = parseDate(date);

  if (!parsedDate) {
    return "Invalid date";
  }

  return new Intl.DateTimeFormat(APP_LOCALE, {
    timeZone: KYIV_TIME_ZONE,
    dateStyle: "medium",
  }).format(parsedDate);
}

function parseDate(date: string | Date | null | undefined): Date | null {
  if (!date) {
    return null;
  }

  const parsedDate = date instanceof Date ? date : new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return null;
  }

  return parsedDate;
}
