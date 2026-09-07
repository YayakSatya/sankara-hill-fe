# 006 — Add hover micro-interaction to villa explore link

- **Status**: DONE
- **Commit**: 9bace6a
- **Severity**: LOW
- **Category**: Feedback / Easing & duration
- **Estimated scope**: 1 file (`output/assets/css/pages/home.css`), ~20 lines

## Problem

In the accommodations section, each villa slide features an "Explore Villa" call-to-action link (`.p-villa-slide__link`). Currently, it has a static underline and zero hover feedback:

```css
/* output/assets/css/pages/home.css:182-196 — current */
/* Figma 4052:406 — Switzer Regular 18/28, underlined per design. */
.p-villa-slide__link {
  font-family: var(--font-body);
  font-size: var(--text-sm-size);
  line-height: var(--text-sm-lh);
  color: var(--color-text-inverse);
  text-decoration: underline;
  text-underline-offset: 0.2em;
  text-transform: uppercase;
}

.p-villa-slide__link:focus-visible {
  outline: var(--border-hairline) solid currentColor;
  outline-offset: 0.25em;
}
```

Because the villa detail panel is dark teal (`--color-surface-dark`) and the text is white, having no hover feedback makes this primary villa discovery trigger feel dead and unclickable.

## Target

Provide clear clickability affordance at rest while keeping the directional navbar hairline interaction:
1. Base underline via `::before` hairline (`var(--border-hairline)`) at `opacity: 0.45`, visible at rest so visitors immediately know it is a link.
2. Active sweep via `::after` hairline: idle at `transform: scaleX(0); transform-origin: right;`.
3. Hover/focus: `transform: scaleX(1); transform-origin: left;` over `220ms var(--ease-out)`, illuminating to full solid white.
4. Gate to `@media (hover: hover) and (pointer: fine)`.

```css
/* output/assets/css/pages/home.css — target */
.p-villa-slide__link {
  position: relative;
  display: inline-block;
  font-family: var(--font-body);
  font-size: var(--text-sm-size);
  line-height: var(--text-sm-lh);
  color: var(--color-text-inverse);
  text-decoration: none;
  text-transform: uppercase;
}

/* Base underline: always visible at rest so link affordance is clear */
.p-villa-slide__link::before {
  content: "";
  position: absolute;
  left: 0;
  right: 0;
  bottom: clamp(-0.3333rem, -0.2083vw, -0.1875rem);
  height: var(--border-hairline);
  background-color: currentColor;
  opacity: 0.45;
}

/* Active sweep: full-contrast hairline draws left-to-right matching navbar */
.p-villa-slide__link::after {
  content: "";
  position: absolute;
  left: 0;
  right: 0;
  bottom: clamp(-0.3333rem, -0.2083vw, -0.1875rem);
  height: var(--border-hairline);
  background-color: currentColor;
  transform: scaleX(0);
  transform-origin: right;
  transition: transform 220ms var(--ease-out);
}

@media (hover: hover) and (pointer: fine) {
  .p-villa-slide__link:hover::after,
  .p-villa-slide__link:focus-visible::after {
    transform: scaleX(1);
    transform-origin: left;
  }
}

.p-villa-slide__link:focus-visible {
  outline: var(--border-hairline) solid currentColor;
  outline-offset: 0.25em;
}

@media (prefers-reduced-motion: reduce) {
  .p-villa-slide__link::after {
    transition: none;
  }
}
```

## Repo conventions to follow

- Duration stays inside the feedback budget (< 200ms).
- Curve follows `var(--ease-out)` from `tokens.css`.
- Underline thickness locks to `var(--border-hairline)` to avoid clunky browser default thicknesses.

## Steps

1. In `output/assets/css/pages/home.css`, locate `.p-villa-slide__link` (lines 183–191).
2. Add `text-decoration-thickness: var(--border-hairline);`.
3. Add `transition: text-underline-offset 180ms var(--ease-out), opacity var(--transition-base);`.
4. Add `@media (hover: hover) and (pointer: fine)` block setting `.p-villa-slide__link:hover` to `text-underline-offset: 0.38em; opacity: 0.85;`.
5. Add `@media (prefers-reduced-motion: reduce)` block to drop `text-underline-offset` transition.

## Boundaries

- Do NOT touch villa pin or slide transitions in `home.js`.
- Do NOT alter villa title, meta badges, or descriptions.
- Do NOT change link markup or `href`.

## Verification

- **Mechanical**: Inspect `.p-villa-slide__link` in DevTools; verify `text-underline-offset` property transitions.
- **Feel check**:
  - Hover over "Explore Villa" across all three villa slides: underline descends slightly and smoothly, providing clean visual confirmation.
  - Move cursor away: underline eases back to base position without snapping.
- **Done when**: The villa CTA feels responsive, refined, and distinctly clickable.
