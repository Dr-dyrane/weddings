# Published Wedding Content Model

Authoritative content is relational. Publishing compiles it into an immutable, versioned `PublishedWeddingSnapshot` that contains only what the current invitation may reveal.

## Core entities

- Wedding: identity, locale, timezone, visibility, theme reference, publication state.
- Published version: immutable revision, approval record, generated timestamp, share-card edition.
- Event: name, start/end, venue, address, map target, dress guidance, guest access policy.
- Story milestone: date label, title, narrative, art direction, sort order, visibility.
- Person: display name, role label, group, portrait, sort order, visibility, consent.
- Vendor: display name, service category, credit link, contact visibility, consent.
- Media asset: source, dimensions, focal point, crop variants, alt treatment, rights, consent, provenance.
- Household and guest: salutation, guest membership, plus-one policy, event access.
- Invitation: opaque credential hash, state, expiry, revision, share-card edition.
- RSVP: attendance per event, guest answers, status, revision, timestamps.
- Notification outbox and audit log.

## Published snapshot rules

- Snapshot input is schema-validated and contains no draft-only notes.
- Names, roles, vendors, and imagery publish only when their visibility and consent allow it.
- Missing sections disappear cleanly; zero, one, and many-item layouts are intentional states.
- Multiple ceremonies, timezones, culturally specific roles, household invitations, long names, and Unicode are first-class cases.
- A theme receives typed content and approved tokens; it cannot receive database access or executable author input.

## Alexander and Chioma seed

The yardstick snapshot is simulated product data. It exists to exercise the complete schema and experience. Before any real launch, the couple must approve names, dates, places, people, vendors, imagery, spelling, visibility, and RSVP policy field by field.
