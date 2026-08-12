import type { MetadataRoute } from "next";

import { getSiteOrigin } from "@/domains/weddings/site-origin";

export default function robots(): MetadataRoute.Robots {
  const origin = getSiteOrigin();

  return {
    host: origin,
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/*/invite/",
          "/*/studio/",
        ],
      },
    ],
    sitemap: `${origin}/sitemap.xml`,
  };
}
