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

## The orb is functional and spatial

The orb is a real, demand-rendered WebGL object rather than a CSS illustration.
Directional white and Chioma-yellow light reveal its volume; a yellow path sits
on the sphere and grows with real completion. The orb compresses, turns and
settles only when the conversation changes state. It must never pulse, glow or
move decoratively while idle.

The DOM remains the source of truth: the orb wrapper exposes the current step
and progress to assistive technology, while a tonal static sphere remains under
the canvas for reduced-capability or failed-WebGL rendering. Reduced motion
keeps a stable rendered frame. The canvas uses demand rendering so an idle
intake does not continuously consume the GPU.

## Conversation grammar

The prompt is the orb's voice. It is centred, brief and emotionally phrased;
answers rest quietly beneath it. Do not display administrative step names such
as “Step 02” as primary interface copy. Back, progress and review controls stay
secondary, and review reads like the conversation concluding rather than a
form table.

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
