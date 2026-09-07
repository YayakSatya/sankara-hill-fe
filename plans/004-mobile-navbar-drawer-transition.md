# 004 — Smooth mobile navbar drawer transition

- **Status**: DONE
- **Commit**: 9bace6a
- **Severity**: HIGH
- **Category**: Purpose & frequency / Preventing a jarring change
- **Estimated scope**: 1 file (`output/assets/css/components.css`), ~30 lines

## Problem

On mobile and tablet viewports (`<= 1024px`), clicking the hamburger toggle snaps the navbar menu panel into existence via an un-animated `display: none` to `display: flex` toggle:

```css
/* output/assets/css/components.css:241-264 — current */
@media (max-width: 1024px) {
  .c-navbar {
    padding-inline: var(--space-6);
  }

  .c-navbar__toggle {
    display: inline-flex;
  }

  .c-navbar__links,
  .c-navbar__actions {
    position: static;
    transform: none;
  }

  .c-navbar__panel {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    flex-direction: column;
    align-items: flex-start;
    gap: var(--space-6);
    padding: var(--space-6);
    background-color: var(--color-surface);
    border-bottom: var(--border-hairline) solid var(--color-border);
    display: none;
  }

  .c-navbar__links {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--space-4);
  }

  .c-navbar[data-nav-open="true"] .c-navbar__panel {
    display: flex;
  }
}
```

While the hamburger icon morphs smoothly into an "X" via `var(--transition-base)`, the panel itself teleports onto the screen. It creates an unrefined, jarring snap across half the viewport that contradicts the site's premium feel.

## Target

Keep `.c-navbar__panel` in the layout with `display: flex;` in the mobile media query, but control its visibility via `opacity`, `transform: translateY(-8px)`, and `visibility: hidden` with `pointer-events: none`. Transition smoothly over 240ms using `var(--ease-out)`:

```css
/* output/assets/css/components.css — target (inside @media (max-width: 1024px)) */
  .c-navbar__panel {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: var(--space-6);
    padding: var(--space-6);
    background-color: var(--color-surface);
    border-bottom: var(--border-hairline) solid var(--color-border);
    opacity: 0;
    visibility: hidden;
    transform: translateY(-8px);
    pointer-events: none;
    transition:
      opacity 240ms var(--ease-out),
      transform 240ms var(--ease-out),
      visibility 240ms var(--ease-out);
  }

  .c-navbar[data-nav-open="true"] .c-navbar__panel {
    opacity: 1;
    visibility: visible;
    transform: translateY(0);
    pointer-events: auto;
  }

  @media (prefers-reduced-motion: reduce) {
    .c-navbar__panel {
      transform: none;
      transition:
        opacity 160ms var(--ease-out),
        visibility 160ms var(--ease-out);
    }
  }
```

## Repo conventions to follow

- Mobile breakpoint matches the existing `@media (max-width: 1024px)` block in `output/assets/css/components.css:226`.
- Easing uses the repo token `var(--ease-out)` (`cubic-bezier(0.23, 1, 0.32, 1)`).
- Desktop layout is unaffected: on `> 1024px`, line 138 (`.c-navbar__panel { display: contents; }`) remains dominant.
- Keyboard navigation: `visibility: hidden` guarantees closed menu links cannot receive keyboard focus or screen-reader virtual cursor.

## Steps

1. In `output/assets/css/components.css`, locate `.c-navbar__panel` inside `@media (max-width: 1024px)` (lines 241–254).
2. Change `display: none;` to `display: flex;`.
3. Add `opacity: 0; visibility: hidden; transform: translateY(-8px); pointer-events: none;`.
4. Add `transition: opacity 240ms var(--ease-out), transform 240ms var(--ease-out), visibility 240ms var(--ease-out);`.
5. Update `.c-navbar[data-nav-open="true"] .c-navbar__panel` (lines 262–264) to set `opacity: 1; visibility: visible; transform: translateY(0); pointer-events: auto;` instead of `display: flex;`.
6. Add the nested `@media (prefers-reduced-motion: reduce)` block to drop `transform`.

## Boundaries

- Do NOT touch `output/assets/js/main.js` (the `data-nav-open` state logic already works).
- Do NOT touch `.c-navbar__toggle-icon` transitions.
- Do NOT alter padding, borders, or colors of the panel.

## Verification

- **Mechanical**: Resize viewport below 1024px in browser; click the menu toggle button. Verify panel animates in and out.
- **Feel check**:
  - Open the menu: panel glides down 8px while gently fading in, aligning with the hamburger icon morph.
  - Close the menu: panel glides back up and fades out cleanly without jumping.
  - Spam toggle rapidly: animation retargets seamlessly mid-flight with zero stutter or restart glitch.
  - In DevTools (Rendering tab), enable `prefers-reduced-motion: reduce`: panel fades in/out without any vertical translation.
- **Done when**: Opening and closing the mobile navbar menu feels fluid, connected to the header, and free of teleporting frames.
