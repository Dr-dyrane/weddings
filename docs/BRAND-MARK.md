# Dynamic Couple Monogram System

Status: technical identity subsystem implemented; **visible guest use
superseded by `EXPERIENCE-NORTH-STAR.md`**.

The approved OGB and guest chrome do not display a monogram. Keep the dynamic
routes for favicon, manifest and future couple-approved identity needs, but do
not place the mark on share cards, headers, footers, opening controls or spatial
objects without new explicit approval. The remaining document records how the
technical generator works; it is not a placement mandate.

The wedding mark is not a fixed infinity and is not a Dyrane product logo. Each
couple receives a custom monogram derived from the first letter of each partner’s
first name. The mark always reads `FIRST INITIAL & SECOND INITIAL`—for this
wedding, `A & C`. The production face is Cinzel Decorative with a restrained
custom slant, bundled under the SIL Open Font License.

The earlier Alexander–Chioma infinity concept remains preserved at
[`references/brand/alexander-chioma-mark-concept.jpeg`](references/brand/alexander-chioma-mark-concept.jpeg)
as superseded research. It must not be shipped as the couple identity.

## Locked visual grammar

- derive the two initials from the published couple first names;
- preserve Unicode letters and culturally correct spelling;
- uppercase both first-name initials and place them on one baseline;
- place a visible ampersand between the first partner and second partner;
- use the same frame-free mark at every optical size;
- use champagne or burnished gold on deep plum, or deep plum on warm ivory;
- keep the identity legible without gradients, texture, lighting or animation.

Do not surround the initials with a wreath, shield, badge, border or stock
wedding symbol. The physical wax or foil surface may remain; its imprint is only
the slanted `INITIAL & INITIAL` lockup.

## Dynamic surfaces

For each wedding slug, the same source names may continue to drive the technical
identity routes:

- `/{weddingSlug}/logo.svg` using the frame-free italic mark;
- favicon, Apple touch icon, 192 px and 512 px PNG app icons;
- `/{weddingSlug}/manifest.webmanifest` and its installed-app identity.

The guest-facing share card, header, footer and opening do not consume the mark
under the current north-star contract.

Changing the published first names changes every surface automatically. There is
no manually authored `monogram` field in the published wedding snapshot.
Asset URLs include both the wedding revision and monogram-system version, so a
name or optical-master change cannot be hidden by an old browser or social cache.

## Product fallback

Routes outside a wedding use the same frame-free italic system with the initials
`DW` for Dyrane Weddings. This fallback never replaces a valid couple identity.

## Production considerations

The live implementation is a deterministic typographic monogram generator. A
future atelier tier may add an art-directed, couple-approved master while keeping
the same component and route contract. Any custom master needs provenance,
rights, optical exports for 16–32 px, and fallbacks for unsupported formats.
