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
| Visual identity | Approved OGB grammar preserved: black dominant field, Space Grotesk hierarchy, yellow only for progress/interaction/state, no unapproved hue, monogram, ornament, border, haze or extra panel |
| Privacy | No PII in URL, analytics, logs, or referrers; noindex personalized route; revocation and tenant tests |
| Release | Preview E2E, production smoke, monitoring, rollback, and data-backup checks |

## Yardstick journeys

1. Open the generic invitation without JavaScript and reach all essential details.
2. Open a valid personalized link and confirm its salutation and noindex metadata.
3. Open an invalid or revoked link and confirm no identity disclosure.
4. Skip opening motion, use keyboard navigation, add the event to a calendar, open directions, and share with fallback.
5. Submit, refresh, edit, retry, and de-duplicate an RSVP.
6. Repeat the entire journey with reduced motion, no WebGL, narrow mobile, 200% zoom, and a screen reader.
