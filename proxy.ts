import { type NextRequest, NextResponse } from "next/server";

const PRIVATE_INVITATION = /^\/[a-z0-9_]+\/invite\/[^/]+(?:\/|$)/;

export function proxy(request: NextRequest) {
  const response = NextResponse.next();

  if (PRIVATE_INVITATION.test(request.nextUrl.pathname)) {
    response.headers.set("Cache-Control", "private, no-store");
    response.headers.set("Referrer-Policy", "no-referrer");
    response.headers.set("X-Content-Type-Options", "nosniff");
    response.headers.set(
      "X-Robots-Tag",
      "noindex, nofollow, noarchive, nosnippet",
    );
  }

  return response;
}

export const config = {
  matcher: "/:weddingSlug/invite/:path*",
};
