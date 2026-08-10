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
- The public RSVP stores only the submitted name, attendance, menu choice and
  optional note. Source rate limiting uses a one-way fingerprint and never
  stores the raw IP address.
- Couple notifications are not claimed until a transactional notification
  outbox is activated; the committed D1 response remains the source of truth.
- Email delivery failure does not erase a committed reply or display false delivery success.
- The owner Studio can view and delete guest replies. Export remains a later
  operational capability and is not represented in the interface.

## Event collection credentials

- `/{weddingSlug}/celebration/photos` is an ordinary no-scan fallback and never
  contains an invitation or collection credential.
- A live Event Kit QR targets
  `/{weddingSlug}/celebration/photos/{opaqueCollectionCredential}`. Collection
  credentials are wedding-bound, revocable, expirable and distinct from guest
  invitation credentials.
- Collection credential routes resolve fail-closed and emit private `no-store`,
  `Referrer-Policy: no-referrer`, `X-Content-Type-Options: nosniff`, and crawler
  exclusion headers.
- Production collection credentials must be stored only as a one-way hash or
  HMAC and excluded from analytics, logs and error telemetry.
- A valid credential authorizes entry to a collection policy; it does not imply
  public display permission for contributed media.
- Guest-camera originals are private R2 objects. D1 stores operational
  metadata, the explicit consent version and the hashed collection credential.
- Uploads accept image signatures only, are capped at 12 MB and are rate-limited
  by a credential-bound source fingerprint without storing raw IP addresses.
- Studio mutation endpoints require authenticated allowlisted access and reject
  cross-origin writes. Studio pages, APIs and media responses are private and
  `no-store`.
- Deletion removes the R2 object before marking the D1 audit record deleted.
  Expired objects are purged according to their collection retention policy
  whenever the collection or Studio is accessed.

The token currently checked into the yardstick seed is a non-secret simulation fixture. Production invitation credentials must never be committed to source.
