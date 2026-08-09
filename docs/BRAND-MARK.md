# Dynamic Couple Monogram System

Status: approved technical identity subsystem; **guest-surface placement remains
governed by `EXPERIENCE-NORTH-STAR.md`**.

The approved OGB and guest chrome do not display a monogram. Keep the dynamic
routes for favicon, manifest and couple identity needs, but do
not place the mark on share cards, headers, footers, opening controls or spatial
objects without new explicit approval. The remaining document records how the
technical generator works; it is not a placement mandate.

The wedding mark is not a fixed infinity and is not a generic Dyrane product
logo. Each
couple receives a custom monogram derived from the first letter of each partner’s
first name. The mark always reads `FIRST INITIAL & SECOND INITIAL`—for this
wedding, `A & C`. The production face is the bundled Space Grotesk Medium. The
initials are white, centered inside one Chioma-yellow circle on a pitch-black
disc. There is no alternate crest, infinity mark or ornamental fallback.

## Locked visual grammar

- derive the two initials from the published couple first names;
- preserve Unicode letters and culturally correct spelling;
- uppercase both first-name initials and place them on one baseline;
- place a visible ampersand between the first partner and second partner;
- use the same circular mark at every optical size;
- use pitch black `#000000`, white `#FFFFFF` and Chioma yellow `#FFD21E`;
- keep the identity legible without gradients, texture, lighting or animation;
- preserve the optical order: black disc, yellow ring, white initials.

The yellow circle is part of the approved identity, not a decorative card
border. Do not add a wreath, shield, second badge, stock wedding symbol or
alternate enclosure. A physical seal may carry the same complete circular mark.

## Dynamic surfaces

For each wedding slug, the same source names may continue to drive the technical
identity routes:

- `/{weddingSlug}/logo.svg` using the circular Space Grotesk mark;
- favicon, Apple touch icon, 192 px and 512 px PNG app icons;
- `/{weddingSlug}/manifest.webmanifest` and its installed-app identity.

The guest-facing share card, header, footer and opening do not consume the mark
under the current north-star contract.

Changing the published first names changes every surface automatically. There is
no manually authored `monogram` field in the published wedding snapshot.
Asset URLs include both the wedding revision and monogram-system version, so a
name or optical-master change cannot be hidden by an old browser or social cache.

## Product fallback

The current root favicon uses the Alexander and Chioma mark because this is the
published yardstick wedding. Wedding-specific routes remain authoritative and
derive their initials from each published couple.

## Production considerations

The live implementation is a deterministic typographic monogram generator. A
future uploaded vector may replace it only after optical, rights and cultural
review; no such alternate mark is currently approved.
