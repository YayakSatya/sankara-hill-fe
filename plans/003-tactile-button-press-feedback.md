# 003 — Add tactile button press feedback

- **Status**: DONE
- **Commit**: 9bace6a
- **Severity**: MEDIUM
- **Category**: Physicality & origin / Feedback
- **Estimated scope**: 1 file (`output/assets/css/components.css`), ~20 lines

## Problem

All primary action buttons across the site (`.c-btn`, including `.c-btn--navbar`, `.c-btn--card`, and `.c-btn--form`) currently only define hover styles that darken their background. On `:active` (mouse click or touch press), there is zero physical or tactile feedback:

```css
/* output/assets/css/components.css:12-38 — current */
.c-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 44px; /* touch target floor, design-to-html.md §3 */
  border-radius: var(--radius-none);
  background-color: var(--color-action);
  color: var(--color-text-inverse);
  font-family: var(--font-body);
  font-style: normal;
  text-transform: uppercase;
  white-space: nowrap;
  transition: background-color var(--transition-base);
}

.c-btn:hover,
.c-btn:focus-visible {
  /* assumption: standard hover state, not shown in design */
  background-color: var(--color-action-strong);
}
```

Without a depression or scale response on press, buttons feel stiff, unresponsive, and unrefined. For a luxury 5-star brand with rigid geometric button borders (`--radius-none`), press feedback must feel deliberate and subtle without feeling springy or toy-like.

## Target

Introduce a restrained scale depression (`0.985`) on `:active` with fast recovery using the repo's `--ease-out` token within the standard press budget (120ms):

```css
/* output/assets/css/components.css — target */
.c-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 44px;
  border-radius: var(--radius-none);
  background-color: var(--color-action);
  color: var(--color-text-inverse);
  font-family: var(--font-body);
  font-style: normal;
  text-transform: uppercase;
  white-space: nowrap;
  transition: background-color var(--transition-base), transform 120ms var(--ease-out);
}

.c-btn:active {
  transform: scale(0.985);
}

@media (prefers-reduced-motion: reduce) {
  .c-btn:active {
    transform: none;
  }
}
```

## Repo conventions to follow

- Transition curves come from `output/assets/css/tokens.css` (`--ease-out: cubic-bezier(0.23, 1, 0.32, 1);`, `--transition-base: 160ms ease;`).
- Modifying only GPU-accelerated `transform` ensures 60/120fps performance on mobile touch devices.
- `scale(0.985)` keeps sharp-corner typography intact without subpixel blurring.

## Steps

1. In `output/assets/css/components.css`, update `.c-btn` (lines 12–25) to include `transform 120ms var(--ease-out)` in the `transition` property list.
2. In `output/assets/css/components.css`, add `.c-btn:active { transform: scale(0.985); }` immediately after the `:hover` / `:focus-visible` rules.
3. Add a `@media (prefers-reduced-motion: reduce)` block resetting `.c-btn:active` to `transform: none;`.

## Boundaries

- Do NOT alter button padding, margins, font-size, line-height, or border-radius.
- Do NOT touch button child elements or SVGs.
- Apply to `.c-btn` so all variants (`.c-btn--navbar`, `.c-btn--card`, `.c-btn--form`) inherit it uniformly.

## Verification

- **Mechanical**: Inspect element in DevTools; verify `transform: scale(0.985)` is applied on `:active`.
- **Feel check**:
  - Click and hold "Enquire Now" in the navbar, "Explore Villa", and "Check Availability" in the reservations form. The element should subtly press inward immediately on mousedown.
  - Release mouse button: the button snaps back cleanly without bouncing.
  - Turn on `prefers-reduced-motion: reduce` in DevTools (Rendering panel): button darkens on hover/click without scaling.
- **Done when**: All button clicks give an immediate, subtle tactile response under finger or cursor.
