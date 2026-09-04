## Scaling Strategy: Figma → Implementation

**Version:** 3.2
**Last updated:** 2026-09-04
**Status:** Reusable standard for any Figma file built on a fixed source frame width

---

### Context

This rule applies to any project where the Figma canvas is designed at a fixed
frame width, and the primary implementation target is a different (usually
smaller) fixed width, with support for larger 2K desktop viewports.

```
SOURCE_FRAME = 1920   // Figma frame width (px) (1.0x baseline)
TARGET_FRAME = 1440   // Primary laptop implementation width (px) (0.75x floor)
MAX_FRAME    = 2560   // 2K desktop ceiling (px) (1.3333x ceiling)
SCALE_RATIO  = TARGET_FRAME / SOURCE_FRAME   // = 0.75
RATIO_2K     = MAX_FRAME / SOURCE_FRAME      // = 1.3333

Rounding convention = nearest 0.5px before rem conversion
FONT_FLOOR_PX   = 15   // change only when project design system defines another minimum
```

> **Project decision (2026-09-04, v3.2): this project uses EXTENDED FLUID mode (1440px–2560px)**.
> All tokens in `output/assets/css/tokens.css` are expressed as:
> `clamp(scaled_min_1440, fluid_vw, max_2k_2560)`.
> This ensures exact 1:1 match with Figma at 1920px, 0.75-scaled at 1440px,
> fully proportional scaling up to 2K (2560px) with no awkward lateral empty
> space, and clean centered capping above 2560px to protect ultrawide displays.

Change `SOURCE_FRAME` / `TARGET_FRAME` per project — every formula below
derives from `SCALE_RATIO`, so the rest of this document does not need to
change.

---

### Rule for AI Agent / Developer

Mandatory for Figma-to-code unless the PRD or direct user instruction explicitly overrides it. Record any override and its reason.

Every time you read a pixel value from Figma inspect/dev-mode — padding,
margin, gap, font-size, line-height (if expressed in px), letter-spacing (if
expressed in px), width, height, border-radius, icon size — do NOT use that
number as-is. Convert it first:

```
implementation_px  = figma_px * SCALE_RATIO
implementation_rem = (figma_px * SCALE_RATIO) / 16
```

**Rounding rule:** round `implementation_px` to the nearest **0.5px**
before converting to rem. This keeps values consistent across the team and
avoids arbitrary-looking decimals (e.g. 11.257px). If the design system
requires whole pixels only, round to the nearest integer instead — pick one
convention per project and state it here.

Examples (SCALE_RATIO = 0.75):

| Figma (1920px) | Implementation (1440px) | rem (base 16px) |
|---|---|---|
| 60px | 45px | 2.8125rem |
| 148px | 111px | 6.9375rem |
| 40px | 30px | 1.875rem |
| 20px | 15px | 0.9375rem |
| 16px | 12px | 0.75rem |
| 15px | 11.5px (rounded) | 0.71875rem |

---

### Token mapping reference

Precompute the common spacing scale once per project so nobody recalculates
by hand. Fill this table in at project kickoff:

| Figma spacing (px) | Scaled (px) | rem |
|---|---|---|
| 4 | 3 | 0.1875rem |
| 8 | 6 | 0.375rem |
| 12 | 9 | 0.5625rem |
| 16 | 12 | 0.75rem |
| 20 | 15 | 0.9375rem |
| 24 | 18 | 1.125rem |
| 32 | 24 | 1.5rem |
| 40 | 30 | 1.875rem |
| 48 | 36 | 2.25rem |
| 60 | 45 | 2.8125rem |
| 80 | 60 | 3.75rem |
| 120 | 90 | 5.625rem |

---

### What gets scaled

- Padding, margin, gap
- Font-size
- Line-height, **when expressed as a fixed px value in Figma** (not needed
  if the design uses a unitless multiplier like `1.4` — unitless line-height
  scales automatically with font-size and should be left alone)
- Letter-spacing, when expressed as a fixed px value
- Width, height (for fixed, non-fluid elements)
- Border-radius (see pill/full exception below)
- Icon size, and the icon's SVG `viewBox` if it's exported at 1:1 with the
  Figma frame (or re-export icons at the target size instead of scaling
  viewBox — pick one approach and be consistent)

### Exceptions (do NOT scale)

- **Border-width** — keep 1px for hairlines regardless of frame width
- **Box-shadow blur/spread** — unless the design spec states otherwise
- **"Pill" / full border-radius** (999px, 9999px, or `50%`) — these are
  symbolic "infinity" values, not real dimensions; scaling them is a no-op
  risk and unnecessary
- Raster images and illustrations — resize/export these directly at the
  target resolution rather than applying the ratio to their display
  dimensions
- Any value explicitly marked as fixed/absolute in the design spec — **the
  design spec must maintain an explicit list of these (by layer name or
  token name)**; do not rely on ad-hoc judgment calls during implementation

---

### Root font-size and accessibility

- Use `rem`, not `px`, in all theme tokens so scaling cascades from the root.
- Keep the root font-size at the browser default (`100%`) unless the project explicitly defines another accessible percentage. Do not use `75%` with rem values calculated from a 16px base: that applies the scale ratio twice.
  ```css
  html { font-size: 100%; } /* or omit declaration */
  ```
  A percentage respects the user's browser default font-size / zoom settings. Never hardcode a px root value. Fixed mode therefore uses `html { font-size: 100%; }` and rem values calculated from the 16px base; fluid mode uses the same root and `clamp()`.

### Font-size floor (minimum readable size)

Spacing and layout can shrink freely with `SCALE_RATIO` — nobody strains to
read a smaller gap. Text is different: below a certain size it stops being
comfortably readable regardless of what the ratio says. Apply a floor on
top of the normal scaling formula, for **font-size only** (not spacing,
not icon size):

```
implementation_px = max(figma_px * SCALE_RATIO, FONT_FLOOR_PX)
```

- **`FONT_FLOOR_PX` default: 15px.** Adjust per project if the design
  system defines its own minimum (state it here once decided).
- The floor applies **per text style**, not globally — a caption/label
  style that's already small in Figma (e.g. 14px) is more likely to hit
  the floor than a body style (e.g. 20px). Check every text style against
  the floor individually; don't assume only the smallest one needs it.
- If a text style's *scaled* value would fall under the floor, use the
  floor value and **flag it** (comment in code or note in the design
  spec) rather than silently overriding — this signals a decision the
  designer/PM should confirm, not something to fix quietly in code.
- If the scaled value is **below the floor**, just use the floor as a
  fixed value — `clamp()` isn't needed for a single breakpoint, since
  `max(scaled, floor)` already resolves to a constant:
  ```css
  /* Figma 20px, SCALE_RATIO 0.75 → scaled 15px, floor 15px → right at floor */
  font-size: 0.9375rem;

  /* Figma 16px, SCALE_RATIO 0.75 → scaled 12px, floor 15px wins */
  font-size: 0.9375rem; /* floor applied, not the scaled 12px */
  ```
  `clamp()` becomes useful when this value also needs to flex *between*
  breakpoints (see Breakpoint behavior below) — e.g.
  `font-size: clamp(0.9375rem, 4vw, 1.25rem)` for a fluid mobile range —
  but that's a separate concern from the floor itself.
- This floor is a **safety net for aggressive ratios**, not a license to
  skip scaling. Always compute the scaled value first — only apply the
  floor when the computed value would go below it.

---

### Breakpoint behavior

- **Below TARGET_FRAME** (e.g. tablet/mobile, <1440px): use fluid `clamp()`
  or dedicated stack breakpoints. Do NOT keep applying `SCALE_RATIO` below
  this point — those breakpoints follow their own spacing/typography rules.
- **Between TARGET_FRAME and MAX_FRAME** (1440px–2560px): see "Extended Fluid
  mode" below — this range interpolates linearly so 1440px renders the scaled
  value, 1920px renders exactly like Figma, and 2560px fills 2K desktop screens
  proportionally without dead space.
- **Above MAX_FRAME** (e.g. ultra-wide monitors, >2560px): cap the layout
  at `--layout-max: 160rem` (2560px) and center it with margin-inline: auto.
  Do not extrapolate beyond 2560px — ultrawide monitors have extreme width-to-height
  ratios (21:9) where uncapped vw scaling causes oversized text and excessive vertical scrolling.

### Fluid mode: proportional scaling between TARGET_FRAME and MAX_FRAME (2K)

**Use this when:** the project needs the screen to look proportionally scaled at
`TARGET_FRAME` (1440px), exact to Figma at `SOURCE_FRAME` (1920px), and
proportionally scaled up at `MAX_FRAME` (2560px) — eliminating dead space on 2K monitors.

The line connecting `(1440, scaled_px)`, `(1920, figma_px)`, and `(2560, max_2k_px)`
passes through the origin:

```
fluid_vw   = figma_px / (SOURCE_FRAME / 100) = figma_px / 19.2
MAX_2K_rem = (figma_px * 1.3333) / 16 = figma_px / 12
```

Combine with the floor (as min) and the 2K value (as max) in a single `clamp()`:

```css
font-size: clamp(FLOOR_rem, fluid_vw, MAX_2K_rem);
```

**Example — body text, figma_px = 20, SOURCE_FRAME = 1920, MAX_FRAME = 2560:**

```
fluid_vw   = 20 / 19.2 = 1.0417vw
MAX_2K_rem = (20 * 1.3333) / 16 = 1.6667rem (26.67px)
```

```css
font-size: clamp(0.9375rem, 1.0417vw, 1.6667rem);
/*                 ^15px floor   ^fluid    ^26.7px at 2560 (20px at 1920) */
```

- At 1440px width → renders 15px (0.75x).
- At 1920px width → renders 20px (exact Figma match).
- At 2560px width → renders 26.67px (exact 1.3333x 2K match).
- Above 2560px → `clamp()` locks to max, and `--layout-max: 160rem` centers the container.

**Important — pick one strategy per project, don't mix:**
- **Fixed mode:** keep root `html { font-size: 100%; }` (or omit the declaration), use plain `rem` values computed from `figma_px * SCALE_RATIO` with a 16px base. Simple, but only exactly matches Figma at `TARGET_FRAME`, not at `SOURCE_FRAME`. Never apply `75%` root sizing together with these rem values.
- **Fluid mode** (this section): keep root font-size at the standard `100%`
  (do NOT also apply the 75% trick, or the scaling gets applied twice) and
  express scaled properties with `clamp(min_rem, fluid_vw, max_rem)`
  instead. Matches Figma exactly at both `TARGET_FRAME` and `SOURCE_FRAME`,
  proportional everywhere between.

Fluid mode is more setup work per token, so it's usually worth reserving
for font-size and other visually prominent values (hero spacing, large
icons) rather than every single spacing token in the file.

### When this rule does NOT apply

- Values already explicitly specified elsewhere in the spec — those are
  final, do not re-scale.
- Other breakpoints (mobile/tablet) — those follow their own rules per the
  breakpoint section above.

---

### Verification checklist (before PR / handoff)

- [ ] All px values pulled from Figma are converted to rem using
      `SCALE_RATIO`
- [ ] Root font-size, if declared, uses `%` (never a hardcoded px value, never `75%` with 16px-base rem math)
- [ ] Line-height and letter-spacing are converted where they're fixed-px
      in Figma
- [ ] Border-width, box-shadow, and pill/full border-radius are left
      unscaled per the exceptions list
- [ ] Breakpoints below `TARGET_FRAME` use `clamp()` / their own rules, not
      manual `SCALE_RATIO` math
- [ ] Layout above `SOURCE_FRAME` is capped, not extrapolated
- [ ] Icon/asset export strategy (re-export vs. viewBox scaling) is
      consistent across the file
- [ ] Every text style checked against `FONT_FLOOR_PX`; any style hitting
      the floor is flagged, not silently overridden
- [ ] If Fluid mode is used: root font-size left at `100%` (not also set
      to `75%`), and font-size/spacing tokens use `clamp(min, fluid_vw,
      max)` rather than plain `rem`

---

### Changelog

- **3.2** (2026-09-04) — Added 2K Desktop Scaling (`MAX_FRAME = 2560`, ratio 1.3333x): extended `clamp()` ceiling from 1920px to 2560px and increased `--layout-max` to 160rem (2560px), eliminating empty space on 2K displays while keeping layouts securely capped on ultrawide (>2560px) monitors.
- **3.1** (2026-08-28) — Added Fluid mode: `clamp()` + `vw` formula to
  interpolate proportionally between `TARGET_FRAME` and `SOURCE_FRAME`, so
  the design matches Figma exactly at 1920px and stays proportional at
  every width down to 1440px, not just at two fixed breakpoints.
- **3.0** (2026-08-28) — Added font-size floor (`FONT_FLOOR_PX`) as a
  safety net for aggressive scale ratios, applied per text style with
  `clamp()` guidance and a flag-don't-silently-override rule.
- **2.0** (2026-08-11) — Added token mapping table, rounding rule,
  line-height/letter-spacing handling, pill-radius exception,
  asset/viewBox guidance, above-source-frame breakpoint behavior,
  accessibility-safe root font-size, and verification checklist.
- **1.0** — Initial version (1920 → 1440, ratio 0.75, basic exceptions).
