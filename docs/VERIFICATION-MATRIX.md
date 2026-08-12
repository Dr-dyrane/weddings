# Verification Matrix

No release may mark a row complete without retained evidence in CI, preview review, production observation or the release record.

## Gate status

| Gate | Pass condition | Current public yardstick status |
| --- | --- | --- |
| Build | Clean install, lint, typecheck, unit tests, production build | **Passed in CI** |
| Copy | Zero banned guest terms; one dominant purpose and action per state | **Passed for current public path** |
| Content | Initial, empty, partial, ready, revoked, unavailable and error states authored | **Passed for current public path** |
| Accessibility | Zero serious/critical axe findings; complete keyboard path; manual screen-reader pass; 200% zoom and 320px reflow | **Automated and reflow evidence passed; manual screen reader and literal zoom remain external** |
| Motion | Purpose declared; interruptible; reverse-scroll coherent; reduced/static equivalent verified | **Passed in synthetic and browser evidence; real high-refresh observation remains external** |
| Touch | Preferred targets at least 44×44 CSS px; no hover-only behavior | **Passed in current automated evidence** |
| Performance | p75 LCP ≤2.5 s, INP ≤200 ms, CLS ≤0.1; no idle render loop | **Local lab and idle-render evidence passed; field p75 remains external** |
| Spatial | Semantic DOM parity; no-WebGL and context-loss fallback; mobile budget benchmark | **Parity and context-loss passed; representative mobile GPU budget remains external** |
| RSVP | No success before durable persistence; idempotent persisted path; unavailable/error/retry tested | **Truth boundary passed; hosted durable activation depends on the selected storage runtime** |
| Responsive | 320, 375, 390, 430, 768, 1024 and 1440 CSS pixels | **Automated release coverage passed for required layout classes; final physical-device craft review remains external** |
| Browsers | iOS Safari, Android Chrome, desktop Safari, Chrome, Firefox and Edge | **Chromium desktop/mobile engine passed; branded and physical-browser matrix remains external** |
| Metadata | Generic, personalized, invalid and revoked cards; long-name and Unicode fixtures; live crawler checks | **Generated artifacts and canonical crawler surfaces passed; social-cache refresh remains external** |
| Visual identity | Approved OGB grammar preserved: black dominant field, Space Grotesk hierarchy, yellow only for progress/interaction/state or physically justified threshold light; couple contour is source-derived, full-height, subordinate and not stock; no unapproved hue, monogram, ornament, border, haze or extra panel | **Passed for current yardstick** |
| Privacy | No PII in analytics, logs or referrers; noindex personalized route; invalid/revoked privacy and tenant tests | **Passed for current route and test scope** |
| Release | Preview E2E, canonical production smoke, monitoring, rollback and data-boundary checks | **Automated build/browser and direct production smoke passed; observation window and data-backup policy remain operational** |

## Yardstick journeys

1. Open the generic invitation without JavaScript and reach all essential details.
2. Open a valid personalized link and confirm its salutation and noindex metadata.
3. Open an invalid or revoked link and confirm no identity disclosure.
4. Skip opening motion, use keyboard navigation, add the event to a calendar, open directions and share with fallback.
5. Submit an RSVP and confirm that success appears only after durable persistence; when storage is unavailable, confirm a visible unsaved state and retry path.
6. Repeat the guest journey with reduced motion, no WebGL, narrow mobile, 200% zoom and a screen reader.
7. Force WebGL context loss and confirm the semantic and authored static experience replaces the live canvas without losing position or action.
8. Request public icons, cards, manifest, calendar, robots policy and sitemap from the canonical production origin.

## Retained Phase 1 evidence — 2026-08-09

Passed locally on the production build:

- ESLint, TypeScript and the then-current Vitest suite.
- Next.js production compilation and route generation.
- Current public and personalized guest paths in desktop Chromium and the Playwright Pixel 7 profile: opening, semantic details, functional RSVP form, focus transfer, restored deep-scroll reset to the welcome, public/named share disclosure, invalid credentials, share cards and calendar artifacts.
- Reduced-motion static parity: no canvas, authored responsive chapter plate and complete semantic details.
- Forced `webglcontextlost`: the live canvas unmounts and the same authored static chapter world takes over on desktop and mobile profiles.
- Playwright Chromium, Firefox and WebKit engine coverage for the Phase 1 evidence spec. This is engine evidence, not a claim about branded or physical browsers.
- Reflow across the complete semantic journey at 320 CSS px and 640 CSS px—the latter is the layout equivalent of a 1280px viewport at 200%—with no horizontal overflow and tested action heights of at least 44px.
- Synthetic forward/reverse interruption settled on the correct chapter and progress direction.
- Single-run local Chromium lab sample: LCP 400ms, CLS 0.0020, Event Timing interaction candidate 56ms, zero idle WebGL draw calls over one second, three long-animation frames and a 126.7ms maximum. This is not field p75 or mobile GPU evidence.
- Axe serious/critical scan of the current public path, with the aria-hidden oversized ghost date explicitly classified as incidental artwork; its adjacent semantic `time` remains available at full contrast.

## Retained public-release evidence — 2026-08-12

### GitHub quality gate

GitHub Actions run `31590438532` passed on commit `87e74b91ab14291475bcd496c130a43cffb07266`.

Retained results:

- clean `npm ci`;
- ESLint passed;
- TypeScript passed;
- **19 Vitest files passed**;
- **64 unit and integration tests passed**;
- Next.js 16.2.6 production build passed;
- **34 Playwright Chromium desktop/mobile journeys passed**;
- **2 intentional browser-test skips** retained by the declared engine scope.

The current suite verifies the public invitation, optional spatial presentation, semantic bypass, no-JavaScript access, personalized privacy, invalid-credential behavior, sharing disclosures, calendar and card artifacts, reduced motion, interruption, context loss, focus transfer and the RSVP unsaved-storage state.

### Runtime-asset repair

Generated icon and share-card font loading now:

- prefers the runtime static-asset binding;
- falls back to the canonical public origin;
- rejects non-successful, empty and HTML responses;
- detects access pages returned as status `200`;
- validates OpenType container signatures before image rendering.

Regression coverage retains the protected-deployment failure mode that previously caused the 512-pixel icon route to return `500`.

### RSVP truth boundary

The current public API no longer simulates an accepted response when event storage is unavailable.

Retained behavior:

- durable commit before `received` success;
- `503` and `rsvp_storage_unavailable` when the adapter is absent;
- explicit copy that the response was not saved;
- retry remains available;
- no thank-you heading or false delivery state in the browser suite.

### Canonical production verification

Vercel deployment `dpl_AK7LSwmBac98mL7vxqxBus3Hx4GH` reached `READY` for commit `87e74b91ab14291475bcd496c130a43cffb07266`.

Direct canonical-origin requests returned the expected content and status for:

- root experience;
- package enquiry;
- public yardstick invitation;
- celebration hub;
- 192-pixel and 512-pixel PNG app icons;
- root and wedding PNG share cards;
- wedding install manifest;
- iCalendar download;
- `robots.txt`;
- `sitemap.xml`.

After the repaired generated-media routes were exercised, the production log query returned no `error` or `fatal` entries within the verification window.

The repository now includes:

```bash
npm run verify:production
```

This checks the same public surface repeatedly from the canonical host. `.github/workflows/production-smoke.yml` runs it on manual dispatch and a daily schedule.

The detailed closeout and scope boundary are retained in [`RELEASE-CLOSEOUT-2026-08-12.md`](./RELEASE-CLOSEOUT-2026-08-12.md).

## External certification still open

The current public yardstick implementation may be described as code-complete for its declared scope. It must not yet be described as externally certified for award submission until the following evidence exists:

- literal manual 200% browser-zoom craft review;
- VoiceOver or equivalent manual screen-reader pass;
- real iOS Safari;
- real Android Chrome;
- branded desktop Safari, Firefox and Edge;
- reverse-scroll and interruption observation on a real high-refresh display;
- representative low- and mid-range mobile GPU/frame-time evidence;
- field or credible p75 Core Web Vitals;
- live social-crawler refresh and cache observation;
- monitoring and rollback observation over a meaningful production window.

These are external and operational gates. They are not permission to add more WebGL or redesign a stable guest experience without evidence of a defect.

## Retained event-collaboration evidence — 2026-08-09

Passed locally against the Sites D1 and private R2 development bindings:

- Create an approved credit, publish the celebration hub and verify the public projection contains the approved name.
- Issue a 256-bit opaque collection credential, open its guest route and upload a magic-byte-validated JPEG with explicit consent and an idempotency key.
- Retrieve the original only through the authenticated private route, approve it, delete the R2 object and verify the media route returns `404` afterward.
- Revoke the collection and verify a later upload is rejected with `409`.
- Submit a public RSVP, verify it appears in the authenticated Studio, delete it and verify it no longer appears.
- Focused domain, privacy-header, Studio authorization and projection tests.
- Sites production build and artifact validation for every new route.

Still required before hosted event-collaboration activation:

- Configure `STUDIO_OWNER_EMAILS` with the approved owner account email.
- Publish the Sites deployment for anonymous guest access, then run a production QR/upload/moderation/delete smoke test without retaining the test original.
- Confirm the event-day retention window, owner/operator handoff and backup policy.
- Replace opportunistic retention purge with a scheduled guarantee before describing deletion timing as guaranteed.
- Confirm which deployed host owns durable RSVP and event-collaboration storage; hosts without the binding must continue to fail closed.

## Completion boundary

### Complete for the current public yardstick

- public offer and enquiry;
- public and personalized invitation routes;
- opening, spatial and manual guest journeys;
- semantic, reduced-motion, no-JavaScript, no-WebGL and context-loss paths;
- public and personalized card generation;
- wedding app identity, manifest and calendar;
- crawler surfaces;
- truthful RSVP failure behavior;
- unit, build and Chromium desktop/mobile release gates;
- canonical production artifact verification;
- repeatable production smoke monitor.

### Intentionally open platform work

- reusable Couple Studio;
- non-technical tenant provisioning;
- production PostgreSQL publishing topology;
- secure recipient import and invitation delivery;
- transactional email and notification outbox;
- reusable asset intake and approval;
- couple-controlled preview and publish;
- durable cross-host event collaboration;
- hosted moderation, retention scheduling and backup operations;
- additional real-client wedding publication.
