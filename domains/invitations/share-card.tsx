import "server-only";

import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";

import type { InvitationProjection } from "@/domains/invitations/invitation";
import type { PublishedWedding } from "@/domains/weddings/published-wedding";

const artPromise = readFile(
  path.join(process.cwd(), "public/og/modern-heirloom-card.jpg"),
);
const fontPromise = readFile(
  path.join(process.cwd(), "public/fonts/dyrane-invitation-serif.ttf"),
);

function codePointLength(value: string) {
  return Array.from(value).length;
}

function fittedNameSize(value: string, personalized: boolean) {
  const length = codePointLength(value);
  if (length > 52) return "34px";
  if (length > 40) return "38px";
  if (length > 30) return "44px";
  if (length > 22) return "50px";
  return personalized ? "58px" : "52px";
}

export async function createInvitationShareCard(
  wedding: PublishedWedding,
  invitation: InvitationProjection,
) {
  return createShareCard(wedding, invitation);
}

export async function createDyraneShareCard() {
  return createShareCard(null, null);
}

async function createShareCard(
  wedding: PublishedWedding | null,
  invitation: InvitationProjection | null,
) {
  const [art, font] = await Promise.all([artPromise, fontPromise]);
  const artData = `data:image/jpeg;base64,${art.toString("base64")}`;
  const fontData = font.buffer.slice(
    font.byteOffset,
    font.byteOffset + font.byteLength,
  ) as ArrayBuffer;
  const coupleLine = wedding
    ? `${wedding.couple.first} & ${wedding.couple.second}`
    : "Dyrane Weddings";
  const coupleLineLength = codePointLength(coupleLine);
  const recipient = invitation?.salutation ?? "Beautifully told";
  const detailLine = wedding
    ? `${wedding.dateLabel} · ${wedding.locationLabel}`
    : "An invitation experience by Dyrane";

  return new ImageResponse(
    (
      <div
        style={{
          alignItems: "center",
          background: "#f3eadc",
          display: "flex",
          height: "100%",
          justifyContent: "center",
          position: "relative",
          width: "100%",
        }}
      >
        {/* Satori supports an inline raster source more reliably than CSS cover. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          alt=""
          height="630"
          src={artData}
          style={{ height: "630px", left: 0, position: "absolute", top: 0, width: "1200px" }}
          width="1200"
        />
        <div
          style={{
            alignItems: "center",
            background: "#b8873f",
            border: "3px solid #d7b36e",
            borderRadius: "999px",
            boxShadow: "0 8px 18px rgba(48, 25, 16, .28)",
            display: "flex",
            height: "146px",
            justifyContent: "center",
            left: "893px",
            position: "absolute",
            top: "468px",
            width: "146px",
          }}
        >
          <div
            style={{
              border: "2px solid rgba(255, 231, 179, .58)",
              borderRadius: "999px",
              display: "flex",
              height: "108px",
              width: "108px",
            }}
          />
        </div>
        <div
          style={{
            alignItems: "center",
            color: "#29161f",
            display: "flex",
            flexDirection: "column",
            height: "420px",
            justifyContent: "center",
            left: "110px",
            position: "absolute",
            textAlign: "center",
            top: "92px",
            width: "790px",
          }}
        >
          <div
            style={{
              color: "#7b5a2f",
              display: "flex",
              fontFamily: "Dyrane Invitation",
              fontSize: coupleLineLength > 42 ? "16px" : "22px",
              letterSpacing: coupleLineLength > 42 ? "4px" : "7px",
              marginBottom: "22px",
              textTransform: "uppercase",
            }}
          >
            {coupleLine}
          </div>
          <div
            style={{
              display: "flex",
              fontFamily: "Dyrane Invitation",
              fontSize: "17px",
              letterSpacing: "3px",
              marginBottom: "22px",
              textTransform: "uppercase",
            }}
          >
            {wedding
              ? "request the pleasure of the company of"
              : "A personal invitation"}
          </div>
          <div
            style={{
              color: "#351a27",
              display: "flex",
              fontFamily: "Dyrane Invitation",
              fontSize: fittedNameSize(
                recipient,
                invitation?.kind === "personalized",
              ),
              flexWrap: "wrap",
              justifyContent: "center",
              lineHeight: 0.98,
              marginBottom: "24px",
              maxWidth: "730px",
            }}
          >
            {recipient}
          </div>
          <div
            style={{
              display: "flex",
              fontFamily: "Dyrane Invitation",
              fontSize: "18px",
              letterSpacing: "2px",
              marginBottom: "18px",
            }}
          >
            {wedding ? "at their wedding celebration" : "Made unforgettable"}
          </div>
          <div
            style={{
              color: "#7b5a2f",
              display: "flex",
              fontFamily: "Dyrane Invitation",
              fontSize: codePointLength(detailLine) > 60 ? "14px" : "18px",
              letterSpacing: "3px",
              textTransform: "uppercase",
            }}
          >
            {detailLine}
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: [
        {
          name: "Dyrane Invitation",
          data: fontData,
          style: "normal",
          weight: 400,
        },
      ],
    },
  );
}
