# ADR 0003: Motion ownership

Status: accepted

## Decision

Native browser scroll is the only scroll clock. Motion owns DOM animation. React Three Fiber owns spatial animation and reads normalized document progress without per-frame React state. No smooth-scroll replacement is allowed. GSAP requires a new ADR for one isolated scene.

## Consequences

Back, anchors, accessibility tooling, and browser scrolling remain predictable. One element cannot have competing animation owners. Reduced-motion behavior is a product mode, not a CSS afterthought.
