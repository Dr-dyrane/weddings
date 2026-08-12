import type { MetadataRoute } from "next";

import { getSiteOrigin } from "@/domains/weddings/site-origin";

export default function sitemap(): MetadataRoute.Sitemap {
  const origin = getSiteOrigin().origin;

  return [
    {
      url: `${origin}/`,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${origin}/start`,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${origin}/the_ogranyas`,
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${origin}/the_ogranyas/celebration`,
      changeFrequency: "weekly",
      priority: 0.5,
    },
  ];
}
