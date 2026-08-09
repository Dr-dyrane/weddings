# ADR 0004: Dynamic share-card editions

Status: accepted

## Decision

Next.js `ImageResponse` generates deterministic 1200×630 share cards from
published couple and wedding-date data plus an embedded, licensed Space Grotesk
font. Public and personalized routes use the same privacy-safe visual. A
published card revision receives an editioned share URL, and the image URL gains
a wedding-timezone calendar-day key so the live progress frame can advance
without relying on third-party cache invalidation.

## Consequences

Crawler presentation does not depend on client rendering. Recipient spelling, long names, Unicode, invalid credentials, and public fallbacks become test fixtures. Social cache refresh is explicit instead of best-effort.
