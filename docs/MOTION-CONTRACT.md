# Motion Contract

Motion is permitted only to explain topology, causality, state, focus, or continuity. Every motion specification names one of those purposes.

## Ownership

- Native document scroll owns position and history.
- Motion owns DOM press, disclosure, layout continuity, and chapter transitions.
- React Three Fiber owns camera, material, lighting, and spatial object animation.
- A DOM element is never animated by two systems.
- No smooth-scroll replacement or scroll-jacking library is permitted.

## Timing tokens

| Token | Duration | Use |
| --- | ---: | --- |
| `instant` | 80 ms | Press and selection acknowledgement |
| `quick` | 160 ms | Local state changes and compact disclosure |
| `standard` | 280 ms | Panels, fields, and content continuity |
| `chapter` | 600 ms | One editorial transition after direct intent |

Default easing is `cubic-bezier(.22, 1, .36, 1)`. Ambient loops cannot contain essential information and stop when the document is hidden or reduced motion is requested.

## Spatial rules

- Scroll progress is read through a ref or MotionValue; React state is not updated per frame.
- Static scenes use demand rendering. No idle continuous render loop is allowed.
- Reverse scrolling produces a coherent reverse state.
- Canvas loss, missing WebGL, low power, and reduced motion reveal the same information through static art and semantic DOM.
- Initial mobile guardrails: at most 2.5 MB transferred for the optional experience, 150 draw calls, 250k visible triangles, and DPR capped near 1.5 until device evidence approves a change.
