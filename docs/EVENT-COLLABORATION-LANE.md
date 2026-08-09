# Event Collaboration Lane

Status: **captured — separate product lane**

Captured: 2026-08-09

This lane is intentionally separate from the approved invitation and spatial
journey. It does not add another chapter, control or content grid to the current
guest experience. It records a future operational layer for acknowledging the
people who make the wedding possible and collecting guest media during the
event.

## Original notes

> [8/8/26, 6:57:30 AM] My Number: It will have names of everyone involved with
> the wedding and the roles they play too
>
> [8/8/26, 6:57:49 AM] My Number: But I love this, it’s sleek interface and all
>
> [8/8/26, 6:57:52 AM] My Number: Vendors etc
>
> [8/9/26, 9:21:49 AM] My Number: Also it will have a place where you can send
> your pictures during the wedding
>
> [8/9/26, 9:22:18 AM] My Number: Something like a QR code

## Product intent

The wedding product should eventually support two related capabilities without
turning the primary invitation into a directory or event-management dashboard:

1. **Wedding circle and credits:** approved names, roles and vendors connected
   to the wedding.
2. **Guest camera:** a fast, QR-accessible place where guests can contribute
   photographs and approved video during the celebration.

The invitation remains the emotional entrance. This lane becomes useful when a
guest needs context about the people involved or when the event is underway.

## Capability boundaries

### People and roles

- Couple-managed roster of family, wedding party, cultural roles, officiants,
  coordinators and other acknowledged contributors.
- Each person has a display name, role label, group, order, visibility and
  explicit publication consent.
- Portraits are optional. A missing portrait becomes a typographic state, never
  a generated face.
- Private contact information never enters the published guest snapshot.

### Vendors and credits

- Couple-managed vendor name, service category, approved credit link and
  visibility.
- Credits acknowledge real work without turning the invitation into advertising.
- Contact details and booking links require separate approval from simple public
  attribution.

### Guest camera and QR entry

- A QR code opens a mobile-first upload surface without requiring an app.
- The QR target uses an opaque, revocable and time-bounded collection credential;
  it never embeds a guest invitation token or private guest data.
- Upload supports clear progress, retry and recovery on unreliable event Wi-Fi.
- Photographs are delivered to a private couple/moderator inbox first. Nothing
  becomes publicly visible automatically.
- The couple can review, approve, hide, export and delete contributions.
- Public galleries, if later approved, consume only moderated media with explicit
  display permission.

## Safety, consent and operations

- State clearly who receives an upload, how it may be used and how long it will
  be retained before submission.
- Record uploader consent and media provenance.
- Strip unnecessary location and device metadata from public derivatives.
- Validate file type and size; rate-limit uploads; scan files; quarantine failures;
  and provide abuse reporting and removal controls.
- Never use guest photographs for facial recognition, identity inference or AI
  training by default.
- Support bulk export and verified deletion for the couple.
- Design an event-day fallback for weak connectivity, including resumable uploads
  and a QR destination that remains stable if the collection backend changes.

## Proposed surfaces

- **Couple Studio:** manage people, roles, vendors, visibility and consent.
- **Event Kit:** generate printable and screen-ready QR assets for the approved
  media collection.
- **Guest Camera:** capture or select media, preview, consent and upload.
- **Media Inbox:** moderate, organize, export and delete submissions.
- **Optional credits view:** a secondary, deliberate destination outside the
  six-chapter primary invitation.

## Smallest useful vertical slice

1. Couple creates one wedding-bound media collection with an expiry.
2. The system produces one revocable QR code and ordinary fallback URL.
3. A guest opens it, accepts the upload terms and sends one photograph.
4. Upload progress and retry remain truthful on interrupted connections.
5. The photograph appears only in the private couple inbox.
6. The couple can download or delete it and revoke the QR destination.

People, roles and vendor credits can then use the already-defined published
snapshot consent model without being forced into the primary invitation path.

## Decisions still open

- Are people and vendor credits public, invitation-only or configurable per item?
- Are vendor links attribution-only, contact links or both?
- Is the Guest Camera anonymous, invitation-bound or protected by an event PIN?
- Are videos included in the first release, or photographs only?
- What are the upload limits and retention period?
- Is there ever a live public gallery, or only a private couple archive?
- Who can moderate during the wedding besides the couple?

## Non-goals for the current experience

- Do not add a wedding-party grid, vendor directory or QR control to the current
  six-chapter invitation.
- Do not interrupt the approved opening, story, celebration, dress or RSVP flow.
- Do not auto-publish contributed media.
- Do not begin implementation until the access, consent, moderation and retention
  decisions above are approved.

