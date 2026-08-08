import { createEvents, type DateArray } from "ics";

import type { PublishedWedding } from "@/domains/weddings/published-wedding";

function toUtcArray(value: string): DateArray {
  const date = new Date(value);
  return [
    date.getUTCFullYear(),
    date.getUTCMonth() + 1,
    date.getUTCDate(),
    date.getUTCHours(),
    date.getUTCMinutes(),
  ];
}

export function createWeddingCalendar(wedding: PublishedWedding) {
  const { error, value } = createEvents(
    wedding.events.map((event) => ({
      start: toUtcArray(event.startsAt),
      end: toUtcArray(event.endsAt),
      startInputType: "utc" as const,
      startOutputType: "utc" as const,
      endInputType: "utc" as const,
      endOutputType: "utc" as const,
      title: `${wedding.couple.first} & ${wedding.couple.second} — ${event.title}`,
      description: `${event.title} for the wedding celebration of ${wedding.couple.first} and ${wedding.couple.second}.`,
      location: `${event.venue}, ${event.address}`,
      status: "CONFIRMED" as const,
      busyStatus: "BUSY" as const,
      uid: `${wedding.id}-${event.id}@weddings.dyrane.tech`,
      sequence: wedding.revision,
    })),
    {
      calName: `${wedding.couple.first} & ${wedding.couple.second}`,
      productId: "dyrane.tech/weddings",
    },
  );

  if (error || !value) {
    throw error ?? new Error("The calendar could not be created.");
  }

  return value;
}
