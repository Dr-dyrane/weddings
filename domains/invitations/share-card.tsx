import "server-only";

import { ImageResponse } from "next/og";

import type { InvitationProjection } from "@/domains/invitations/invitation";
import { getWeddingDayProgress } from "@/domains/invitations/wedding-progress";
import { getWeddingOpeningPortrait } from "@/domains/weddings/opening-portrait";
import type { PublishedWedding } from "@/domains/weddings/published-wedding";

async function getSpaceGroteskFont(requestUrl: string) {
  const response = await fetch(
    new URL("/fonts/dyrane-space-grotesk.ttf", requestUrl),
  );

  if (!response.ok) {
    throw new Error("Unable to load the share-card font.");
  }

  return response.arrayBuffer();
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

export async function createInvitationShareCard(
  wedding: PublishedWedding,
  invitation: InvitationProjection,
  requestUrl: string,
) {
  void invitation;
  return createShareCard(wedding, requestUrl);
}

export async function createDyraneShareCard(requestUrl: string) {
  return createShareCard(null, requestUrl);
}

async function createShareCard(
  wedding: PublishedWedding | null,
  requestUrl: string,
) {
  const spaceGroteskFont = await getSpaceGroteskFont(requestUrl);
  const couplePortrait = wedding
    ? getWeddingOpeningPortrait(wedding)
    : null;
  const coupleLine = wedding
    ? `${wedding.couple.first} & ${wedding.couple.second}`
    : "Dyrane Weddings";
  const { date } = wedding
    ? splitDateLabel(wedding.dateLabel)
    : { date: "00 00" };
  const progress = wedding
    ? getWeddingDayProgress(wedding.dateLabel, wedding.timezone)
    : 1;
  const loadingWidth = `${Math.round(progress * 1000) / 10}%`;
  const loadingColor = wedding ? "#FFD21E" : "#FFFFFF";

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
            src={new URL(couplePortrait, requestUrl).toString()}
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
              background: loadingColor,
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
          data: spaceGroteskFont,
          style: "normal",
          weight: 500,
        },
      ],
    },
  );
}
