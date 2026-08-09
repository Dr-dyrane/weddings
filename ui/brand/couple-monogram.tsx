import type { SVGProps } from "react";

export const COUPLE_MONOGRAM_VIEWBOX = "0 30 160 100";
export const COUPLE_MONOGRAM_VERSION = 2;
export const COUPLE_MONOGRAM_FONT_URL =
  "/fonts/dyrane-monogram-cinzel.ttf";

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
  secondName: string;
  title?: string;
};

export type RenderCoupleMonogramSvgOptions = {
  background?: string;
  color?: string;
  firstName: string;
  fontDataUri?: string;
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

function InitialLockup({
  first,
  ink,
  second,
}: CoupleInitials & { ink: string }) {
  const textStyle = {
    fontFamily:
      "Dyrane Monogram, Cinzel, 'Times New Roman', serif",
    fontSize: 50,
    fontStyle: "normal",
    fontWeight: 400,
  } as const;

  return (
    <g
      aria-hidden="true"
      fill={ink}
      transform="translate(17 0) skewX(-9)"
    >
      <text style={textStyle} textAnchor="middle" x="80" y="109">
        {first} &amp; {second}
      </text>
    </g>
  );
}

/** A single frame-free italic mark shared by every couple-branded surface. */
export function CoupleMonogram({
  firstName,
  ink = "currentColor",
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
      <InitialLockup {...initials} ink={ink} />
    </svg>
  );
}

/** Pure SVG serializer for dynamic logo routes and data-URI consumers. */
export function renderCoupleMonogramSvg({
  background,
  color = "#b98a43",
  firstName,
  fontDataUri,
  secondName,
  title,
}: RenderCoupleMonogramSvgOptions) {
  const { first, second } = getCoupleInitials(firstName, secondName);
  const resolvedTitle = title ?? accessibleTitle(firstName, secondName);
  const backgroundElement = background
    ? `<rect width="160" height="160" rx="36" fill="${escapeSvgText(background)}"/>`
    : "";
  const fontSource = fontDataUri ?? COUPLE_MONOGRAM_FONT_URL;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="160" height="100" viewBox="${COUPLE_MONOGRAM_VIEWBOX}" fill="none" color="${escapeSvgText(color)}" role="img" aria-labelledby="couple-monogram-title" shape-rendering="geometricPrecision"><title id="couple-monogram-title">${escapeSvgText(resolvedTitle)}</title><style>@font-face{font-family:Dyrane Monogram;src:url(&quot;${escapeSvgText(fontSource)}&quot;) format(&quot;truetype&quot;);font-style:normal;font-weight:400}.couple-initials{font-family:Dyrane Monogram,Cinzel,Times New Roman,serif;font-size:50px;font-style:normal;font-weight:400}</style>${backgroundElement}<g class="couple-initials" aria-hidden="true" fill="currentColor" transform="translate(17 0) skewX(-9)"><text x="80" y="109" text-anchor="middle">${escapeSvgText(first)} &amp; ${escapeSvgText(second)}</text></g></svg>`;
}

export function getCoupleMonogramDataUri(
  options: RenderCoupleMonogramSvgOptions,
) {
  const bytes = new TextEncoder().encode(renderCoupleMonogramSvg(options));
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return `data:image/svg+xml;base64,${btoa(binary)}`;
}
