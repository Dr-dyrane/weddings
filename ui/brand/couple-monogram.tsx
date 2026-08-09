import type { SVGProps } from "react";

export const COUPLE_MONOGRAM_VIEWBOX = "0 0 160 160";
export const COUPLE_MONOGRAM_VERSION = 4;
export const COUPLE_MONOGRAM_FONT_URL =
  "/fonts/dyrane-space-grotesk.ttf";
export const COUPLE_MONOGRAM_BACKGROUND = "#000000";
export const COUPLE_MONOGRAM_INK = "#ffffff";
export const COUPLE_MONOGRAM_RING = "#ffd21e";

export type CoupleInitials = {
  first: string;
  second: string;
};

export type CoupleMonogramProps = Omit<
  SVGProps<SVGSVGElement>,
  "children"
> & {
  firstName: string;
  ink?: string;
  ring?: string;
  secondName: string;
  title?: string;
};

export type RenderCoupleMonogramSvgOptions = {
  background?: string;
  color?: string;
  firstName: string;
  fontDataUri?: string;
  ringColor?: string;
  secondName: string;
  title?: string;
};

const INITIAL_PATTERN = /[\p{L}\p{N}]/u;
const GRAPHEME_SEGMENTER = new Intl.Segmenter(undefined, {
  granularity: "grapheme",
});

function initialFromName(name: string) {
  const normalizedName = name.trim().normalize("NFC");
  for (const { segment } of GRAPHEME_SEGMENTER.segment(normalizedName)) {
    if (INITIAL_PATTERN.test(segment)) {
      return segment.toLocaleUpperCase().normalize("NFC");
    }
  }
  return "?";
}

export function getCoupleInitials(
  firstName: string,
  secondName: string,
): CoupleInitials {
  return {
    first: initialFromName(firstName),
    second: initialFromName(secondName),
  };
}

export function getCoupleMonogramText(
  firstName: string,
  secondName: string,
) {
  const { first, second } = getCoupleInitials(firstName, secondName);
  return `${first} & ${second}`;
}

function escapeSvgText(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function accessibleTitle(firstName: string, secondName: string) {
  const first = firstName.trim();
  const second = secondName.trim();
  return `${first} and ${second} monogram`;
}

function MonogramLockup({
  first,
  ink,
  ring,
  second,
}: CoupleInitials & { ink: string; ring: string }) {
  const textStyle = {
    fontFamily:
      "Dyrane Space Grotesk, Space Grotesk, Arial, sans-serif",
    fontSize: 32,
    fontStyle: "normal",
    fontWeight: 500,
    letterSpacing: -1.2,
  } as const;

  return (
    <g aria-hidden="true">
      <circle cx="80" cy="80" fill={COUPLE_MONOGRAM_BACKGROUND} r="78" />
      <circle
        cx="80"
        cy="80"
        fill="none"
        r="60"
        stroke={ring}
        strokeWidth="3"
      />
      <text
        dominantBaseline="middle"
        fill={ink}
        style={textStyle}
        textAnchor="middle"
        x="80"
        y="80"
      >
        {first} &amp; {second}
      </text>
    </g>
  );
}

/** A single circular A & C mark shared by every couple-branded surface. */
export function CoupleMonogram({
  firstName,
  ink = COUPLE_MONOGRAM_INK,
  ring = COUPLE_MONOGRAM_RING,
  secondName,
  title,
  ...props
}: CoupleMonogramProps) {
  const initials = getCoupleInitials(firstName, secondName);

  return (
    <svg
      aria-hidden={title ? undefined : true}
      fill="none"
      focusable="false"
      role={title ? "img" : undefined}
      shapeRendering="geometricPrecision"
      viewBox={COUPLE_MONOGRAM_VIEWBOX}
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      {title ? <title>{title}</title> : null}
      <MonogramLockup {...initials} ink={ink} ring={ring} />
    </svg>
  );
}

/** Pure SVG serializer for dynamic logo routes and data-URI consumers. */
export function renderCoupleMonogramSvg({
  background = COUPLE_MONOGRAM_BACKGROUND,
  color = COUPLE_MONOGRAM_INK,
  firstName,
  fontDataUri,
  ringColor = COUPLE_MONOGRAM_RING,
  secondName,
  title,
}: RenderCoupleMonogramSvgOptions) {
  const { first, second } = getCoupleInitials(firstName, secondName);
  const resolvedTitle = title ?? accessibleTitle(firstName, secondName);
  const backgroundElement = `<circle cx="80" cy="80" r="78" fill="${escapeSvgText(background)}"/>`;
  const fontSource = fontDataUri ?? COUPLE_MONOGRAM_FONT_URL;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160" viewBox="${COUPLE_MONOGRAM_VIEWBOX}" fill="none" role="img" aria-labelledby="couple-monogram-title" shape-rendering="geometricPrecision"><title id="couple-monogram-title">${escapeSvgText(resolvedTitle)}</title><style>@font-face{font-family:Dyrane Space Grotesk;src:url(&quot;${escapeSvgText(fontSource)}&quot;) format(&quot;truetype&quot;);font-style:normal;font-weight:500}.couple-initials{font-family:Dyrane Space Grotesk,Space Grotesk,Arial,sans-serif;font-size:32px;font-style:normal;font-weight:500;letter-spacing:-1.2px}</style>${backgroundElement}<circle cx="80" cy="80" r="60" fill="none" stroke="${escapeSvgText(ringColor)}" stroke-width="3"/><text class="couple-initials" aria-hidden="true" x="80" y="80" fill="${escapeSvgText(color)}" dominant-baseline="middle" text-anchor="middle">${escapeSvgText(first)} &amp; ${escapeSvgText(second)}</text></svg>`;
}

export function getCoupleMonogramDataUri(
  options: RenderCoupleMonogramSvgOptions,
) {
  const bytes = new TextEncoder().encode(renderCoupleMonogramSvg(options));
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return `data:image/svg+xml;base64,${btoa(binary)}`;
}
