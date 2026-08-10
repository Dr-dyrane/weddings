# Intake Journey

Status: active implementation contract

## Purpose

`IntakeJourney` is the shared one-question-at-a-time interaction for Dyrane
Weddings. It keeps package enquiries, guest replies, guest photographs and
supported Studio creation tasks in one visual and behavioural language.

The reference is the calm focus of Alinea-style onboarding combined with the
proven draft, review and edit mechanics in `/planned`. The result remains a
Dyrane Weddings object: pitch black, white Space Grotesk and exact Chioma
yellow `#FFD21E`.

## The orb is functional

The orb is a semantic progress and state instrument. Its yellow arc reports
real completion, its accessible name identifies the current step, and its
completed state may become a check. It must never pulse, glow or move without a
corresponding state change.

## Interaction contract

- Present one operational question at a time.
- Preserve answers when moving backward or editing from review.
- Move focus to the new prompt after each step change.
- Keep every action at least 44 CSS pixels and every prompt readable at 320px.
- Use review rows to edit individual answers without restarting.
- Respect reduced motion; motion explains entry, progress or completion only.
- Never put names, phone numbers, email addresses, replies or upload details in
  route parameters, analytics, referrers or public snapshots.
- A package enquiry remains in the browser until the user deliberately opens
  WhatsApp or email.
- RSVP and guest-photo answers use their existing private wedding APIs.
- No credit becomes public without explicit couple approval. No photograph is
  published automatically.

## Implemented journeys

1. Package enquiry at `/start`, including package-preserving entry from the
   offer and direct WhatsApp or email handoff to Dyrane Weddings.
2. Public invitation RSVP, including attendance branching, review/edit and the
   persisted idempotent RSVP endpoint.
3. Private guest-camera upload, including file validation, optional attribution,
   explicit consent, review and live upload progress.
4. Authenticated Celebration Studio creation flows for public credits and
   revocable guest-camera QR collections.

## Couple Studio boundary

The current Celebration Studio is a complete operational slice for people,
vendors, QR collections, photo moderation and RSVP review. It is not the full
future Couple Studio described in `ASSET-INTAKE.md`.

The longer identity, ceremonies, atmosphere, story, people, vendors, dress,
media, sound, guests, RSVP and approval sequence must use this same engine only
after its relational draft persistence, save/resume, media ownership and
publish-confirmation contracts are available. Do not simulate those capabilities
with browser-only state or label an unpersisted form as complete.
