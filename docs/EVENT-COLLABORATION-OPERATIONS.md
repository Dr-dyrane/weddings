# Event Collaboration Operations

Status: implementation and migration ready

## Activation

1. Deploy with logical D1 binding `DB` and private R2 binding `MEDIA`.
2. Configure the hosted `STUDIO_OWNER_EMAILS` secret as a comma-separated list
   of the ChatGPT account emails allowed to operate Couple Studio.
3. Sign in and open `/{weddingSlug}/studio/celebration`.
   The public invitation and celebration routes remain available without
   sign-in; only Studio operations require the owner allowlist.
4. Add each person or vendor. Mark public approval only after the couple has
   approved the exact spelling, role and visibility.
5. Publish the credits hub only after at least one approved public credit exists.
6. Issue a collection. Save or print its QR immediately: the bearer credential
   is stored only as a hash and cannot be reconstructed later.

## Event-day workflow

- Keep the stable no-scan URL available beside the QR.
- Guests may send one photograph per completed screen. The client retains its
  idempotency key across retries so a lost response does not create duplicates.
- New photographs enter the private inbox as pending. A moderator may download,
  approve, reject or delete each one.
- Revoking a collection immediately stops new submissions. Existing private
  objects remain available to moderators until deleted or retained out.

## Privacy and incident response

- Never place a guest invitation credential inside a collection URL.
- Never paste collection or Studio URLs into analytics, issue trackers or logs.
- If a QR leaks, revoke its collection and issue a new one.
- If inappropriate media arrives, reject or delete it; nothing is automatically
  public.
- Deletion removes object bytes first and keeps only a minimal deleted audit row.
- Collection traffic and Studio access opportunistically purge media whose
  retention window has ended. Run the same purge through an operational visit
  after an event if the collection receives no later traffic.

## First-release limits

- JPEG, PNG, WebP and HEIC only.
- 12 MB per photograph.
- Eight attempts per credential-bound source in a ten-minute window.
- Collection duration no longer than 31 days.
- Retention from 1 to 365 days, with a 90-day Studio default.
- No video, public gallery, automatic publication, facial recognition or AI
  training.
