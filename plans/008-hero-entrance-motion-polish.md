# 008 — Refine hero entrance motion and coordination

- **Status**: DONE
- **Commit**: 9bace6a
- **Severity**: MEDIUM
- **Category**: Easing & duration / Physicality & origin
- **Estimated scope**: 2 files (`output/assets/css/loader.css`, `output/assets/css/pages/home.css`), ~35 lines

## Problem

Hero content (`.p-hero__content`) and navbar entrance during loader transition currently have three feel and cohesion issues:

1. **Token mismatch**: `loader.css:141-150` uses ad-hoc easing `cubic-bezier(0.16, 1, 0.3, 1)` instead of repo token `var(--ease-out)` (`cubic-bezier(0.23, 1, 0.32, 1)` from `tokens.css`).
2. **Monolithic entrance**: Entire `.p-hero__content` block (h1 title, lede paragraph, explore link) enters as one single rigid block without micro-stagger, making the transition feel stiff rather than editorial and cinematic.
3. **Accessibility omission**: `loader.css:158-169` handles reduced motion for `.c-loader`, but does not neutralize the 1.1s translation on `body.is-loader-revealing .p-hero__content` and `.c-navbar`, causing lingering motion sickness on devices with `prefers-reduced-motion: reduce`.

```css
/* output/assets/css/loader.css:138-150 — current */
body.is-loader-revealing .c-navbar {
  opacity: 1;
  transform: translateY(0);
  transition: opacity 1s cubic-bezier(0.16, 1, 0.3, 1) 0.5s,
              transform 1s cubic-bezier(0.16, 1, 0.3, 1) 0.5s;
}

body.is-loader-revealing .p-hero__content {
  opacity: 1;
  transform: translateY(0);
  transition: opacity 1.1s cubic-bezier(0.16, 1, 0.3, 1) 0.55s,
              transform 1.1s cubic-bezier(0.16, 1, 0.3, 1) 0.55s;
}
```

## Target

Align easing with repo design tokens, add subtle 80ms stagger between hero title and description/CTA, and provide clean reduced-motion fallbacks:

```css
/* output/assets/css/loader.css — target */
body.is-loading .c-navbar {
  opacity: 0;
  transform: translateY(-16px);
  pointer-events: none;
}

body.is-loading .p-hero__title {
  opacity: 0;
  transform: translateY(36px);
}

body.is-loading .p-hero__body {
  opacity: 0;
  transform: translateY(36px);
}

body.is-loader-revealing .c-navbar {
  position: relative;
  z-index: 10005;
  opacity: 1;
  transform: translateY(0);
  transition: opacity 850ms var(--ease-out) 0.85s,
              transform 850ms var(--ease-out) 0.85s;
}

body.is-loader-revealing .p-hero__content {
  position: relative;
  z-index: 10004;
}

body.is-loader-revealing .p-hero__title {
  opacity: 1;
  transform: translateY(0);
  transition: opacity 1050ms var(--ease-out) 1.05s,
              transform 1050ms var(--ease-out) 1.05s;
}

body.is-loader-revealing .p-hero__body {
  opacity: 1;
  transform: translateY(0);
  transition: opacity 1050ms var(--ease-out) 1.25s,
              transform 1050ms var(--ease-out) 1.25s;
}

@media (prefers-reduced-motion: reduce) {
  body.is-loading .c-navbar,
  body.is-loading .p-hero__title,
  body.is-loading .p-hero__body {
    transform: none !important;
  }
  body.is-loader-revealing .c-navbar,
  body.is-loader-revealing .p-hero__title,
  body.is-loader-revealing .p-hero__body {
    transform: none !important;
    transition: opacity 300ms ease !important;
  }
}
```

## Repo conventions to follow

- Easing tokens defined in `output/assets/css/tokens.css:177`:
  `--ease-out: cubic-bezier(0.23, 1, 0.32, 1);`
- Reduced-motion blocks in `output/assets/css/loader.css:158` and `output/assets/css/components.css:44` drop `transform` but retain opacity transition.

## Steps

1. In `output/assets/css/loader.css`, update initial hidden selectors for hero content to target `.p-hero__title` and `.p-hero__body` instead of container `.p-hero__content`.
2. In `output/assets/css/loader.css`, replace `cubic-bezier(0.16, 1, 0.3, 1)` with `var(--ease-out)` on `.c-navbar`, `.p-hero__title`, and `.p-hero__body`.
3. In `output/assets/css/loader.css`, add stagger delay: `0.45s` for title, `0.53s` for body (+80ms stagger).
4. In `output/assets/css/loader.css`, add reduced-motion block overriding transforms to `none` and collapsing transition to `300ms ease`.

## Boundaries

- Do NOT touch `loader.js` orchestration math (aperture scale is handled in Plan 007).
- Do NOT touch hero markup in `output/index.html`.
- Do NOT apply entrance animation to other page sections.

## Verification

- **Mechanical**: Verify syntax and clean styles load with zero console errors.
- **Feel check**:
  - Reload page at `http://localhost:4173/`.
  - When loader final slide expands to full bleed, navbar enters cleanly from top, followed smoothly by hero title, then body copy/explore CTA 80ms later.
  - No abrupt snap when `finishLoader()` removes `is-loader-revealing`.
  - In DevTools Rendering tab, turn on `prefers-reduced-motion: reduce` and confirm hero text fades in without vertical translation.
- **Done when**: Hero text and navbar reveal feels integrated, luxurious, uses `--ease-out`, and respects accessibility settings.
