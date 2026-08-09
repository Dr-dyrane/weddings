# Alexander and Chioma line portrait v4

Status: **approved** for OGB edition 3.

Generated: 2026-08-09 with the built-in Codex `image_gen` workflow. The
provider-managed model identifier was not exposed and is not guessed.

Final asset:
[`alexander-chioma-line-portrait-v4.png`](alexander-chioma-line-portrait-v4.png)

SHA-256:
`117c25e7e5ba626417ee32176947f146341e1b3b24f52f2db5ead3da484ed666`

The edit target was the approved v3 directional-light study. It preserves the
same full-height, slim composition and variable line weight while correcting
the palette for full-opacity rendering.

## Final edit prompt

> Preserve the exact canvas, couple pose, anatomy, slim proportions, line
> paths, line-weight variation, crop, right-edge placement and negative space.
> Change only the stroke palette. The strongest left-facing illuminated
> strokes use the same warm golden-yellow appearance as `#FFD21E`, without
> lemon, green or neon cast. Transitional strokes taper through muted
> champagne. Receding right-facing strokes are intrinsically dim smoke-grey so
> the artwork can render at 100% opacity. No glow, haze, gradient, new line,
> removed line, facial detail, clothing detail, text, logo or object. Retain a
> uniform chroma-key background.

## Post-processing and integration

The chroma-key background was removed locally with the imagegen skill's
`remove_chroma_key.py` helper using a soft matte and despill. The final asset is
1024 × 1536 RGBA. The server-side renderer embeds it directly rather than
exposing the identity asset from `public/`.

Edition 3 renders the image at 460 × 690, positioned 15 px beyond the right
edge and 30 px above the canvas at 100% opacity. The illuminated contour and
progress fill now read as one light system; receding strokes carry their own
lower luminance instead of relying on global opacity.
