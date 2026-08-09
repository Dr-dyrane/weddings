# Pavilion 2.5D checkpoint

**Status:** Locked fallback checkpoint

**Route:** `/the_ogranyas?checkpoint=pavilion-production`

**Git tag:** `pavilion-2-5d-checkpoint`

## Why this checkpoint exists

This is the first celebration treatment that replaced debug-like geometry with
material, scale and spatial travel while preserving the approved opening and
the rest of the invitation. Keep it as the safe fallback while the continuous
curved-world system is explored. If that larger experiment weakens the
experience, return here and apply this same restrained 2.5D treatment to the
remaining chapters.

## What is locked here

- The faint pavilion wireframe is replaced by an authored architectural scene
  with a depth-aware parallax shader.
- Desktop and mobile use independently composed plates, not responsive crops:
  - `/public/journey/pavilion-depth-desktop.webp`
  - `/public/journey/pavilion-depth-mobile.webp`
- The redundant giant decorative `15` is removed.
- The approved opening and every other chapter remain unchanged.
- The North Star permits one restrained 2.5D, depth-aware or simple 3D subject
  per chapter when material, scale and occlusion are essential.
- Both pavilion assets together are approximately 134 KB.

## Image-generation contract

The plates were authored as a pitch-black abstract architectural threshold
pavilion with:

- clean negative space reserved for typography;
- exact-yellow directional light entering from the left;
- separated foreground, middle-ground and background planes;
- independently composed desktop and mobile framing;
- no people, signage, logos, florals, haze, purple or stock wedding motifs.

## Product judgment

This checkpoint proves that 2D imagery can contribute convincing spatial depth
when it is authored for perspective, decomposed by depth in the shader and
moved with restrained camera-relative parallax. The pavilion feels like a place
the guest approaches rather than a line drawing behind a webpage.

It is not the final Lusion-level world system. The remaining chapters still
need equivalent material authorship, and the journey still needs a continuous
curved camera path with persistent foreground, middle-ground and background
layers. This checkpoint remains valid even if that broader system is rejected.

## Verification at lock

- ESLint passed.
- TypeScript passed.
- All 24 tests passed.
- Production build passed.
- Desktop and mobile visual review passed.
- Clean production-origin console review passed.
- The earlier hydration mismatch was confirmed as stale localhost browser
  state and did not reproduce on the clean production origin.

## Recovery

Inspect or branch from the checkpoint with:

```sh
git show pavilion-2-5d-checkpoint
git switch -c codex/restore-pavilion pavilion-2-5d-checkpoint
```

Do not move or reuse the tag for later experiments.
