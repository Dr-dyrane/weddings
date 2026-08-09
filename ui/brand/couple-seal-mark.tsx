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
      viewBox="0 0 120 64"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      {title ? <title>{title}</title> : null}
      <path
        d="M60 32C48 10 18 12 18 32C18 52 48 54 60 32C72 10 102 12 102 32C102 52 72 54 60 32"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="8"
      />
    </svg>
  );
}
