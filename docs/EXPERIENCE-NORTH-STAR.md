# Alexander and Chioma Experience North Star

Status: **locked**

Approved: 2026-08-09

Scope: Alexander and Chioma yardstick, and the default guest-facing direction
for Dyrane Weddings until a later couple-approved theme explicitly replaces it.

## The governing idea

> The experience is the approved share card unfolding into a spatial world.

The share card is not a marketing derivative of the invitation. It is the
first frame of the invitation and the visual source of truth for everything
that follows. If a guest-facing UI decision cannot be naturally derived from
this frame, it does not belong in the experience.

## Approved first frame

The canonical renderer is
[`domains/invitations/share-card.tsx`](../domains/invitations/share-card.tsx)
at public edition `3`. It generates a 1200 × 630 PNG from published wedding
data. The renderer, rather than a duplicated static export, is authoritative
because the progress fill advances every calendar day.

Locked composition:

- pitch-black canvas: `#000000`;
- white information: `#FFFFFF`;
- Chioma yellow active signal: `#FFD21E`;
- Space Grotesk Medium (`500`) for every visible word and numeral;
- couple first names at the top left, joined by a literal ampersand;
- numeric month and day at bottom left;
- a centered live yellow fill using a 170 × 34 full-progress geometry, with no
  visible inactive track;
- one slim, full-height contour portrait of the actual couple, entering from
  the right edge;
- directional line weight on that portrait: contours facing the progress
  light are thicker and champagne-yellow; receding contours are hairline
  smoke-grey;
- 28 px left safe margin and 18 px bottom clearance for the date;
- no logo, monogram, border, gradient, texture, photographic image, ornament,
  salutation, venue, subtitle or wedding cliché.

The contour portrait is the sole approved representational exception. It is
derived from approved photographs of the actual couple, abstracts identity
into posture rather than facial detail, and must remain subordinate to the
date. A stock wedding silhouette is never an acceptable substitute.

The progress fill represents elapsed calendar days from January 1 of the year
before the wedding through the wedding date, calculated in the wedding's
published timezone. It clamps to zero before the window and to one after the
wedding. Share-image URLs rotate by local calendar day so social caches can
request the current frame.

## Guest-interface grammar

The invitation must preserve the same hierarchy as the first frame:

1. **Identity:** the couple.
2. **Time:** the approaching date and journey progress.
3. **Movement:** one controlled transition or spatial idea at a time.
4. **Action:** a single obvious next step when action is required.

Guest-facing UI uses only black, white, yellow and neutral opacity steps.
Yellow is reserved for active progress, direct interaction, focus, committed
state, and physically justified light emitted by the progress threshold. On
the contour portrait it appears only on surfaces facing that source; it is
never a uniform outline or general decoration. Yellow never carries meaning
without shape, position or text. No additional UI hue is introduced without
explicit user approval.

Space Grotesk is the sole guest-interface family. Hierarchy comes from scale,
position, spacing, weight and motion—not from switching to a ceremonial serif
or script. Essential text remains semantic DOM content even when the spatial
canvas supplies the atmosphere.

The spatial world may reveal truthful material colour in a photographed or 3D
wedding object. Those colours belong to the object, not to the interface token
system. They must emerge from the black field, preserve strong negative space
and recede whenever text or a decision appears.

## Motion translation

The static progress bar becomes the experience's motion language:

- loading progress, directed travel and chapter position share its geometry;
- input response is immediate and yellow marks the acknowledged change;
- the explicit `Play` action starts a timed director path through the world;
- `Pause`, wheel, touch, keyboard or a form interaction immediately returns
  control to the guest; `Play` resumes from that world position;
- movement is continuous, reversible and interruptible;
- only one hero movement is active at a time;
- each movement settles into a clean resting composition;
- opacity and transform are preferred over moving blur, mist or stacked glass;
- reduced motion retains the same hierarchy and state without spatial travel.

The opening begins from the exact black-card composition. It does not cut to a
separate decorative invitation. Its locked sequence is:

1. hold the couple names and an initial `00 00` date on pitch black;
2. count the month from `01` through `09`;
3. count the day from `01` through `15`;
4. grow the yellow threshold to the wedding's live calendar progress;
5. reveal the couple contour in the same left-to-right direction as the light;
6. let the progress slit resolve into the sole round `Play` action only after
   the frame settles.

No header, monogram, RSVP action or other application chrome is visible before
the threshold plays. Reduced motion skips the count and reveal, presenting the
same finished date, progress, portrait and action immediately; its journey is
manual and contains no automated camera travel. The social share
image remains a static daily snapshot because animation support is not reliable
across link-preview consumers; the guest page supplies the live sequence.

The post-Play welcome transforms the opening rather than replacing it: the
portrait recedes, the numeric date remains as atmosphere, the yellow threshold
completes and moves to the invitation copy, and the couple names retain their
top-left anchor. The first new statement is the literal invitation. No second
primary action is added. A quiet fixed control becomes `Pause` during directed
travel and `Play` while paused. Manual scroll is always a first-class
continuation and never fights the director.

The Play gesture may begin one licensed atmospheric recording with the journey.
Audio never starts before that gesture, pauses with the director and stops at
the final chapter. The current yardstick track is *Gymnopédie No. 1*, performed
by Kevin MacLeod under CC BY 3.0. Its visible credit and retained license record
are mandatory; see `MUSIC-LICENSES.md`. Music is omitted when playback is
blocked or reduced motion is requested without weakening the experience.

The guest journey is intentionally limited to six resting chapters: welcome,
two truthful story beats, celebration details, dress guidance and RSVP. Wedding
party grids, vendor showcases and decorative stationery are omitted from the
primary path because they dilute the invitation hierarchy. Calendar, directions,
sharing and response controls appear only where their actions become relevant.

After welcome, the threshold becomes the sole journey-progress signal. The
inactive grey track remains invisible. Chapter identity uses only the couple
name and the current chapter label; the monogram and permanent RSVP shortcut do
not return as application chrome.

The WebGL layer is atmospheric, never a second interface. All chapters occupy
one continuous world arranged along a curved camera spline rather than a stack
of isolated scenes. The route bends laterally, vertically and into depth; its
look-ahead and restrained banking make scroll feel like locomotion. Each
chapter may own one primary spatial subject: a story garden, the distant
celebration circle, a pavilion threshold, suspended fabric or the final RSVP
table. Subjects use independently composed desktop and mobile 2.5D plates with
depth-aware parallax; simple real-time geometry is reserved for genuine
foreground occlusion or a physical threshold, never as a substitute for
material craft.

Neighbouring subjects overlap at the edges of their ranges so the next place
can be seen before the current one disappears. Foreground objects may pass the
viewer while the next middle-ground or distant object approaches, but only one
subject may carry primary visual weight at any instant. Semantic typography
rests at readable points along the journey and remains governed by the same
spatial beat without being rendered into WebGL. The required proof passage is:
**She said yes → curve through darkness → pavilion appears in the distance →
approach and pass its threshold → fabric emerges beyond it.**

The pavilion plate is a composed destination, not a surface to skew around the
camera. Its plane remains perpendicular to the approach and uses only internal
depth parallax. The camera curves before and after the pavilion, straightens
for the approach, and suppresses banking and pointer drift while the plate is
hero. The plate fades before the near crossing; restrained foreground jamb,
overhead and floor geometry carry the physical threshold, with fabric already
visible beyond it.

The world must preserve black negative space and use yellow only as physically
justified directional light. It renders only while scroll or pointer state is
settling and is omitted entirely for reduced motion or unavailable WebGL. A
static DOM journey remains the complete experience.

Historical concept plates may supply architecture, fabric and foliage, but a
shared material shader remaps them into pitch black, pure white and exact
`#FFD21E`. Original plum, lilac or antique-gold colour does not return as UI or
ambient wash. Bright paper remains white; yellow is confined to progress,
acknowledged state and selective light. Plates feather into black and recede or
move aside anywhere semantic copy or a decision control occupies the frame.

The locked reference implementation and fallback point for this technique is
documented in `PAVILION-2_5D-CHECKPOINT.md`.

## Reduction rules

Nothing enters the guest experience unless removing it makes the concept
weaker. In particular, do not add:

- decorative borders, hairlines or outer card frames;
- cloudy glass, global haze, grain or mist;
- ornamental gradients or metallic UI effects;
- warm-ivory stationery as a persistent interface surface;
- plum as application chrome;
- a visible monogram merely to fill space;
- simultaneous envelope, curtain, camera and copy animations;
- panels around content that spacing and typography can organize;
- a second accent colour.

Wedding artifacts are narrative content, not permission to decorate the UI.

## Implementation and review gate

Before expanding a new part of the experience, render its resting frame at
desktop and mobile sizes and compare it with the approved first-frame grammar.
The reviewer must be able to answer yes to all of the following:

- Does black remain the dominant field?
- Is the information understandable within three seconds?
- Is Space Grotesk carrying the complete guest-facing hierarchy?
- Is yellow communicating progress, interaction, state or directional light
  from the progress threshold?
- Is there only one expressive movement or visual subject?
- Can any visible element be removed without reducing meaning?
- Does text remain readable throughout the full transition?
- Does reduced motion preserve the same information and action?

A failed answer stops expansion. Fix the current frame before adding another
scene, asset or effect.

## Supersession

This document supersedes earlier guest-facing visual direction wherever it
conflicts, including:

- the ivory, plum, champagne and lilac UI palette;
- the serif/script guest-interface typography split;
- the ornamental stationery share card;
- the visible monogram on share cards, headers, footers or opening chrome;
- the old envelope-first opening choreography;
- decorative hairlines, glass cards, haze and framed copy surfaces.

Privacy, accessibility, truthful content, immediate guest-input ownership,
responsive composition and reduced-motion requirements remain in force. Earlier research,
storyboards and concept assets are retained as historical evidence and possible
narrative-source material; they are not implementation authority for the new UI.
