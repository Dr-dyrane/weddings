function zonedCalendarDay(now: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-US", {
    day: "2-digit",
    month: "2-digit",
    timeZone,
    year: "numeric",
  }).formatToParts(now);
  const value = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((part) => part.type === type)?.value ?? 0);

  return Date.UTC(value("year"), value("month") - 1, value("day"));
}

export function getWeddingDateParts(dateLabel: string) {
  const weddingDate = new Date(Date.parse(dateLabel));
  if (Number.isNaN(weddingDate.getTime())) {
    return { day: 1, month: 1, year: 0 };
  }

  return {
    day: weddingDate.getUTCDate(),
    month: weddingDate.getUTCMonth() + 1,
    year: weddingDate.getUTCFullYear(),
  };
}

export function getWeddingDayProgress(
  dateLabel: string,
  timeZone: string,
  now = new Date(),
) {
  const weddingDate = new Date(Date.parse(dateLabel));
  if (Number.isNaN(weddingDate.getTime())) return 0;

  const end = Date.UTC(
    weddingDate.getUTCFullYear(),
    weddingDate.getUTCMonth(),
    weddingDate.getUTCDate(),
  );
  const start = Date.UTC(weddingDate.getUTCFullYear() - 1, 0, 1);
  const today = zonedCalendarDay(now, timeZone);

  return Math.min(1, Math.max(0, (today - start) / (end - start)));
}
