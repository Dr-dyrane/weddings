# Dyrane Weddings Profile

Status: authoritative for the Alexander and Chioma yardstick build

Version: 0.3.0

Frozen: 2026-08-09

This profile turns the wider Dyrane design canon into product rules for wedding
invitations. The share card, guest invitation, details and RSVP have different
jobs but share one guest-facing visual grammar. Couple Studio remains a
functional authoring surface with the same content truth and quality gates.

## Product promise

A shared link first feels like a formal invitation worthy of keeping. Opening it reveals a cinematic, responsive celebration whose beauty never hides the couple, date, place, people, or response action.

## Experiential north star

The guest does not browse a wedding-themed page. The approved share card begins
the invitation and unfolds into one continuous spatial experience. For the
Alexander and Chioma yardstick, pitch black, white Space Grotesk, Chioma yellow,
large numeric time and disciplined negative space form the governing language.

The experience follows the arc `Receive → Progress → Reveal → Explore → Decide
→ Anticipate`. Its current visual authority is locked in
`EXPERIENCE-NORTH-STAR.md`. Older garden, pavilion and envelope documents are
historical research until re-authored through this direction.

## Surface grammar

| Surface | Primary job | Interaction model |
| --- | --- | --- |
| Share card | Establish formality, recipient, couple, and occasion | Static, deterministic, legible at feed size |
| Guest invitation | Tell the couple's story and build atmosphere | Native-scroll editorial journey with optional spatial enhancement |
| Details | Make attendance easy | Familiar information layout and direct utilities |
| RSVP | Collect a trustworthy decision | Progressive form with local, honest feedback |
| Couple Studio | Author, review, approve, and publish | Structured workspace with progressive disclosure |

## Invariants

- Published wedding data is the only content source of truth.
- Semantic HTML contains every essential fact and action.
- Spatial rendering is optional presentation and is always `aria-hidden`.
- Native document scroll is the single journey clock.
- Personalized invitations use opaque route tokens, never guest names in URLs.
- Personalized pages are not indexed and do not emit personal data to analytics.
- One general icon family, one DOM motion owner, and one spatial rendering owner are allowed.
- Simulated facts cannot be promoted to a real published wedding without explicit couple approval.

## Variables

Each wedding may select an approved theme and vary typography, palette, imagery, chapter art, cultural motifs, event structure, people, roles, and RSVP questions. Themes cannot inject arbitrary code or change accessibility, privacy, interaction, or verification rules.

## Decision hierarchy

1. Privacy, truthful state, and accessibility.
2. Invitation clarity and task completion.
3. Content integrity and cultural specificity.
4. Performance and platform resilience.
5. Atmosphere, motion, and visual novelty.

See the adjacent contracts and ADRs. A release is not complete when it looks finished; it is complete when every applicable item in `VERIFICATION-MATRIX.md` passes.
