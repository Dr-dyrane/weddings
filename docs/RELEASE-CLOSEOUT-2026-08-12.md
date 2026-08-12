# Dyrane Weddings — Public Release Closeout

- **Closeout date:** 2026-08-12
- **Repository:** `Dr-dyrane/weddings`
- **Branch:** `main`
- **Canonical production origin:** `https://weddings.dyrane.tech`
- **Verified application commit:** `87e74b91ab14291475bcd496c130a43cffb07266`
- **Verified GitHub Actions run:** `31590438532` — Quality gates, success
- **Verified production deployment:** `dpl_AK7LSwmBac98mL7vxqxBus3Hx4GH` — READY
- **Release classification:** public yardstick and award-candidate experience
- **Platform classification:** the complete multi-tenant wedding platform remains roadmap work

## 1. Closeout decision

The current **public Dyrane Weddings experience is code-complete for its declared yardstick scope**.

That scope is the anonymous public wedding journey and its truthful supporting artifacts:

- the Dyrane Weddings offer page;
- progressive package enquiry;
- the Alexander–Chioma public invitation;
- the private personalized-invitation routing boundary;
- the cinematic and manual guest journeys;
- reduced-motion, no-JavaScript, no-WebGL and WebGL-context-loss continuity;
- public and personalized social cards;
- wedding-scoped app identity and install manifest;
- downloadable calendar artifacts;
- public celebration projection;
- public RSVP behavior with an explicit persistence boundary;
- crawler policy and canonical sitemap;
- automated build, unit, browser and public-production smoke gates.

The current release is not represented as completion of every future capability described by the broader product roadmap. Couple Studio, tenant provisioning, production PostgreSQL publishing, transactional delivery and notification infrastructure, durable cross-host event collaboration and real-client onboarding remain separate workstreams.

## 2. What was completed in the closeout wave

### 2.1 Dynamic image and font reliability

The generated app icons and share cards previously trusted any successful HTTP response returned for a runtime font request. A protected deployment could return an HTML access page with status `200`, which was then passed to the image renderer as OpenType data. The visible production consequence was a `500` response from the 512-pixel wedding icon route.

The runtime asset boundary now:

- prefers the host-provided static asset binding where available;
- falls back to the canonical public origin rather than assuming the request origin is publicly readable;
- follows redirects deliberately;
- rejects unsuccessful responses;
- rejects empty bodies;
- rejects HTML and XHTML responses even when their HTTP status is `200`;
- detects common HTML document signatures when the content type is incorrect;
- validates TrueType, OpenType, WOFF and WOFF2 signatures before a binary is accepted as a font;
- exposes a dedicated `readRuntimeFontAsset` contract to both app-icon and share-card renderers.

Regression tests cover:

- supported OpenType signatures;
- canonical-origin fallback from a protected deployment URL;
- status-200 access-page rejection;
- generated root and wedding share-card output.

### 2.2 Truthful RSVP behavior

The Vercel-hosted route previously returned a simulated accepted response when the event-collaboration storage binding was unavailable. That response was incompatible with the product’s truth rule because the guest could see a thank-you state even though no response had been persisted.

The public RSVP route now acknowledges receipt only after durable storage commits the response.

When the required storage adapter is unavailable:

- the API returns `503`;
- the payload uses the explicit code `rsvp_storage_unavailable`;
- the message states that the response was **not saved**;
- the form remains available for retry;
- no thank-you state is rendered;
- browser tests fail if an unsaved response is ever presented as delivered.

The current host boundary is explicit:

- the Sites runtime can use the configured D1 event-collaboration binding;
- a runtime without that binding fails closed;
- there is no in-memory or fabricated production success fallback.

This closeout does not claim that transactional couple notification, PostgreSQL publishing or the future outbox architecture is complete.

### 2.3 Crawler and canonical discovery surfaces

The release now publishes:

- `/robots.txt`;
- `/sitemap.xml`.

The crawler contract:

- allows the public root and public wedding experiences;
- disallows API routes;
- disallows personalized invitation paths;
- disallows Studio paths;
- advertises the canonical sitemap;
- includes only public canonical routes in the sitemap;
- has automated tests preventing personalized or Studio routes from being listed.

Current public sitemap entries:

- `/`;
- `/start`;
- `/the_ogranyas`;
- `/the_ogranyas/celebration`.

### 2.4 Repeatable public-production smoke verification

The repository now includes `npm run verify:production`, backed by `scripts/verify-production.mjs`.

The smoke gate validates the canonical public host rather than only a local production server. It checks:

- root experience HTML;
- package-enquiry HTML;
- yardstick invitation HTML;
- celebration hub HTML;
- 192-pixel app icon;
- 512-pixel app icon;
- root share card;
- wedding share card;
- wedding manifest and icon declarations;
- calendar content type and iCalendar envelope;
- crawler policy;
- canonical sitemap;
- PNG signatures and minimum response sizes for generated image artifacts.

A GitHub Actions workflow runs this gate on manual dispatch and on a daily schedule.

### 2.5 Documentation and release boundaries

The README now distinguishes:

- the complete current public experience;
- the RSVP persistence boundary;
- the event-collaboration host boundary;
- the future multi-tenant platform roadmap;
- the commands for core, browser and production verification.

The release is no longer described through ambiguous language such as “foundation checkpoint” where a public experience is already complete, nor is the complete platform described as finished merely because its public yardstick is strong.

## 3. Retained CI evidence

GitHub Actions run `31590438532` completed successfully against commit `87e74b91ab14291475bcd496c130a43cffb07266`.

### 3.1 Build and unit gate

Passed:

- clean `npm ci`;
- ESLint;
- TypeScript without emission;
- **19 Vitest files**;
- **64 unit and integration tests**;
- Next.js 16.2.6 production build;
- production route collection and generation.

The generated route table includes the root experience, wedding routes, personalized routes, dynamic cards, dynamic icons, manifest, calendar, celebration routes, RSVP and collaboration APIs, `robots.txt`, `sitemap.xml` and package enquiry.

### 3.2 Browser gate

Passed on Playwright Chromium desktop and mobile-Chrome projects:

- **34 browser journeys passed**;
- **2 intentionally skipped** according to declared engine-specific scope.

The browser suite covers:

- semantic usefulness before optional presentation;
- opening threshold choreography;
- public invitation entry;
- public RSVP form and unsaved-storage state;
- focus movement after Play and bypass actions;
- no-JavaScript access to essential details;
- personalized noindex and no-store behavior;
- public versus named sharing disclosure;
- directed playback and immediate guest interruption;
- reduced-motion static parity;
- forced WebGL context loss and static replacement;
- invalid credential privacy;
- real share-card and calendar artifacts;
- invalid personalized-card degradation without recipient disclosure.

## 4. Retained production evidence

The Vercel production deployment `dpl_AK7LSwmBac98mL7vxqxBus3Hx4GH` is READY for commit `87e74b91ab14291475bcd496c130a43cffb07266`.

The following canonical production routes were requested directly and returned the expected response:

| Surface | Expected | Observed |
| --- | --- | --- |
| `/` | public HTML | `200` |
| `/start` | public HTML | `200` |
| `/the_ogranyas` | public invitation HTML | `200` |
| `/the_ogranyas/celebration` | public celebration HTML | `200` |
| `/the_ogranyas/icon/192` | PNG app icon | `200 image/png` |
| `/the_ogranyas/icon/512` | PNG app icon | `200 image/png` |
| `/card` | root PNG social card | `200 image/png` |
| `/the_ogranyas/card/3` | yardstick PNG social card | `200 image/png` |
| `/the_ogranyas/manifest.webmanifest` | install manifest | `200 application/manifest+json` |
| `/the_ogranyas/calendar` | iCalendar artifact | `200 text/calendar` |
| `/robots.txt` | public crawler policy | `200 text/plain` |
| `/sitemap.xml` | canonical public sitemap | `200 application/xml` |

The corrected production 512-pixel icon and both share-card families were inspected for PNG signatures after deployment.

A production runtime-log query covering the verification window returned no `error` or `fatal` entries after the repaired image routes were exercised.

## 5. What “finished” means here

The closeout declaration applies to the **current public yardstick experience**.

It means:

- no known code defect blocks the declared public journey;
- generated public artifacts are returning correctly;
- the release fails closed rather than lying about RSVP delivery;
- privacy-sensitive routes are omitted from crawler discovery;
- core and browser CI are green;
- the canonical production deployment is healthy;
- a repeatable production smoke command and scheduled monitor exist;
- the remaining items are external certification or future-platform scope, not hidden implementation gaps in the current public experience.

It does not mean:

- every wedding can yet be provisioned by a non-technical couple;
- the full Couple Studio publishing workflow is complete;
- all runtime hosts share the same durable storage;
- transactional invitations and notifications are delivered;
- every planned collaboration operation is activated publicly;
- real-device and field-performance certification can be inferred from CI.

## 6. External certification still required before an award submission

The following work cannot be honestly closed by code or headless CI alone:

- manual VoiceOver or equivalent screen-reader walkthrough;
- literal 200% browser-zoom craft review;
- real iOS Safari testing;
- real Android Chrome testing;
- branded desktop Safari, Firefox and Edge review;
- reverse-scroll and interruption observation on a real high-refresh display;
- representative low- and mid-range mobile GPU/frame-time evidence;
- field or credible p75 Core Web Vitals;
- live social-crawler refresh and cache observation;
- final Awwwards capture review on an anonymous, clean browser;
- monitoring and rollback observation over a meaningful production window.

These are **submission gates**, not reasons to reopen the product architecture or add more visual effects.

## 7. Future platform scope

The following remain governed by the roadmap rather than this closeout:

- reusable Couple Studio;
- authenticated multi-tenant editing;
- PostgreSQL publishing repository and migrations in the deployed production topology;
- invitation-recipient import and secure credential delivery;
- transactional email and notification outbox;
- reusable asset intake and approval;
- couple-controlled preview, approval and publish;
- durable cross-host event-collaboration activation;
- hosted event-day upload, moderation and deletion operations;
- retention scheduling and backup policy;
- production provisioning for additional couples.

Those capabilities should not delay submission hardening of the current award candidate unless the award edition explicitly depends on them.

## 8. Rollback and incident rule

The release should be rolled back or disabled when any of these occur:

- public invitation fails to render essential details;
- personalized content leaks to a public or invalid route;
- a share card, icon, manifest or calendar route begins returning HTML or `5xx`;
- RSVP presents success without durable persistence;
- the WebGL layer prevents access to the semantic journey;
- context loss leaves an empty or trapped experience;
- the public host produces sustained error or fatal runtime logs;
- crawler surfaces begin listing personalized or Studio paths.

The previous READY Vercel deployment remains a rollback candidate until the current production window is accepted.

## 9. Award-candidate decision

The product no longer needs more WebGL to become a stronger submission.

The award-preparation wave should now focus on:

1. completing the external certification list;
2. capturing the strongest desktop and mobile resting frames;
3. verifying first-load behavior from an anonymous cold session;
4. tightening only motion or typography defects discovered in real-device review;
5. preparing a concise case-study description, credits and technology disclosure;
6. submitting the anonymous public yardstick route, not a personalized link or Studio surface.

The Awwwards fee should be paid only after those external gates are retained as evidence.

## 10. Final status

**Public yardstick implementation:** complete for declared scope.

**Automated release gate:** passed.

**Canonical production deployment:** healthy.

**Future multi-tenant platform:** intentionally open.

**Awwwards external certification:** open.
