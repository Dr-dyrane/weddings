# Alexander and Chioma line portrait v5

Status: **approved** for OGB edition 3.

Source: the built-in Codex `image_gen` v4 palette edit, followed by a
deterministic exact-token normalization on 2026-08-09.

Final asset:
[`alexander-chioma-line-portrait-v5.png`](alexander-chioma-line-portrait-v5.png)

SHA-256:
`7654e377bdabcd101fd1382174b6ef824f31e7dbf2ada3217360632ae85e3852`

V5 preserves every v4 line path, weight, alpha value, crop and receding colour.
Only fully illuminated saturated core pixels were normalized to RGB
`255, 210, 30` (`#FFD21E`). Antialiased edge pixels and champagne transitions
remain varied so the contour retains depth instead of becoming a flat uniform
outline.

Edition 3 renders the asset at 460 × 690, positioned 15 px beyond the right
edge and 30 px above the canvas at 100% opacity. The bar and strongest contour
therefore share one literal source colour before normal raster scaling and
antialiasing.
