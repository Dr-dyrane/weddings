# Dyrane Weddings Delivery Roadmap

Status: active

Yardstick: Alexander and Chioma

Rule: no phase advances while an applicable gate in `VERIFICATION-MATRIX.md` is red.

## Architecture boundary

```mermaid
flowchart LR
  Studio[Couple Studio and intake] --> Draft[(Relational draft data)]
  Draft --> Publish[Validate, approve, publish]
  Publish --> Snapshot[Immutable wedding snapshot]
  Snapshot --> Card[Share-card editions]
  Snapshot --> Story[Guest invitation]
  Snapshot --> Calendar[Calendar files]
  Snapshot --> Mail[Invitation email]
  Token[Opaque invitation credential] --> Projection[Recipient-safe projection]
  Snapshot --> Projection
  Projection --> Story
  Projection --> Card
  Projection --> RSVP[RSVP service]
  RSVP --> Outbox[Notification outbox]
  Outbox --> SMTP[Hostinger SMTP]
```

The immutable snapshot is the publishing seam. Presentation never reads authoring tables directly, and the spatial layer never owns facts or actions.

## Standard stack

| Concern | Standard | Guardrail |
| --- | --- | --- |
| Web platform | Next.js App Router, React, TypeScript | Server-first; client islands only for interaction |
| Styling | Tailwind plus semantic CSS variables | Themes may change tokens, never behavior contracts |
| Behavior | React Aria behind `ui/primitives` | No raw behavior-library imports in features |
| Icons | Lucide behind `ui/icons` | One meaning and one registered icon per action |
| DOM motion | Motion behind `ui/motion` | Native scroll; reduced-motion equivalent required |
| Spatial presentation | Three.js, React Three Fiber, Drei | Decorative island; static fallback; no semantic truth |
| Validation | Zod at every publish and mutation boundary | Invalid or unapproved content cannot publish |
| Share cards | Next.js `ImageResponse` | Deterministic 1200×630 output; editioned on publication |
| Calendar | `ics` | Only events allowed for that invitation are emitted |
| Persistence | PostgreSQL with Drizzle | Tenant-bound queries, migrations reviewed in CI |
| Email | Nodemailer through Hostinger SMTP, React Email templates | Transactional outbox; delivery never changes RSVP truth |
| Media | Object storage plus Sharp-derived variants | Rights, consent, focal point, dimensions, and provenance required |
| Testing | Vitest, Playwright, axe-core | Unit, contract, browser, privacy, and accessibility gates |
| Operations | Structured logs, error monitoring, privacy-safe product analytics | No guest identity or invitation credential in telemetry |

Future libraries are added only in the phase that exercises them. This keeps the dependency surface intentional and testable.

## Phase 0 — Foundation and guardrails

Deliver the route, snapshot, privacy, design, motion, icon, and verification contracts. The yardstick remains a clearly identified simulation; RSVP cannot pretend to submit.

Exit gate: clean build, schema tests, generic/private/invalid routes, deterministic cards, calendar projection, noindex and no-store privacy checks, semantic DOM, reduced-motion and no-WebGL fallback.

## Phase 1 — Approved OGB into experience

Build outward from the approved share card instead of continuing the former
envelope, garden and pavilion visual system. The locked direction is documented
in `EXPERIENCE-NORTH-STAR.md`: pitch black, white Space Grotesk, Chioma yellow,
large numeric time, disciplined negative space and one controlled spatial idea
at a time.

Execution order:

1. Preserve the approved dynamic OGB and daily progress contract.
2. Build one first-frame-to-first-transition vertical slice.
3. Approve its desktop, mobile and reduced-motion resting compositions.
4. Re-author subsequent chapters through the same visual grammar.
5. Add factual wedding artifacts only when they strengthen the narrative.
6. Complete reference-device and accessibility verification before expansion.

The former research, art bible, storyboard and concept assets remain provenance,
not implementation authority. Dynamic monogram routes remain technical identity
infrastructure but do not mandate a visible mark in guest surfaces.

Exit gate: approved transition and visual references; long-name and Unicode
fixtures; 320–1440px layouts; 200% zoom; reverse-scroll; context loss;
reference-device frame and Core Web Vitals budgets.

## Phase 2 — Publishing core

Introduce PostgreSQL authoring tables, immutable published revisions, consent and visibility approvals, media records, theme versions, and preview/publish/rollback controls. Generate stable share-card edition URLs from the published revision.

Current local foundation: the relational PostgreSQL metadata, validated
allowlist compiler, immutable revision envelope, optimistic atomic activation
and rollback seam are implemented with an in-memory executable adapter. The
production runtime still uses D1/SQLite. PostgreSQL provisioning, configuration,
reviewed migrations and the production adapter remain required before this
phase can be described as integrated.

Exit gate: migrations reviewed; tenant isolation tests; draft data cannot leak; publication is atomic; previous revision rollback works; every public name and image has approval.

## Phase 3 — Guests and delivery

Add households, guests, event entitlements, revocable opaque invitations, public and personalized share flows, invitation email, delivery tracking, and resend controls. Store credential hashes only.

Exit gate: at least 128 bits of randomness; expiry/revocation; rate limits; log/referrer audit; public/private sharing warning; Hostinger SPF, DKIM, DMARC, bounce, and retry verification.

## Phase 4 — Real RSVP vertical slice

Implement attendance per event, plus-one policy, meal/accessibility questions, edit flow, idempotency key, transactional notification outbox, couple notification, and export.

Exit gate: submit, refresh, edit, retry, duplicate, concurrent update, email failure, export, and deletion journeys pass. A guest never sees success before the reply is committed.

## Phase 5 — Couple Studio

Build the structured authoring workspace: wedding identity, story, schedule, people and roles, vendors, dress guidance, imagery, guest policies, preview, approvals, and publication. Technical implementation words never enter couple-facing copy.

Exit gate: empty/partial/error states; autosave and recovery; role permissions; preview parity; publish checklist; audit history.

## Phase 6 — Progressive intake

Add the one-question-at-a-time orb experience with optional voice, visual prompts, save/resume, branching questions, image collection, AI-assisted suggestions, and explicit human confirmation before any fact becomes publishable.

Exit gate: full keyboard and screen-reader alternative; audio controls and transcript; interruption recovery; no dark patterns; every generated claim and asset shows provenance and approval state.

## Phase 7 — Reusable product and operations

Add theme packs, wedding provisioning, domain management, team roles, operational dashboards, analytics, backups, retention/deletion workflows, observability, support tooling, and disaster recovery.

Exit gate: second and third weddings launch without theme-specific source changes; load, security, backup restore, monitoring, rollback, and incident runbooks pass.

## Event collaboration vertical slice

The separate event-collaboration lane now has an executable D1/R2 adapter and a
complete first workflow: approved public credits, authenticated Studio access,
one-time revocable QR issuance, consented photo-only upload, progress/retry,
private moderation, download, deletion and retention policy. It does not
change the six-chapter invitation or pretend that the broader PostgreSQL Couple
Studio roadmap is complete.

## UI/UX release gates

Every guest-facing increment must pass the five-second invitation test, one-primary-action test, keyboard/touch parity, 44px preferred target audit, WCAG 2.2 AA contrast and reflow, reduced/static motion parity, truthful feedback states, zero banned technical copy, and a manual craft review on real iOS and Android devices.
