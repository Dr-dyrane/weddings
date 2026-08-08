# Phase 1 Concept Asset Manifest

Status: generated blockout references; not couple-approved final media

Wedding: Alexander and Chioma (`the_ogranyas` preview)

Generated: 2026-08-08 with the built-in Codex `image_gen` workflow. The
provider-managed model identifier was not exposed, so it is recorded as
`built-in image_gen (model-managed)` rather than guessed. Dyrane owns the
project copy of each output subject to the service terms. No source
photography, person, venue identity, logo, or cultural symbol was supplied.

The PNG files are retained concept masters. The WebP files are quality-82 web
derivatives, capped at 1440 px wide on desktop and 900 px wide on mobile. They
are decorative art: semantic content and controls remain HTML, so their
delivery alt is intentionally empty.

## Prompt set

Every generated scene used this locked base prompt plus the scene and viewport
instruction below. This concatenated base + scene + viewport + avoid list is
the retained prompt for each corresponding asset.

**Base**

> Use case: stylized-concept. Asset type: premium immersive wedding website
> concept still and reduced-motion reference. Use Dyrane's “dimensional
> illustration / living paper” language: spatial 3D staging that reads first as
> refined two-dimensional editorial invitation art; restrained
> near-orthographic camera, graphic silhouettes, tactile matte surfaces,
> layered paper/textile depth, broad soft reflections, and premium restraint.
> Palette: ceremony night `#100A14`, plum `#2A1830`, ivory `#F4EDE3`,
> champagne `#C9A565`, lilac `#B89BCB`, foliage `#25362D`, dusk `#C87D68`.
> Materials may include fibrous ivory paper, pearl stone/textile, smoked glass,
> burnished brass, dark timber, organza, silk, foliage, and restrained flowers.

**Scene instructions**

1. **Waiting envelope:** unopened unaddressed ivory envelope floating just
   above pearl stone in darkness; plain unmarked seal; pavilion present only as
   a faint reflection; anticipation and stillness.
2. **Crossing the invitation:** an unprinted ivory card becomes milky
   translucent; its champagne edge widens structurally into a plain rectangular
   doorway; a short garden path and distant minimal pavilion appear beyond;
   paper becoming place, never a science-fiction portal.
3. **Path of us:** a curved pale garden path and single warm ribbon of light
   connect two clearings; use blank abstract paper-memory plinths rather than an
   invented cup, ring, or relationship fact; sparse ivory/lilac planting.
4. **Wedding circle:** a central low table in a gathering garden, surrounded by
   blank ivory place cards and fabric banners that suggest belonging without a
   crowd, faces, invented names, or directory grid; pavilion remains the
   orientation point.
5. **Pavilion arrival:** believable contemporary glass pavilion with open
   doors, warm brass, dark timber, pearl textile, and softened garden depth; a
   completely blank ivory architectural place card supplies the details plane.
6. **Dress and atmosphere:** pavilion-adjacent ivory organza, lilac silk,
   midnight-plum jacquard, antique-gold brass, folded samples, restrained
   flowers, and table light; a physical material tableau, not swatch circles.
7. **Taking your place:** one candlelit place setting at the pavilion threshold
   with a completely blank ivory place card or guest-book sheet integrated into
   the architecture; invitation to participate, not an admin screen.
8. **The celebration remains:** pavilion glowing quietly at night with exactly
   one newly illuminated place light; curved path and calm resting composition;
   no modal, confetti, or application-success aesthetic.

**Viewport instructions**

- **Desktop:** wide authored composition with a large calm copy-safe region;
  environmental objects, bright paper, florals, and highlights cannot enter
  the future text rectangle.
- **Mobile:** independently authored portrait composition, never a crop;
  shorter depth travel, fewer foreground occluders, and one stable upper or
  lower copy sheet with generous inset margins.

**Avoid list used on every generation**

> No people, faces, portraits, hands, human silhouettes, text, letters,
> numbers, names, calligraphy, logos, monograms, emblems, marked seals, crowns,
> castles, palaces, neon, generic African motifs, invented sacred or cultural
> symbols, watermarks, fantasy portals, excessive bloom, glitter, confetti,
> plastic flowers, mirror chrome, or wide-angle spectacle.

## Source masters

All checksums are SHA-256. Approval is `blockout-provisional`; generated media
cannot be promoted into a real published wedding without explicit review.

| Asset ID | Chapter / viewport | File | Dimensions | SHA-256 | Copy-safe composition |
| --- | --- | --- | ---: | --- | --- |
| `concept-00-card` | Scene 0 / social | `public/og/modern-heirloom-card.jpg` | 1200×630 | `cae646abbc97725cb06c2e016de182c8de7321a50b3fa3bf037b7bc799f13465` | Central ivory card; existing repository art, original generation record open |
| `concept-01-d` | Scene 1 / desktop | `public/concepts/scene-1-envelope-desktop.png` | 1672×941 | `1ca521c918f1d5679d04f319da16717201d4632f9e1d980af80770967d8173a6` | Dark left field |
| `concept-01-m` | Scene 1 / mobile | `public/concepts/scene-1-envelope-mobile.png` | 941×1672 | `550fd7d4040451b4d63100ae5d2a5cbae4eac2cb02060f806af1871af444cc88` | Dark upper field |
| `concept-02-d` | Scene 2 / desktop | `public/concepts/scene-2-threshold-desktop.png` | 1672×941 | `5243a834a154e6ab39f6a5d26b6e1817c7db7631c8bee4471230bca0912244c0` | Dark left field |
| `concept-02-m` | Scene 2 / mobile | `public/concepts/scene-2-threshold-mobile.png` | 941×1672 | `8fd687c83321d038c760331ef258bd4cc764ee390ca5586a4ea1c15942a24690` | Dark upper field |
| `concept-03-d` | Scene 3 / desktop | `public/concepts/scene-3-story-garden-desktop.png` | 1536×1024 | `8022aab60b98b7df929151664d0f116c392effd7c59c5e48355dd4e65c5c8246` | Dark upper-left field |
| `concept-03-m` | Scene 3 / mobile | `public/concepts/scene-3-story-garden-mobile.png` | 887×1774 | `3976af3f6d71be2c7b5876f74c632cce23f059c88fcd27b2bd129eaf1cf0e6e7` | Dark upper field |
| `concept-04-d` | Scene 4 / desktop | `public/concepts/scene-4-wedding-circle-desktop.png` | 1536×1024 | `6eaa464c4b2e486e66d9727150db83bf5832f2c3365c2fedf35ef2d5bf187157` | Stable path foreground |
| `concept-04-m` | Scene 4 / mobile | `public/concepts/scene-4-wedding-circle-mobile.png` | 1024×1536 | `a85730449f9638c2201c59ef683a8fbd38b6c12a2da2b3f561bd2e6aad0d4391` | Stable path foreground |
| `concept-05-d` | Scene 5 / desktop | `public/concepts/scene-5-pavilion-desktop.png` | 1672×941 | `eceed9bbd7c90eae204f1fb20d24d1bc5b6f17ff6b8027372308e97be09d5d00` | Blank suspended ivory sheet |
| `concept-05-m` | Scene 5 / mobile | `public/concepts/scene-5-pavilion-mobile.png` | 941×1672 | `adc5c8a9ae863bcdcb2d44ca5fa4b699e638dfe57e4369207820e57f565560f4` | Blank lower ivory sheet |
| `concept-06-d` | Scene 6 / desktop | `public/concepts/scene-6-dress-atmosphere-desktop.png` | 1536×1024 | `d27251cb11191169ed163c43d26076f85e44702bcaf317ab1f7f9aff6093ddd5` | Dark left field |
| `concept-06-m` | Scene 6 / mobile | `public/concepts/scene-6-dress-atmosphere-mobile.png` | 941×1672 | `ec58e3368788ba5c71c3f9f1952f82c34046820e4f6a83881e1e27b7a0db9552` | Dark lower sheet |
| `concept-07-d` | Scene 7 / desktop | `public/concepts/scene-7-rsvp-desktop.png` | 1536×1024 | `27ba09ac813fa3c94d63abaa7b7e72e6fc6a442172cb537b879164d05cc4b93c` | Blank right ivory sheet |
| `concept-07-m` | Scene 7 / mobile | `public/concepts/scene-7-rsvp-mobile.png` | 941×1672 | `3c4155151b245b044724149ff5ae7d9b969bb6cd3798626c0701b36695ad6074` | Blank lower ivory sheet |
| `concept-08-d` | Scene 8 / desktop | `public/concepts/scene-8-remains-desktop.png` | 1402×1122 | `55c27e746f8946ae3a8cb99b01fbdcf55b6f14f9983d4e73df1d121a99c7b51d` | Dark left field |
| `concept-08-m` | Scene 8 / mobile | `public/concepts/scene-8-remains-mobile.png` | 864×1821 | `02e8db5abff233892adcb1b695f7af6a5e150d84f5ae7589185e1c4e83a87080` | Dark lower field |

## Web derivatives

The derived WebP files use the same basename. Their combined weight is about
1.6 MB, but they are chapter-lazy assets—not an initial spatial payload.

| Scene | Desktop WebP SHA-256 | Mobile WebP SHA-256 |
| --- | --- | --- |
| 1 | `02b77f6aa199e6b36cc127521d52186d9b8b800bea0db50b8808b0fe1a4a87d0` | `1b1d01462bae21bbd4b44c02f6c65a24c468862bcc55ab4bde9fcdfb665ba4cd` |
| 2 | `716f21d313595cdd62bb462d37e48e7148027a1065d04dbd3f2e972a78c2a8fb` | `2472e4bfe0273a22ca92a8ee0d3d44c661928ad9245ff4253967003a1182f347` |
| 3 | `0c9ea4ea235f6816c3cc3163c85dbdc7e0729e0d3cb8f2a946f9faacb16deb4d` | `f36ba84eb3353540b72d247fd3f920c79bac2373fc172748577cb579287cb43e` |
| 4 | `b926c6d0c4ea70755261cc84df630526c2c358f12a47868b31c50e3cbcb85f5a` | `3d539860652c9760b6c1bc8b2e7a0ad835d9e3ee2b01eab0ddabf794fdd681c7` |
| 5 | `11d292840c4bf4e71fded1a93e11b1a3f2e884a11aa8bbf154101b2b1cb59faa` | `b8a1be1ee8aacbc939d72890d0799df77317f3aa5c24a5a27a8b3d146108602f` |
| 6 | `c20cf19f100c36f168ccb75866d4986adfed7b47354dc9f92e1ee8e7dcab0dd7` | `b88322b5bda18b4d07bcaaac732619023ac19378c575a600f516a164860c5e60` |
| 7 | `6794b1f44402bfd6d10c2faa6e86fff566518cfdc28042ff37c52c7cb4be4c8a` | `a00050c388cec47fe7829833fd1bf2592bdf5ea6e92053c306905d885e5f0ce4` |
| 8 | `ffa56466dda4f921b3423067042e46d0bcbc2c73a065d15000ade0678ef15ee5` | `aafa49e7743787aa04b2b94eb2db3eeff2a96f88fb2ae7d382d8d8a5c1657472` |

## Approval and use

- Approval: generated blockout only.
- Owner/source: Dyrane project generation; no external source URL.
- Focal/crop: the authored viewport is the approved crop; do not crop desktop
  into mobile.
- Delivery: decorative (`alt=""`); all meaning remains in semantic DOM.
- Promotion stop: couple/venue/cultural review is required before a real
  published wedding may use any frame as final media.
