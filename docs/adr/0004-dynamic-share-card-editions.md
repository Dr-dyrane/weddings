# ADR 0004: Dynamic share-card editions

Status: accepted

## Decision

Next.js `ImageResponse` generates deterministic 1200×630 share cards from a governed raster art base plus validated text. Generic and personalized routes own separate metadata. A published card revision receives an editioned share URL.

## Consequences

Crawler presentation does not depend on client rendering. Recipient spelling, long names, Unicode, invalid credentials, and public fallbacks become test fixtures. Social cache refresh is explicit instead of best-effort.
