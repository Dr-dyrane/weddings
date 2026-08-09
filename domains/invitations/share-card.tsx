import "server-only";

import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";

import type { InvitationProjection } from "@/domains/invitations/invitation";
import type { PublishedWedding } from "@/domains/weddings/published-wedding";

const spaceGroteskFontPromise = readFile(
  path.join(process.cwd(), "public/fonts/dyrane-space-grotesk.ttf"),
);

const couplePortraitPromises = {
  "alexander-chioma-line-v5": readFile(
    path.join(
      process.cwd(),
      "docs/references/visual/alexander-chioma-line-portrait-v5.png",
    ),
  ),
} as const;

function asArrayBuffer(font: Buffer) {
  return font.buffer.slice(
    font.byteOffset,
    font.byteOffset + font.byteLength,
  ) as ArrayBuffer;
}

function codePointLength(value: string) {
  return Array.from(value).length;
}

function splitDateLabel(value: string) {
  const normalized = value.trim();
  const parsedDate = /\d{4}$/u.test(normalized)
    ? new Date(Date.parse(normalized))
    : null;

  if (parsedDate && !Number.isNaN(parsedDate.getTime())) {
    return {
      date: `${String(parsedDate.getUTCMonth() + 1).padStart(2, "0")} ${String(parsedDate.getUTCDate()).padStart(2, "0")}`,
      year: String(parsedDate.getUTCFullYear()),
    };
  }

  const match = normalized.match(/^(.*?)(?:,\s*|\s+)(\d{4})$/u);

  if (!match) {
    return { date: normalized, year: "" };
  }

  return {
    date: match[1].trim(),
    year: match[2],
  };
}

function fittedCoupleSize(value: string) {
  const length = codePointLength(value);
  if (length > 42) return "16px";
  if (length > 32) return "18px";
  if (length > 24) return "20px";
  return "22px";
}

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

export async function createInvitationShareCard(
  wedding: PublishedWedding,
  invitation: InvitationProjection,
) {
  void invitation;
  return createShareCard(wedding);
}

export async function createDyraneShareCard() {
  return createShareCard(null);
}

async function createShareCard(wedding: PublishedWedding | null) {
  const spaceGroteskFont = await spaceGroteskFontPromise;
  const portraitAsset = wedding?.shareCard?.portraitAsset;
  const couplePortrait = portraitAsset
    ? await couplePortraitPromises[portraitAsset]
    : null;
  const coupleLine = wedding
    ? `${wedding.couple.first} & ${wedding.couple.second}`
    : "Dyrane Weddings";
  const { date } = splitDateLabel(
    wedding?.dateLabel ?? "Personal Invitations 2027",
  );
  const progress = wedding
    ? getWeddingDayProgress(wedding.dateLabel, wedding.timezone)
    : 0.28;
  const loadingWidth = `${Math.round(progress * 1000) / 10}%`;

  return new ImageResponse(
    (
      <div
        style={{
          background: "#000000",
          color: "#ffffff",
          display: "flex",
          fontFamily: "Space Grotesk",
          height: "100%",
          overflow: "hidden",
          position: "relative",
          width: "100%",
        }}
      >
        {couplePortrait ? (
          // ImageResponse renders a plain image element from the embedded asset.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            alt=""
            src={`data:image/png;base64,${couplePortrait.toString("base64")}`}
            style={{
              height: "690px",
              opacity: wedding?.shareCard?.portraitOpacity ?? 0,
              position: "absolute",
              right: "-15px",
              top: "-30px",
              width: "460px",
            }}
          />
        ) : null}

        <div
          style={{
            display: "flex",
            fontSize: fittedCoupleSize(coupleLine),
            fontWeight: 500,
            left: "28px",
            letterSpacing: "-1px",
            lineHeight: 1,
            position: "absolute",
            top: "28px",
            whiteSpace: "nowrap",
          }}
        >
          {coupleLine}
        </div>

        <div
          style={{
            display: "flex",
            height: "34px",
            left: "50%",
            position: "absolute",
            top: "50%",
            transform: "translate(-50%, -50%)",
            width: "170px",
          }}
        >
          <div
            style={{
              background: "#FFD21E",
              display: "flex",
              height: "100%",
              width: loadingWidth,
            }}
          />
        </div>

        <div
          style={{
            bottom: "18px",
            display: "flex",
            fontSize: "96px",
            fontWeight: 500,
            left: "28px",
            letterSpacing: "-5px",
            lineHeight: 0.8,
            position: "absolute",
            whiteSpace: "nowrap",
          }}
        >
          {date}
        </div>

      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: [
        {
          name: "Space Grotesk",
          data: asArrayBuffer(spaceGroteskFont),
          style: "normal",
          weight: 500,
        },
      ],
    },
  );
}
