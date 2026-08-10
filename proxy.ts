import { type NextRequest, NextResponse } from "next/server";

const PRIVATE_INVITATION = /^\/[a-z0-9_]+\/invite\/[^/]+(?:\/|$)/;
const PRIVATE_PHOTO_COLLECTION =
  /^\/[a-z0-9_]+\/celebration\/photos\/[^/]+(?:\/|$)/;
const PRIVATE_PHOTO_UPLOAD =
  /^\/api\/weddings\/[a-z0-9_]+\/celebration\/photos\/[^/]+(?:\/|$)/;
const PRIVATE_RSVP = /^\/api\/weddings\/[a-z0-9_]+\/rsvp(?:\/|$)/;
const PRIVATE_STUDIO =
  /^\/(?:api\/studio\/[a-z0-9_]+|[a-z0-9_]+\/studio)(?:\/|$)/;

export function proxy(request: NextRequest) {
  const response = NextResponse.next();

  if (
    PRIVATE_INVITATION.test(request.nextUrl.pathname) ||
    PRIVATE_PHOTO_COLLECTION.test(request.nextUrl.pathname) ||
    PRIVATE_PHOTO_UPLOAD.test(request.nextUrl.pathname) ||
    PRIVATE_RSVP.test(request.nextUrl.pathname) ||
    PRIVATE_STUDIO.test(request.nextUrl.pathname)
  ) {
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
  matcher: [
    "/:weddingSlug/invite/:path*",
    "/:weddingSlug/celebration/photos/:path*",
    "/:weddingSlug/studio/:path*",
    "/api/weddings/:weddingSlug/celebration/photos/:path*",
    "/api/weddings/:weddingSlug/rsvp",
    "/api/studio/:path*",
  ],
};
