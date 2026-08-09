import "server-only";

import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";

import type { InvitationProjection } from "@/domains/invitations/invitation";
import type { PublishedWedding } from "@/domains/weddings/published-wedding";
import {
  getCoupleInitials,
  type CoupleInitials,
} from "@/ui/brand/couple-monogram";

const fontPromise = readFile(
  path.join(process.cwd(), "public/fonts/dyrane-invitation-serif.ttf"),
);
const monogramFontPromise = readFile(
  path.join(process.cwd(), "public/fonts/dyrane-monogram-cinzel.ttf"),
);

function ShareCardMonogram({
  color,
  initials,
  size,
}: {
  color: string;
  initials: CoupleInitials;
  size: number;
}) {
  return (
    <div
      style={{
        alignItems: "center",
        color,
        display: "flex",
        fontFamily: "Dyrane Monogram",
        fontSize: `${size * 0.3125}px`,
        fontStyle: "normal",
        fontWeight: 400,
        height: `${size}px`,
        justifyContent: "center",
        lineHeight: 1,
        transform: "skewX(-9deg)",
        whiteSpace: "nowrap",
        width: `${size}px`,
      }}
    >
      {initials.first} &amp; {initials.second}
    </div>
  );
}

function codePointLength(value: string) {
  return Array.from(value).length;
}

function fittedNameSize(value: string, personalized: boolean) {
  const length = codePointLength(value);
  if (length > 52) return "32px";
  if (length > 40) return "36px";
  if (length > 30) return "42px";
  if (length > 22) return "48px";
  return personalized ? "54px" : "48px";
}

function fittedCoupleSize(value: string) {
  const length = codePointLength(value);
  if (length > 52) return "22px";
  if (length > 40) return "25px";
  return "29px";
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
  const [font, monogramFont] = await Promise.all([
    fontPromise,
    monogramFontPromise,
  ]);
  const fontData = font.buffer.slice(
    font.byteOffset,
    font.byteOffset + font.byteLength,
  ) as ArrayBuffer;
  const monogramFontData = monogramFont.buffer.slice(
    monogramFont.byteOffset,
    monogramFont.byteOffset + monogramFont.byteLength,
  ) as ArrayBuffer;
  const coupleLine = wedding
    ? `${wedding.couple.first} & ${wedding.couple.second}`
    : "Dyrane Weddings";
  const recipient = invitation?.salutation ?? "Beautifully told";
  const isPersonalized = invitation?.kind === "personalized";
  const dateLine = wedding?.dateLabel ?? "Personal digital invitations";
  const locationLine = wedding?.locationLabel ?? "Designed by Dyrane";
  const edition = String(invitation?.cardEdition ?? 1).padStart(2, "0");
  const brandFirstName = wedding?.couple.first ?? "Dyrane";
  const brandSecondName = wedding?.couple.second ?? "Weddings";
  const initials = getCoupleInitials(brandFirstName, brandSecondName);

  return new ImageResponse(
    (
      <div
        style={{
          alignItems: "center",
          background:
            "radial-gradient(circle at 82% 20%, #57305d 0%, #251028 29%, #100713 68%)",
          color: "#241522",
          display: "flex",
          height: "100%",
          justifyContent: "center",
          overflow: "hidden",
          position: "relative",
          width: "100%",
        }}
      >
        <div
          style={{
            background:
              "radial-gradient(circle, rgba(205, 159, 90, .2) 0%, rgba(205, 159, 90, 0) 70%)",
            borderRadius: "999px",
            display: "flex",
            height: "520px",
            left: "-210px",
            position: "absolute",
            top: "300px",
            width: "520px",
          }}
        />

        <div
          style={{
            background: "linear-gradient(135deg, #f8f3eb 0%, #eee3d7 100%)",
            borderRadius: "52px",
            boxShadow: "0 38px 90px rgba(0, 0, 0, .38)",
            display: "flex",
            height: "542px",
            overflow: "hidden",
            padding: "28px",
            position: "relative",
            width: "1104px",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              height: "486px",
              padding: "12px 40px 14px 32px",
              width: "698px",
            }}
          >
            <div
              style={{
                alignItems: "center",
                display: "flex",
                height: "36px",
                justifyContent: "space-between",
                width: "100%",
              }}
            >
              <div style={{ alignItems: "center", display: "flex" }}>
                <ShareCardMonogram
                  color="#a56e2e"
                  initials={initials}
                  size={34}
                />
                <div
                  style={{
                    color: "#6c4a36",
                    display: "flex",
                    fontSize: "13px",
                    fontWeight: 700,
                    letterSpacing: "3.2px",
                    marginLeft: "13px",
                    textTransform: "uppercase",
                  }}
                >
                  Private invitation
                </div>
              </div>
              <div
                style={{
                  color: "#9b7a62",
                  display: "flex",
                  fontSize: "12px",
                  fontWeight: 700,
                  letterSpacing: "2.4px",
                  textTransform: "uppercase",
                }}
              >
                Edition {edition}
              </div>
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                marginTop: "34px",
              }}
            >
              <div
                style={{
                  color: "#a56e2e",
                  display: "flex",
                  fontSize: "13px",
                  fontWeight: 700,
                  letterSpacing: "3.8px",
                  marginBottom: "13px",
                  textTransform: "uppercase",
                }}
              >
                {wedding ? wedding.invitation.eyebrow : "The new wedding invitation"}
              </div>
              <div
                style={{
                  color: "#251422",
                  display: "flex",
                  fontFamily: "Dyrane Invitation",
                  fontSize: "64px",
                  letterSpacing: "-2.2px",
                  lineHeight: 0.98,
                }}
              >
                {wedding ? "You’re invited." : "Weddings, beautifully told."}
              </div>
              <div
                style={{
                  color: "#7f6554",
                  display: "flex",
                  fontSize: "12px",
                  fontWeight: 700,
                  letterSpacing: "3.2px",
                  marginBottom: "8px",
                  marginTop: "28px",
                  textTransform: "uppercase",
                }}
              >
                {wedding ? "Personally for" : "A Dyrane experience"}
              </div>
              <div
                style={{
                  color: "#4c274c",
                  display: "flex",
                  flexWrap: "wrap",
                  fontFamily: "Dyrane Invitation",
                  fontSize: fittedNameSize(recipient, isPersonalized),
                  letterSpacing: "-.7px",
                  lineHeight: 1.02,
                  maxWidth: "610px",
                }}
              >
                {recipient}
              </div>
            </div>

            <div
              style={{
                alignItems: "flex-end",
                display: "flex",
                justifyContent: "space-between",
                marginTop: "auto",
                width: "100%",
              }}
            >
              <div style={{ display: "flex", flexDirection: "column" }}>
                <div
                  style={{
                    color: "#2e1b2c",
                    display: "flex",
                    fontSize: codePointLength(dateLine) > 42 ? "17px" : "20px",
                    fontWeight: 700,
                    letterSpacing: "-.2px",
                  }}
                >
                  {dateLine}
                </div>
                <div
                  style={{
                    color: "#836d60",
                    display: "flex",
                    fontSize: "15px",
                    marginTop: "5px",
                  }}
                >
                  {locationLine}
                </div>
              </div>
              <div
                style={{
                  alignItems: "center",
                  background: "#241322",
                  borderRadius: "999px",
                  color: "#f7efe5",
                  display: "flex",
                  fontSize: "12px",
                  fontWeight: 700,
                  height: "43px",
                  justifyContent: "center",
                  letterSpacing: "2.1px",
                  padding: "0 20px",
                  textTransform: "uppercase",
                }}
              >
                Open invitation&nbsp;&nbsp;→
              </div>
            </div>
          </div>

          <div
            style={{
              alignItems: "center",
              background:
                "radial-gradient(circle at 50% 36%, #6e4074 0%, #351839 38%, #190c1d 100%)",
              borderRadius: "40px",
              color: "#f4e9da",
              display: "flex",
              flexDirection: "column",
              height: "486px",
              justifyContent: "space-between",
              marginLeft: "22px",
              overflow: "hidden",
              padding: "35px 30px 30px",
              position: "relative",
              textAlign: "center",
              width: "328px",
            }}
          >
            <div
              style={{
                background:
                  "radial-gradient(circle, rgba(213, 171, 103, .24) 0%, rgba(213, 171, 103, 0) 70%)",
                borderRadius: "999px",
                display: "flex",
                height: "380px",
                left: "-26px",
                position: "absolute",
                top: "42px",
                width: "380px",
              }}
            />
            <div
              style={{
                color: "#cfb28a",
                display: "flex",
                fontSize: "12px",
                fontWeight: 700,
                letterSpacing: "3.4px",
                position: "relative",
                textTransform: "uppercase",
              }}
            >
              Dyrane Weddings
            </div>

            <div
              style={{
                alignItems: "center",
                display: "flex",
                flexDirection: "column",
                position: "relative",
              }}
            >
              <ShareCardMonogram
                color="#d6a95e"
                initials={initials}
                size={144}
              />
              <div
                style={{
                  color: "#fff8ee",
                  display: "flex",
                  flexWrap: "wrap",
                  fontFamily: "Dyrane Invitation",
                  fontSize: fittedCoupleSize(coupleLine),
                  justifyContent: "center",
                  lineHeight: 1.04,
                  marginTop: "20px",
                  maxWidth: "260px",
                }}
              >
                {coupleLine}
              </div>
            </div>

            <div
              style={{
                alignItems: "center",
                display: "flex",
                flexDirection: "column",
                position: "relative",
              }}
            >
              <div
                style={{
                  color: "#eadac5",
                  display: "flex",
                  fontSize: "14px",
                  fontWeight: 600,
                  letterSpacing: ".2px",
                  textAlign: "center",
                }}
              >
                {dateLine}
              </div>
              <div
                style={{
                  color: "#bba58f",
                  display: "flex",
                  fontSize: "12px",
                  letterSpacing: "1.8px",
                  marginTop: "7px",
                  textTransform: "uppercase",
                }}
              >
                {locationLine}
              </div>
            </div>
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
        {
          name: "Dyrane Monogram",
          data: monogramFontData,
          style: "normal",
          weight: 400,
        },
      ],
    },
  );
}
