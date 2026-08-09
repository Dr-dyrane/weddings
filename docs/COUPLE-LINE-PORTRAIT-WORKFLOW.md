# Reusable couple line-portrait workflow

Status: active production workflow

This document preserves the method used to create the approved Alexander and
Chioma contour without turning their likeness into a reusable stock wedding
silhouette. The **process** is reusable; every couple receives a new,
identity-derived and explicitly approved asset.

## Outcome contract

The final asset is a tall, transparent, continuous-line portrait that:

- suggests the real couple through posture, proportion, hair and restrained
  profile cues rather than detailed facial rendering;
- uses a slim, full-height composition with generous negative space;
- contains approximately 10–14 deliberate contour strokes rather than an
  illustrated or filled silhouette;
- reacts to one declared light source through variable line colour, weight and
  opacity;
- remains secondary to typography and the progress/threshold signal;
- has no stock bride-and-groom pose, veil, suit, bouquet, ring, facial detail,
  text, monogram, glow, haze or decorative flourish.

An attractive anonymous couple is a failure. A recognizable but over-rendered
portrait is also a failure. The target is identity through reduction.

## 1. Private intake and consent

Collect identity references separately from style references.

For each person request:

- one clear front-facing portrait;
- one three-quarter portrait;
- one side/profile view;
- one upper- or full-body image showing natural proportions;
- one useful hair reference when the hairstyle is an identity cue.

Prefer sharp, evenly lit images without filters, obstructions or extreme lens
distortion. Confirm both people consent to identity-derived generation and to
the intended public use before generation begins.

Source photographs stay private. Do not commit them, expose them under
`public/`, include them in build artifacts or reuse them for another wedding.
Record only the consent state, source count and which cues were prioritized.

## 2. Separate identity, pose and art direction

Use three distinct inputs:

1. **Identity references** — who the two people are.
2. **Pose reference** — the desired relationship, crop and posture.
3. **Art contract** — line economy, canvas, light direction and exclusions.

The pose reference must not replace the identity references. It contributes
only posture and composition. This separation prevented the Alexander and
Chioma result from becoming a generic copy of the supplied wedding silhouette.

## 3. Generate in locked stages

Do not ask one prompt to solve likeness, pose, line economy, lighting and exact
brand colour at once. Lock one property at each stage.

### Stage A — identity abstraction

Generate a sparse study from the approved photographs. Preserve only stable
identity cues: relative height, head shape, hair silhouette, neck/shoulder
relationship and essential profile proportions. Use a uniform chroma-key
background and forbid styling, wedding clothing and filled areas.

This stage is provisional and cannot be published.

### Stage B — composition

Apply the approved pose reference while preserving the identity cues from
Stage A. Use this prompt structure:

> Follow the supplied pose reference only for posture and composition. Create a
> tall, slim, elongated back-and-side view of `[first person]` and `[second
> person]` in a quiet embrace, using their approved identity photographs for
> proportion, head shape and hair. Place the foreground figure’s shoulder,
> back and waist contour through nearly the full canvas height, with the second
> figure closely behind and slightly above. Use at most 10–14 smoke-white
> continuous contour strokes on a tall 2:3 chroma-key canvas. Keep the couple
> against the designated edge and preserve generous copy-safe negative space.
> No eyes, facial rendering, individual hair strands, clothing detail, fill,
> glow, text, logo, progress bar or stock wedding iconography.

Approve posture, slimness, crop, line count and negative space before adding
colour. Alexander and Chioma’s approved composition master was 1024×1536.

### Stage C — directional light

Edit the approved composition instead of regenerating it:

> Preserve the exact canvas, pose, anatomy, slim proportions, crop, line paths
> and negative space. Change only line colour and line weight so the portrait
> reacts physically to `[light colour]` arriving from `[direction]`.
> Light-facing contours become selectively thicker and illuminated; receding
> contours remain hairline smoke-grey. Taper weight and colour gradually along
> each contour. No glow, haze, new line, removed line, facial detail, clothing
> detail, text, logo or object. Retain the chroma-key background.

For Alexander and Chioma the light arrives from the left. Fully illuminated
cores use `#FFD21E`; transitions pass through restrained champagne; receding
lines use dim smoke-grey. The varying strokes make the drawing feel lit rather
than uniformly coloured.

### Stage D — deterministic token normalization

Image generation establishes the natural transitions. A deterministic final
pass then maps only the fully saturated illuminated core pixels to the exact
interface token. Do not flatten antialiased edges, champagne transitions or
receding grey strokes. This was the v4→v5 step for Alexander and Chioma.

## 4. Remove the chroma background

Use the image-generation workflow’s chroma-removal helper with:

- a soft matte;
- colour despill;
- a one-pixel edge contraction only when a fringe remains;
- transparent RGBA output at the approved master dimensions.

Inspect the result at 100% and against black. Reject green fringes, broken
hairlines, opaque islands, softened contour endpoints and accidental fills.

## 5. Composite before approval

Approval happens on the actual product canvas, not on the transparent asset in
isolation.

For a 1200×630 OGB, the Alexander and Chioma portrait master is rendered at
460×690, 15 px beyond the right edge and 30 px above the canvas. This lets the
portrait occupy the full height while keeping the top-left identity and
bottom-left date unobstructed. Future couples require independently approved
placement; these numbers are a yardstick, not a universal crop.

Check desktop OGB, mobile opening, dark compositing, typography clearance and
the first animated reveal. Never stretch or crop one composition into a layout
it was not authored for.

## 6. Approval gates

The asset advances only when every gate passes:

1. both people consent to the references and intended use;
2. identity cues feel specific without detailed face generation;
3. pose and body proportions are natural, slim and intentional;
4. line count and negative space satisfy the art contract;
5. directional weighting matches the declared light source;
6. the strongest stroke and interface signal share the exact approved token;
7. the composited OGB and mobile opening remain readable;
8. the couple approves the final likeness and placement;
9. checksum, prompt, dimensions, approval and provenance are recorded.

## 7. Versioning and storage

Use wedding-scoped immutable IDs such as:

```text
{wedding-slug}-line-portrait-v1
{wedding-slug}-line-portrait-v2
```

Never overwrite an approved file. Each version receives:

- a PNG master with transparent background;
- a Markdown provenance record beside the master;
- exact prompt or edit instruction;
- dimensions and SHA-256 checksum;
- status: provisional, composition-approved, palette-approved, published or
  superseded;
- the asset ID selected by the published wedding snapshot.

Source photographs remain private. The approved line derivative stays outside
`public/` and is selected server-side; a wedding-scoped route may serve that
approved derivative because the opening experience needs it. Do not expose
the intake photographs or treat any delivered portrait as a reusable public
asset library.

The current schema enumerates only `alexander-chioma-line-v5`. Before onboarding
another couple, replace that one-wedding enum with a wedding-scoped approved
asset registry. The registry must reject cross-wedding asset references.

## 8. Reuse rule

Reuse this workflow, its review gates and its naming contract. Do not reuse the
Alexander and Chioma pixels, pose approval, photographs, prompt-specific
identity cues or checksum. Every couple starts again at private intake.
