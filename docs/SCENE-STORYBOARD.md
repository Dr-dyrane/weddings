# Yardstick Scene Storyboard

Status: **historical; superseded for implementation by `EXPERIENCE-NORTH-STAR.md`**

Do not continue this sequence as written. Its verified content and accessibility
requirements may inform a new storyboard, but its stationery, palette,
architecture and opening choreography are no longer approved UI direction.

The storyboard uses chapter-local progress derived from semantic sections. Percentages describe each chapter, not the entire document.

## Scene 0 — The card before the click

**Job:** make the shared preview feel like a formal object issued to a specific guest.

- 1200×630 pitch-black composition with white Space Grotesk and one Chioma-yellow
  live progress signal.
- Couple first names sit top left; numeric month/day and year anchor the bottom.
- Public and personalized links use the same privacy-safe first frame; guest
  identity does not enter social preview imagery.
- No logo, monogram, venue, salutation, ornament or environmental photography.

## Scene 1 — The waiting envelope

**Job:** create anticipation and establish ceremony.

At rest, a textured envelope floats just above a pearl stone table in darkness. The distant pavilion exists only as a soft reflection. The recipient line is readable before any animation.

**Open action:** focus transfers to the story. The seal releases, the flap lifts and the card rises. The movement lasts no longer than the guest's intent can tolerate and is bypassable immediately.

**Mobile:** envelope fills more of the frame, table edge disappears and the opening uses less depth travel.

**Reduced/static:** an opened envelope composition reveals the card and a direct “Continue to the story” link.

## Scene 2 — Crossing the invitation

**Job:** produce the defining threshold moment.

The rising invitation reveals gathered antique-gold velvet curtains. Their
pleated fabric parts into a warm ceremonial entrance, and only then does the
camera pass through at human height onto the garden path. This is the only
dramatic spatial transition in the experience.

**Copy:** couple names and one-line invitation introduction.

**Rule:** essential copy is already in the destination DOM section; the transition never delays it.

## Scene 3 — The path of us

**Job:** tell the relationship story through place and objects.

A ribbon of light follows the curved garden path. Each real milestone occupies a composed clearing. The camera advances only enough to reveal the next clearing.

- First meeting: approved object or place cue; no stock coffee cup unless factual.
- Commitment: a change in light and material, not a generic heart animation.
- Proposal: approved ring or box reference; the object opens only once and reverses cleanly.

**Mobile:** milestones stack along a shallow S-curve. Text remains above environmental detail.

**Fallback:** editorial stills with the same milestones and sequence.

## Scene 4 — The wedding circle

**Job:** acknowledge family, wedding party and vendors as part of the celebration.

The path opens into a gathering garden. Names and roles occupy luminous place cards, framed portraits or fabric banners around a central table. No wall of avatars and no staff-directory layout.

People and vendor visibility comes only from the published snapshot. Missing portraits use typographic place cards, not generated faces.

**Interaction:** selecting a person may disclose a short approved role note. No required information is hover-only.

## Scene 5 — Pavilion arrival

**Job:** reveal the wedding details at the emotional peak.

The pavilion doors are already open. The camera crosses the floral threshold and stops; the architecture, not the camera, creates grandeur. Date, time, venue, dress guidance, calendar and directions appear on a crisp ivory place card suspended within the room.

Background depth softens while details are read. Blur is static in reduced-motion mode.

**Mobile:** the guest arrives at the doorway rather than travelling deep into the room. Details occupy a stable sheet with the pavilion visible above it.

## Scene 6 — Dress and atmosphere

**Job:** communicate how the celebration should feel and what guests should wear.

Fabric panels, floral colour and table light demonstrate the palette. Named colours remain visible as text. Swatches are material samples rather than disconnected circles.

## Scene 7 — Taking your place

**Job:** make RSVP feel like participation.

The guest reaches a candlelit place setting or illuminated guest book. The RSVP form rises from the architecture as a stable DOM surface. Attendance is asked first; dependent questions disclose progressively.

Feedback sequence:

`rest → press → selected → questions → pending → committed → confirmation`

The current simulation stops before pending and states that replies open later. The real version cannot show confirmation until the database commit succeeds.

## Scene 8 — The celebration remains

**Job:** leave anticipation rather than an application success screen.

After a real response, the view returns to the pavilion at night. One place light joins the room, the couple mark appears quietly and practical actions remain available: edit response, add to calendar, directions and share the public card.

No confetti cannon. No blocking success modal.

## Chapter transition rules

- Each chapter has one hero motion and one resting composition.
- Copy enters after the scene has established enough negative space, never after a long wait.
- Reverse scroll restores earlier light, object and camera states.
- The fixed canvas is decorative and does not intercept pointer input.
- Static art is chosen per chapter, not captured randomly from a running scene.
- Context loss swaps to the chapter's still without changing scroll position.
