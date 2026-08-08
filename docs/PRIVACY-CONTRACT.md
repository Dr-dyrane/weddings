# Invitation Privacy Contract

## Public and private links

- `/{weddingSlug}` is the generic public invitation and share card.
- `/{weddingSlug}/invite/{opaqueToken}` is personalized and emits `noindex, nofollow`.
- Tokens contain at least 128 random bits, are revocable and expirable, and are stored only as a one-way hash or HMAC in production.
- Guest names, emails, phone numbers, household names, and tokens are excluded from URL query strings, analytics payloads, referrers, logs, and error telemetry.
- Invalid, expired, or revoked credentials reveal no former recipient data.

## Sharing boundary

The guest must be able to choose between a private personalized link and a generic public link. The interface explains that social platforms may cache or re-share personalized preview cards. Regenerating a share card creates an editioned URL; it does not rely on third-party cache invalidation.

## Content consent

People, vendors, portraits, credits, links, and contact details each have explicit visibility and consent fields. Private contact details never enter the published snapshot. Media records retain rights, consent, alt treatment, crop, focal point, and generated-asset provenance.

## RSVP and operations

- RSVP mutations are tenant-bound, idempotent, rate-limited, and auditable.
- A committed RSVP and its notification-outbox record are written in one transaction.
- Email delivery failure does not erase a committed reply or display false delivery success.
- Couples can export and delete guest data according to the product retention policy.

The token currently checked into the yardstick seed is a non-secret simulation fixture. Production invitation credentials must never be committed to source.
