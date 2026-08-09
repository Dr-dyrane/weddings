import {
  CoupleMonogram,
  type CoupleMonogramProps,
} from "@/ui/brand/couple-monogram";

/** @deprecated Prefer `CoupleMonogram`; retained while spatial surfaces migrate. */
export function CoupleSealMark(props: CoupleMonogramProps) {
  return <CoupleMonogram {...props} />;
}

export {
  CoupleMonogram,
  COUPLE_MONOGRAM_VERSION,
  getCoupleMonogramDataUri,
  getCoupleInitials,
  renderCoupleMonogramSvg,
} from "@/ui/brand/couple-monogram";
export type {
  CoupleInitials,
  CoupleMonogramProps,
  RenderCoupleMonogramSvgOptions,
} from "@/ui/brand/couple-monogram";
