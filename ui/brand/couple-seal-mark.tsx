import type { SVGProps } from "react";

/** Small optical edition of the confirmed Alexander–Chioma infinity mark. */
export function CoupleSealMark({
  title,
  ...props
}: SVGProps<SVGSVGElement> & { title?: string }) {
  return (
    <svg
      aria-hidden={title ? undefined : true}
      fill="none"
      role={title ? "img" : undefined}
      shapeRendering="geometricPrecision"
      viewBox="0 0 120 64"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      {title ? <title>{title}</title> : null}
      <path
        d="M18 32C18 13.5 43.8 12.5 60 32C76.2 51.5 102 50.5 102 32C102 13.5 76.2 12.5 60 32C43.8 51.5 18 50.5 18 32Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="6.5"
      />
    </svg>
  );
}
