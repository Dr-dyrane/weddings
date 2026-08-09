# Wedding World Research and Asset Intake

Status: authoritative intake contract

This document separates facts, references and final media. Nothing moves directly from an upload into a published invitation.

## Progressive intake sequence

The future Studio asks one meaningful question at a time in this order:

1. **Identity:** names, spelling, pronunciation, formal host line and preferred salutation.
2. **Ceremonies:** date, time, timezone, venue, address and guest access.
3. **Atmosphere:** indoor, outdoor or hybrid; time of day; three feeling words; what must never appear.
4. **Story:** real milestones, dates, locations, objects and one sentence of meaning.
5. **People:** family, wedding party, roles, display order, portraits and consent.
6. **Vendors:** category, credit name, link and permission to publish.
7. **Dress:** wording, palette, fabrics and cultural guidance.
8. **Media:** portraits, venue, ring, stationery, fabric, flowers and reference imagery.
9. **Sound:** optional track or atmosphere, rights and preferred default.
10. **Guests:** households, event access, plus-ones and personalized salutation.
11. **RSVP:** attendance, meal, accessibility, notes and deadline.
12. **Approval:** preview every public fact, name, image and generated asset before publication.

## Alexander and Chioma intake status

| Area | Current state | Build fallback |
| --- | --- | --- |
| Couple names | Known | Alexander and Chioma |
| Wedding identity | Provisional | `the_ogranyas` |
| Final date and venues | Simulation | Clearly marked simulated details |
| Palette | Known direction | Lilac, ivory, night plum, champagne |
| Atmosphere | Locked for blockout | Twilight garden into glass pavilion |
| Story milestones | Open | Neutral unlabeled object blockouts |
| People and roles | Simulation | Existing consent-tagged seed only |
| Vendors | Simulation | Existing consent-tagged seed only |
| Couple portraits | Open | No generated faces; typographic frames |
| Venue photography | Open | Generated architectural concepts with provenance |
| Ring reference | Candidate exists | Use only after ownership and relevance are confirmed |
| Final logo/monogram | Simple infinity confirmed; production master/provenance open | Use one clean infinity on the seal; add no initials or symbolism |
| Sound | Open | Silent experience |

## Required media set

### Couple

- 8–15 high-resolution photographs across portrait, landscape and close detail.
- One approved hero portrait with a defined focal point.
- Optional childhood or early-story images with explicit permission.
- Names and identities of any other visible people.

### Story objects

- First-meeting place or object.
- Proposal ring and box from multiple angles.
- Meaningful location references.
- Invitation stationery, lace, fabric or motif samples.

### Venue and environment

- Exterior approach, entrance, ceremony, reception and night lighting.
- Wide photographs or video showing spatial relationships.
- Architectural plans only when the couple has permission to share them.
- Florals, furniture, table setting and signage references.

### Brand mark

- Original concept image — recovered at [`references/brand/alexander-chioma-mark-concept.jpeg`](references/brand/alexander-chioma-mark-concept.jpeg).
- Production-master vector and optical small-size edition.
- Confirmed provenance and commercial-use rights.
- Whether it belongs to this wedding only or the Dyrane Weddings product.
- Uses required: seal, card, favicon, loading mark, footer and social preview.

## File and provenance record

Every asset records:

- stable asset ID;
- original filename and checksum;
- owner/source URL;
- upload date;
- rights and consent status;
- wedding and chapter;
- crop and focal point;
- alt treatment;
- generated/not generated;
- model and prompt when generated;
- approval state and approver;
- derived variants.

## Production formats

- Photography masters: original JPEG, PNG, TIFF or HEIC retained privately.
- Web photography: AVIF/WebP variants with responsive widths.
- 3D master: Blender source or equivalent plus exported GLB.
- Web 3D: GLB with mesh compression where evidence supports it; KTX2/Basis textures.
- Marks and flat motifs: clean SVG master plus tested monochrome variants.
- Sound: lossless master plus web-delivery version; loop points documented.

## Spatial budgets

Initial mobile guardrails remain:

- optional first spatial payload at or below 2.5 MB transferred;
- deferred chapter assets loaded before their boundary, not at page boot;
- at most 150 visible draw calls;
- at most 250,000 visible triangles;
- device pixel ratio capped near 1.5 until measured evidence approves more;
- mobile textures normally at or below 2048 px per axis;
- no idle continuous render loop for a still scene;
- resources disposed when a chapter can no longer need them.

Quality ladder:

1. Semantic invitation plus editorial stills.
2. Low spatial: simplified meshes, compressed textures, no ambient particles.
3. Standard spatial: full authored composition within mobile budgets.
4. High spatial: desktop-only additions after capability and performance evidence.

The guest never selects a technical quality tier. The system chooses quietly and preserves the same composition.

## Approval rules

- Generated faces are prohibited as substitutes for real people.
- Cultural symbols are prohibited until their meaning and use are approved.
- Vendor logos and venue media require publishing permission.
- A reference image can guide art direction without being licensed for delivery.
- Rejected assets remain in the audit record but cannot enter a published snapshot.
- A simulated asset can never become public merely because the wedding status changes.
