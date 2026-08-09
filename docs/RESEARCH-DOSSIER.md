# Immersive Wedding Experience Research Dossier

Status: locked for Phase 1

Research date: 2026-08-08

Question: what makes a digital wedding invitation feel like entering a celebration rather than opening a decorated webpage?

## Finding 1 — The category baseline has moved

Current digital-invitation products already offer animated envelope openings, private links, mobile themes, music, personalized guest names, maps, calendars, RSVP dashboards and reminders. Examples include [Evite.co](https://eviteco.com/), [Marrly](https://marrly.com/en), [PrimeVenue](https://primevenue.app/) and [Eternal Wedding Bells](https://www.eternalweddingbells.com/).

These are necessary product capabilities. They are not a defensible experiential idea.

**Decision:** Dyrane Weddings will not define premium as more floral decoration, more sections or a longer animation. Premium means the guest feels a change of place.

## Finding 2 — Formality comes from restraint and material credibility

Royal wedding stationery provides a useful material lesson without requiring imitation. The 2018 royal invitations used black and gold printing, burnishing, gilded edges, a formal badge and recipient-specific calligraphy. The value came from hierarchy, process and tactile precision rather than decorative volume. See [Printweek's production account](https://www.printweek.com/content/news/barnard-westwood-prints-royal-wedding-invitations/) and [Sky News' invitation report](https://news.sky.com/story/pictures-of-harry-and-meghans-wedding-invitations-revealed-11300169).

**Adopt:** recipient specificity, formal hierarchy, burnished highlights, edge light, tactile ivory, disciplined black and gold.

**Adapt:** discard the badge and use only the couple's frame-free italic initials;
gilded edges become controlled light response; calligraphy is used for one
ceremonial accent, not paragraphs.

**Reject:** crowns, generic coats of arms, excessive baroque borders, faux nobility and literal imitation of a royal household.

## Finding 3 — Immersion needs one authored world

Studios such as [Lusion](https://lusion.co/) demonstrate that memorable spatial work combines art direction, motion, 3D and interaction around one coherent world. Their [My Little Storybook](https://v2.lusion.co/work/my-little-storybook/) is especially relevant because handcrafted 3D assets and illustration support a chaptered story rather than a product configurator. [Immersive Garden](https://winners.webbyawards.com/2025/websites-and-mobile-sites/features-design/best-visual-design-aesthetic/333859/immersive-garden) is evidence that emotional visual craft is itself a judged experience quality.

**Decision:** the invitation is one continuous place with changing rooms and light, not a stack of unrelated 3D demonstrations.

The guest journey is:

`Receive → Open → Cross → Wander → Gather → Arrive → Reply → Anticipate`

## Finding 4 — A wedding invitation should not behave like a game

Many experimental 3D sites rely on drag, orbit, first-person movement or instruction overlays. Those mechanics shift attention from the couple to navigation and are fragile on phones.

**Decision:** native vertical scroll remains the only required spatial control. Pointer movement may create a restrained reflection response. No essential object requires dragging, orbiting, tilting or discovering an invisible hotspot.

## Finding 5 — Native scroll is both expressive and reversible

[MDN's scroll-driven animation guidance](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Scroll-driven_animations) describes scroll- and view-progress timelines that move forward and backward with the user's scroll. Its performance guidance favours compositor-capable declarative effects where available.

**Decision:** DOM reveals should prefer CSS view timelines with a feature-detected fallback. The spatial camera may read chapter progress, but it cannot replace the document, capture the wheel or smooth-scroll the page.

## Finding 6 — Atmosphere cannot depend on sound

Browsers commonly block audible autoplay until the guest has interacted, and unsolicited sound is disruptive. See [MDN's autoplay guide](https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Autoplay).

**Decision:** the experience is complete in silence. After the guest opens the invitation, a visible optional sound control may start a restrained soundscape. Sound state remains obvious, reversible and session-persistent. No spoken fact or task exists only in audio.

## Finding 7 — Motion has a physical cost

W3C guidance warns that parallax and interaction-triggered movement can cause dizziness, nausea and headaches. It recommends preventing non-essential motion through user preference or a dedicated control. See [WCAG animation from interactions](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html) and [Technique C39](https://www.w3.org/WAI/WCAG22/Techniques/css/C39).

**Decision:** reduced motion is a separately art-directed composition, not the animated version with durations set to zero. Camera travel, parallax, animated blur, tilt and z-depth are removed. The envelope, garden and pavilion remain as still editorial scenes.

## Finding 8 — Performance is part of luxury

A cinematic scene that blocks interaction or arrives late feels cheaper than a fast static invitation. Core Web Vitals retain the product targets already recorded in `VERIFICATION-MATRIX.md`: LCP at or below 2.5 seconds, INP at or below 200 ms and CLS at or below 0.1. [web.dev's field workflow](https://web.dev/articles/vitals-tools) treats these as user-experience thresholds. [MDN's WebGL practices](https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/WebGL_best_practices) also caution against blocking GPU queries and retaining unused resources.

**Decision:** semantic invitation content and the first atmospheric still arrive before the optional spatial bundle. High-fidelity assets stream by chapter. Quality degrades before responsiveness does.

## Competitive pattern ledger

| Pattern | Decision | Dyrane expression |
| --- | --- | --- |
| Envelope opening | Adapt | The envelope is a threshold into the venue, not an isolated intro animation. |
| Wax seal | Adopt with approved mark | Physical-looking seal, brief break, no ornate stock crest. |
| Background music | Adapt | Optional after intent; quiet garden and hall soundscape; immediate mute. |
| Long wedding webpage | Reject | Chapters exist spatially; essential details remain directly reachable. |
| Photo slideshow | Reject as default | Photographs become framed memories or environmental projections. |
| Countdown | Optional | Details utility only; never the visual hero. |
| Scroll-jacking | Reject | Native scroll, normal browser history and reverse travel. |
| Cursor spectacle | Reject | Pointer affects only local light or material response. |
| Full 3D navigation | Reject | No game controls or mandatory exploration. |
| Personalized greeting | Adopt | Recipient appears on the share card and opening threshold. |
| Generic public sharing | Adopt | Safe default when sharing from a private invitation. |
| Theme templates | Adapt | Curated spatial directions with fixed behavioural contracts. |

## Dyrane differentiation

The category says: “Here is a beautiful invitation.”

Dyrane Weddings says: **“You have arrived.”**

The page is treated as ceremonial architecture. Every scene must answer one of four questions:

1. Where have I arrived?
2. Whose celebration is this?
3. What part of their story am I entering?
4. What should I do next?

Anything that answers none of them is decoration and must justify its cost or be removed.

## Research still open

- Recovered couple-mark meaning, provenance, final vector and seal construction.
- Couple-approved cultural motifs and textile references.
- Real venue architecture, photographs and floor/landscape character.
- Licensed sound direction.
- Real relationship milestones and proposal object.
- Reference-device field measurements after the first asset blockout.

Open research uses the fallbacks in `ASSET-INTAKE.md`; it does not block environmental prototyping.
