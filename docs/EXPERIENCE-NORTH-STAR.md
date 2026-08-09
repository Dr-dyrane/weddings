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

- loading progress, scroll progress and chapter position share its geometry;
- input response is immediate and yellow marks the acknowledged change;
- native scroll remains the journey clock;
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
6. turn that threshold into the sole `Open` action only after the frame settles.

No header, monogram, RSVP action or other application chrome is visible before
the threshold opens. Reduced motion skips the count and reveal, presenting the
same finished date, progress, portrait and action immediately. The social share
image remains a static daily snapshot because animation support is not reliable
across link-preview consumers; the guest page supplies the live sequence.

The first post-click welcome frame is a separate mobile-first approval boundary.
It must transform or reuse the opening elements before it introduces any new
one, and it must pass the implementation gate below before spatial scenes expand.

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

Privacy, accessibility, truthful content, native-scroll ownership, responsive
composition and reduced-motion requirements remain in force. Earlier research,
storyboards and concept assets are retained as historical evidence and possible
narrative-source material; they are not implementation authority for the new UI.
