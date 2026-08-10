# Verification Matrix

No release may mark a row complete without retained evidence in CI, preview review, or the release record.

| Gate | Pass condition |
| --- | --- |
| Build | Clean install, lint, typecheck, unit tests, production build |
| Copy | Zero banned guest terms; one dominant purpose and action per state |
| Content | Initial, empty, partial, ready, revoked, and error states authored |
| Accessibility | Zero serious/critical axe findings; complete keyboard path; manual screen-reader pass; 200% zoom and 320px reflow |
| Motion | Purpose declared; interruptible; reverse-scroll coherent; reduced/static equivalent verified |
| Touch | Preferred targets at least 44×44 CSS px; no hover-only behavior |
| Performance | p75 LCP ≤2.5 s, INP ≤200 ms, CLS ≤0.1; no idle render loop |
| Spatial | Semantic DOM parity; no-WebGL and context-loss fallback; mobile budget benchmark |
| RSVP | Refresh-safe, idempotent, persisted, editable; success/error/retry tested |
| Responsive | 320, 375, 390, 430, 768, 1024, and 1440 CSS pixels |
| Browsers | iOS Safari, Android Chrome, desktop Safari, Chrome, Firefox, and Edge |
| Metadata | Generic, personalized, invalid, and revoked cards; long-name and Unicode fixtures; live crawler checks |
| Visual identity | Approved OGB grammar preserved: black dominant field, Space Grotesk hierarchy, yellow only for progress/interaction/state or physically justified threshold light; couple contour is source-derived, full-height, subordinate and not stock; no unapproved hue, monogram, ornament, border, haze or extra panel |
| Privacy | No PII in URL, analytics, logs, or referrers; noindex personalized route; revocation and tenant tests |
| Release | Preview E2E, production smoke, monitoring, rollback, and data-backup checks |

## Yardstick journeys

1. Open the generic invitation without JavaScript and reach all essential details.
2. Open a valid personalized link and confirm its salutation and noindex metadata.
3. Open an invalid or revoked link and confirm no identity disclosure.
4. Skip opening motion, use keyboard navigation, add the event to a calendar, open directions, and share with fallback.
5. Submit, refresh, edit, retry, and de-duplicate an RSVP.
6. Repeat the entire journey with reduced motion, no WebGL, narrow mobile, 200% zoom, and a screen reader.

## Retained Phase 1 evidence — 2026-08-09

Passed locally on the production build:

- ESLint, TypeScript and 27 Vitest tests.
- Next.js production compilation and route generation.
- Current public and personalized guest paths in desktop Chromium and the
  Playwright Pixel 7 profile: opening, semantic details, functional RSVP form,
  focus transfer, restored deep-scroll reset to the welcome, public/named share
  disclosure, invalid credentials, share cards and calendar artifacts.
- Reduced-motion static parity: no canvas, authored responsive chapter plate,
  complete semantic details.
- Forced `webglcontextlost`: the live canvas unmounts and the same authored
  static chapter world takes over on desktop and mobile profiles.
- Playwright Chromium, Firefox and WebKit engine coverage for the Phase 1
  evidence spec: 5 passes and 4 intentional non-Chromium skips. This is engine
  evidence, not a claim about branded or physical browsers.
- Reflow across the complete semantic journey at 320 CSS px and 640 CSS px—the
  latter is the layout equivalent of a 1280px viewport at 200%—with no horizontal
  overflow and tested action heights at least 44px.
- Synthetic forward/reverse interruption settled on the correct chapter and
  progress direction.
- Single-run local Chromium lab sample: LCP 400ms, CLS 0.0020, Event Timing
  interaction candidate 56ms, zero idle WebGL draw calls over one second, three
  long-animation frames and a 126.7ms maximum. This is not field p75 or mobile
  GPU evidence.
- Axe serious/critical scan of the current public path, with the aria-hidden
  oversized ghost date explicitly classified as incidental artwork; its
  adjacent semantic `time` remains available at full contrast.

Still open; do not describe Phase 1 as released until retained evidence exists:

- Literal manual 200% browser zoom craft review.
- Reverse-scroll and interruption observation on a real high-refresh device.
- VoiceOver or equivalent screen-reader pass.
- Real iOS Safari and Android Chrome, plus desktop Safari, Firefox and Edge.
- p75 Core Web Vitals and mobile GPU/frame-time budgets.
- Live crawler refresh, production smoke, monitoring and rollback verification.

## Retained event-collaboration evidence — 2026-08-09

Passed locally against the Sites D1 and private R2 development bindings:

- Create an approved credit, publish the celebration hub and verify the public
  projection contains the approved name.
- Issue a 256-bit opaque collection credential, open its guest route and upload
  a magic-byte-validated JPEG with explicit consent and an idempotency key.
- Retrieve the original only through the authenticated private route, approve
  it, delete the R2 object and verify the media route returns `404` afterward.
- Revoke the collection and verify a later upload is rejected with `409`.
- Submit a public RSVP, verify it appears in the authenticated Studio, delete it
  and verify it no longer appears.
- Focused domain, privacy-header, Studio authorization and projection tests.
- Sites production build and artifact validation for every new route.

Still required before hosted activation:

- Configure `STUDIO_OWNER_EMAILS` with the approved ChatGPT account email.
- Publish the Sites deployment for anonymous guest access, then run a production
  QR/upload/moderation/delete smoke test without retaining the test original.
- Confirm the event-day retention window, owner/operator handoff and backup
  policy. Retention purge currently runs opportunistically on collection and
  Studio access; it is not represented as a scheduled deletion guarantee.
