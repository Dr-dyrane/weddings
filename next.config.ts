import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    qualities: [75, 82],
  },
  async headers() {
    const privateHeaders = [
      { key: "Cache-Control", value: "private, no-store" },
      { key: "Referrer-Policy", value: "no-referrer" },
      { key: "X-Content-Type-Options", value: "nosniff" },
      {
        key: "X-Robots-Tag",
        value: "noindex, nofollow, noarchive, nosnippet",
      },
    ];
    return [
      {
        source: "/:weddingSlug/invite/:token/:path*",
        headers: privateHeaders,
      },
      {
        source: "/:weddingSlug/celebration/photos/:credential/:path*",
        headers: privateHeaders,
      },
      { source: "/:weddingSlug/studio/:path*", headers: privateHeaders },
      {
        source: "/api/weddings/:weddingSlug/celebration/photos/:path*",
        headers: privateHeaders,
      },
      {
        source: "/api/weddings/:weddingSlug/rsvp",
        headers: privateHeaders,
      },
      { source: "/api/studio/:path*", headers: privateHeaders },
    ];
  },
};

export default nextConfig;
