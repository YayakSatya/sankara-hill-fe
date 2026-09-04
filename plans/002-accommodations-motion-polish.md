# 002 — Polish accommodations scroll-driven motion

- **Status**: DONE
- **Commit**: 2cd2d19
- **Severity**: HIGH
- **Category**: Easing, Physicality, Performance, Accessibility
- **Estimated scope**: 2 files (`output/assets/js/home.js`, `output/assets/css/pages/home.css`)

## Problem

The accommodations scroll-driven pinned sequence introduced in the recent refactor works, but has five motion and performance defects:

1. **Typography double-exposure (`home.js:140-165`)**:
   Outgoing title/content and incoming title/content fade simultaneously across the entire transition interval ($t \in [0, 1]$). At midpoint ($t = 0.5$), both titles overlap at 50% opacity in the exact same coordinates, producing an illegible double-exposure.
2. **Linear clip-path progression**:
   `clip-path: inset()` is scrubbed linearly ($t$). Linear motion lacks physical deceleration, causing hard starts and stops at dwell boundaries.
3. **Redundant DOM writes in rAF loop (`home.js:132, 153`)**:
   `zIndex = '1'` and `zIndex = '2'` are written to element style on every scroll frame inside `showTransition`.
4. **Layout measurement on hidden slides (`home.js:270`)**:
   Parallax engine calls `getBoundingClientRect()` on all 6 villa images every rAF frame, even when 4 images are on hidden slides (`visibility: hidden`).
5. **Missing dynamic reduced-motion listener (`home.js:237`)**:
   Villa slider module does not listen to `reduced.addEventListener('change')`, so mid-session OS accessibility toggles are ignored until user scrolls.

## Target

1. **Decoupled typography crossfade**:
   - Outgoing text clears during $t \in [0.0, 0.35]$ ($1 \to 0$ opacity, $-14\text{px}$ slide).
   - Clear gap during $t \in [0.35, 0.65]$ (both texts 0% opacity; eye focuses on photo clip-path wipe).
   - Incoming text enters during $t \in [0.65, 1.0]$ ($0 \to 1$ opacity, $+14\text{px} \to 0\text{px}$ slide).
2. **Smoothstep cushioned clip-path**:
   - Apply smoothstep $t_\text{eased} = t^2 (3 - 2t)$ so wipe eases out from start and eases in to settled edge.
3. **Guarded style writes**:
   - Write `zIndex` only on state change, not per scroll tick.
4. **Pruned parallax loop**:
   - Skip `getBoundingClientRect()` when slide parent has `aria-hidden="true"`.
5. **Dynamic a11y support**:
   - Add `reduced.addEventListener('change', schedule)`.
   - Add gentle `opacity 200ms ease-out` transition for `prefers-reduced-motion: reduce`.

## Repo conventions to follow

- Easing and scroll scheduling match `home.js` rAF throttled architecture.
- Mobile layout remains untouched (`!desktop.matches` reset path preserved).

## Steps

1. **Update `home.js` villa slider**:
   - Add smoothstep calculation for `topInset`.
   - Decouple typography opacity and `translateY` into exit, gap, and entry phases.
   - Guard `zIndex` writes.
   - Add `reduced.addEventListener('change', schedule)`.
2. **Update `home.js` parallax engine**:
   - Guard against measuring elements inside `[data-villa-slide][aria-hidden="true"]`.
3. **Update `home.css`**:
   - Add `@media (prefers-reduced-motion: reduce)` opacity transition rule for `.p-villa-slide`.

## Boundaries

- Do NOT touch HTML markup or layout proportions (Figma specs 100% preserved).
- Do NOT add external animation libraries.

## Verification

- **Mechanical**: `node --check output/assets/js/home.js` exits with code 0.
- **Feel check**:
  - Scroll through accommodations: at mid-transition ($t = 0.5$), verify the photo wipe is clear and no overlapping text is visible.
  - Verify smooth deceleration at transition boundaries.
  - Verify Parallax functions on the active slide.
