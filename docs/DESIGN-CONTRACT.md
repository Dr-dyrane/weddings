# Design Contract

## Principles

1. **Invitation before spectacle.** Within five seconds a guest can identify the couple, occasion, date, and next action.
2. **Progressive disclosure.** Every view tells one story. Supporting information appears when requested or when its chapter arrives.
3. **Focused hierarchy.** One H1 and one primary action per state. Decorative layers cannot compete with names or decisions.
4. **Agency.** Opening motion is skippable, native scroll remains native, and Back, refresh, reverse scroll, keyboard, and touch preserve context.
5. **Honest feedback.** Controls expose rest, hover, press, pending, success, error, and disabled states where relevant. A failed or unpersisted action never presents success.
6. **Responsive topology.** Mobile is recomposed, not a shrunken desktop canvas.

## Visual rules

- `EXPERIENCE-NORTH-STAR.md` is the guest-facing visual authority. Its approved
  OGB is the first frame of the invitation, not a separate marketing template.
- App chrome has no decorative borders. Hairlines are permitted only when they communicate grouping, input affordance, or state.
- Color, spacing, type, radii, elevation, and motion use semantic tokens.
- Space Grotesk carries all guest-facing display, information and control type.
- Guest-facing UI uses pitch black, white, Chioma yellow and neutral opacity
  steps. Yellow is reserved for progress, interaction, focus and committed state.
- Functional icons come only from the Dyrane icon registry. Wedding motifs belong to narrative art, not control chrome.
- Every chapter has at most one defining expressive moment.
- No visible monogram, additional UI hue, ornamental surface or new font may be
  introduced without explicit approval.

## Interaction gates

- Input feedback begins within 100 ms; a pending state appears by 200 ms.
- Preferred touch targets are at least 44 by 44 CSS pixels.
- No essential action is hover-only, tilt-only, drag-only, audio-only, or animation-only.
- Essential tasks never wait for animation to finish.
- Optional APIs have visible fallbacks: Web Share to clipboard, WebGL to static art, device motion to pointer/touch, and calendar integration to downloadable `.ics`.

## Accessibility gates

- Target WCAG 2.2 AA: 4.5:1 normal text and 3:1 large or bold text.
- The experience reflows at 320 CSS pixels and remains usable at 200% zoom.
- Focus is visible and follows reading order.
- Meaning is never carried by color alone.
- Canvas is decorative; readable content and controls remain in the DOM.
- Reduced motion removes camera travel, parallax, tilt, z-depth transitions, animated blur, and ambient loops. Static composition and brief fades preserve continuity.

Apple's Human Interface Guidelines inform the craft and agency bar but are not a web compliance standard. WCAG and platform web standards remain authoritative.
