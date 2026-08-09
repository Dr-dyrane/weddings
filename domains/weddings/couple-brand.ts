import type { Metadata } from "next";

import { COUPLE_MONOGRAM_VERSION } from "@/ui/brand/couple-monogram";

export const WEDDING_ICON_SIZES = [32, 180, 192, 512] as const;

export type WeddingIconSize = (typeof WEDDING_ICON_SIZES)[number];

export type WeddingBrandAssets = {
  appleIcon: string;
  favicon: string;
  icon192: string;
  icon512: string;
  logo: string;
  manifest: string;
};

export type WeddingBrandSource = {
  revision: number;
  slug: string;
};

export function isWeddingIconSize(value: number): value is WeddingIconSize {
  return WEDDING_ICON_SIZES.includes(value as WeddingIconSize);
}

export function getWeddingBrandAssets({
  revision,
  slug,
}: WeddingBrandSource): WeddingBrandAssets {
  const basePath = `/${encodeURIComponent(slug)}`;
  const version = encodeURIComponent(
    `monogram-${COUPLE_MONOGRAM_VERSION}-revision-${revision}`,
  );
  const versionQuery = `?v=${version}`;

  return {
    appleIcon: `${basePath}/icon/180${versionQuery}`,
    favicon: `${basePath}/icon/32${versionQuery}`,
    icon192: `${basePath}/icon/192${versionQuery}`,
    icon512: `${basePath}/icon/512${versionQuery}`,
    logo: `${basePath}/logo.svg${versionQuery}`,
    manifest: `${basePath}/manifest.webmanifest${versionQuery}`,
  };
}

export function getWeddingBrandMetadata(
  wedding: WeddingBrandSource,
): Pick<Metadata, "icons" | "manifest"> {
  const assets = getWeddingBrandAssets(wedding);

  return {
    icons: {
      apple: [
        { sizes: "180x180", type: "image/png", url: assets.appleIcon },
      ],
      icon: [
        { sizes: "32x32", type: "image/png", url: assets.favicon },
        { sizes: "any", type: "image/svg+xml", url: assets.logo },
      ],
      shortcut: [{ type: "image/png", url: assets.favicon }],
    },
    manifest: assets.manifest,
  };
}

export function weddingBrandCacheControl(status: "preview" | "published") {
  return status === "published"
    ? "public, max-age=31536000, immutable"
    : "private, no-store";
}
