# Alexander and Chioma line portrait v3

Status: approved directional-light study; superseded for publication by the
full-strength, palette-aligned v4 asset.

Generated: 2026-08-09 with the built-in Codex `image_gen` workflow. The
provider-managed model identifier was not exposed and is not guessed.

Final asset:
[`alexander-chioma-line-portrait-v3.png`](alexander-chioma-line-portrait-v3.png)

SHA-256:
`8b1333f372ab991b80b99208ef17c9eb29b685f7a2fdd16970baac39b00e76ab`

The edit target was the user-approved v2 slim, full-height line composition.
That composition was derived from the user's approved pose example and
photographs of Alexander and Chioma; the source photographs were not copied
into the repository. The edit preserves the pose and changes only the lighting
logic of the contour system.

## Final edit prompt

> Preserve the exact tall canvas, couple pose, anatomy, slim proportions, crop,
> right-edge placement and negative space of v2. Change only line colour and
> line weight so the drawing reacts physically to a warm yellow light arriving
> horizontally from the left. Left-facing contours become selectively thicker
> and champagne-yellow `#FFD21E`; receding contours remain hairline smoke-grey
> `#6B6B68`, with restrained warm-ivory transitions. Line weight changes
> gradually along a contour. No glow, haze, gradient, faces, clothing detail,
> text, logo or added object. Retain a uniform chroma-key background.

## Post-processing and integration

The chroma-key background was removed locally with the imagegen skill's
`remove_chroma_key.py` helper using a soft matte and despill. The final asset is
1024 × 1536 RGBA. The server-side OGB renderer embeds it directly; the identity
asset is not exposed from `public/`.

The approved placement renders this composition at 460 × 690, positioned 15 px
beyond the right edge and 30 px above the canvas. V4 removes the blanket
opacity reduction so the brightest contour can share the progress signal's
yellow while the receding lines remain intrinsically dim.
