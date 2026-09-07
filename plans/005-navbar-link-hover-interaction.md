# 005 — Add directional hairline hover indicator to navbar links

- **Status**: DONE
- **Commit**: 9bace6a
- **Severity**: LOW
- **Category**: Feedback / Physicality & origin
- **Estimated scope**: 1 file (`output/assets/css/components.css`), ~30 lines

## Problem

Desktop navbar links (`.c-navbar__link`) currently show an abrupt color change on hover without transition. Only the active page link (`[aria-current="page"]`) displays a hairline underline, which remains completely static:

```css
/* output/assets/css/components.css:110-134 — current */
.c-navbar__link {
  position: relative;
  font-size: var(--text-sm-size); /* floor-applied */
  font-weight: 300; /* Figma: fontStyle "Light" on this node */
  line-height: var(--leading-body);
  color: var(--color-text);
}

.c-navbar__link:hover,
.c-navbar__link[aria-current="page"] {
  color: var(--color-action);
}

.c-navbar__link[aria-current="page"]::after {
  /* assumption: active-state underline, not present as a variant in the
     scanned frame — standard convention for the current nav item */
  content: "";
  position: absolute;
  left: 0;
  right: 0;
  bottom: clamp(-0.3333rem, -0.2083vw, -0.1875rem); /* -5.3px -> -4px -> -3px */
  height: var(--border-hairline);
  background-color: currentColor;
}
```

In luxury hospitality sites, navigational micro-interactions should communicate fine craftsmanship. Hovering links without an underline draw or smooth transition feels unfinished compared to the rest of the site's typography.

## Target

1. Smooth text color change over `var(--transition-base)`.
2. Introduce an animated hairline `::after` on all `.c-navbar__link` elements that draws left-to-right on mouse enter and withdraws left-to-right on mouse leave via asymmetric `transform-origin` using `var(--ease-out)` (220ms).
3. Keep `[aria-current="page"]` locked at `transform: scaleX(1)`.
4. Gate hover effects strictly to `@media (hover: hover) and (pointer: fine)`.

```css
/* output/assets/css/components.css — target */
.c-navbar__link {
  position: relative;
  font-size: var(--text-sm-size);
  font-weight: 300;
  line-height: var(--leading-body);
  color: var(--color-text);
  transition: color var(--transition-base);
}

.c-navbar__link:hover,
.c-navbar__link:focus-visible,
.c-navbar__link[aria-current="page"] {
  color: var(--color-action);
}

.c-navbar__link::after {
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
  .c-navbar__link:hover::after,
  .c-navbar__link:focus-visible::after {
    transform: scaleX(1);
    transform-origin: left;
  }
}

.c-navbar__link[aria-current="page"]::after {
  transform: scaleX(1);
}

@media (prefers-reduced-motion: reduce) {
  .c-navbar__link::after {
    transition: none;
  }
}
```

## Repo conventions to follow

- Hairline token is `var(--border-hairline)` (1px).
- Bottom offset preserves the clamp token: `clamp(-0.3333rem, -0.2083vw, -0.1875rem)`.
- Directional underline uses `transform-origin: left` on hover and `transform-origin: right` on idle to achieve natural forward momentum.

## Steps

1. In `output/assets/css/components.css`, update `.c-navbar__link` (lines 110–116) to add `transition: color var(--transition-base);`.
2. Modify `.c-navbar__link[aria-current="page"]::after` selector (line 123) to `.c-navbar__link::after`.
3. Add `transform: scaleX(0); transform-origin: right; transition: transform 220ms var(--ease-out);` to `.c-navbar__link::after`.
4. Add the `@media (hover: hover) and (pointer: fine)` rule to scale to `1` with `transform-origin: left`.
5. Ensure `.c-navbar__link[aria-current="page"]::after` retains `transform: scaleX(1);`.
6. Add `@media (prefers-reduced-motion: reduce)` block disabling transition on `::after`.

## Boundaries

- Do NOT touch mobile layout (`@media (max-width: 1024px)`).
- Do NOT change link font-size or spacing.
- Do NOT alter SVG icons or logo layout.

## Verification

- **Mechanical**: Inspect `.c-navbar__link` in DevTools; verify `::after` exists and has `transform: scaleX(0)` on inactive items and `transform: scaleX(1)` on active.
- **Feel check**:
  - Hover cursor over "Facilities", "Location", "Contact": hairline expands smoothly from left to right in 220ms.
  - Move cursor away: hairline wipes away cleanly to the right without snapping.
  - Active "About" link remains firmly underlined without flickering.
  - Touch emulation: tapping a link on mobile does not leave an awkward half-drawn underline.
- **Done when**: Nav links feel elegant, responsive, and provide clear spatial feedback on hover.
