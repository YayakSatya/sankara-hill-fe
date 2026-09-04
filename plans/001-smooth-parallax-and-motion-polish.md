# 001 — Add smooth image parallax and polish existing scroll motion

- **Status**: DONE — executed 2026-09-03, with post-execution review fixes (see note below)
- **Commit**: n/a — this project is not a git repository. Snapshot taken 2026-09-03. If the files below do not match what you find, STOP and report.
- **Severity**: MEDIUM
- **Category**: Missed opportunities (primary), Easing & duration, Accessibility, Performance
- **Estimated scope**: 5 files — `index.html` (attributes only), `tokens.css` (+3 lines), `base.css` (+~12 lines), `pages/home.css` (~2 edits + ~30 new lines), `assets/js/home.js` (+~150 lines, one new IIFE block)

## Problem

The site is a static marketing page for a resort. Every image on it is fully
static: the page scrolls, the images ride along at exactly the scroll speed, and
nothing conveys depth. For a marketing page whose entire product is "this place
looks beautiful", that is a missed opportunity (AUDIT.md §8).

Ten images qualify for parallax. Verbatim current markup:

```html
<!-- output/index.html:96-101 — current -->
      <img
        class="p-welcome__image"
        src="assets/images/welcome-image.jpg"
        alt="The Sankara Hill resort cliffside view over the ocean"
        width="1600" height="800" loading="lazy"
      />
```

```html
<!-- output/index.html:124-133 — current (this pattern repeats at 155/162 and 186/193) -->
              <img class="p-villa-slide__image" src="assets/images/ocean-hill-pool-villa-big-image.jpg"
                alt="Ocean Hill Pool Villa exterior with its private pool overlooking the sea"
                width="1081" height="1100" loading="lazy" decoding="async">
              ...
              <img class="p-villa-slide__inset" src="assets/images/ocean-hill-pool-villa-small-image.jpg"
                alt="Ocean Hill Pool Villa interior with private pool and ocean view"
                width="519" height="540" loading="lazy" decoding="async">
```

```html
<!-- output/index.html:226 — current (repeats at 234 and 242) -->
          <img class="c-highlight-block__thumbnail" src="assets/images/highlight-infinity-pool.png" alt="Infinity pool overlooking the ocean at sunset" width="513" height="560" loading="lazy" />
```

Three further problems in the motion that already exists:

**1. The villa crossfade uses a bare `ease` at 400ms.**

```css
/* output/assets/css/pages/home.css:237-245 — current */
  .p-villa-slide {
    position: absolute;
    inset: 0;
    flex-direction: row;
    gap: 0;
    opacity: 0;
    visibility: hidden;
    transition: opacity 400ms ease;
  }
```

Bare `ease` on an entrance is a finding (AUDIT.md §2: entering/exiting →
`ease-out`; built-in easings are too weak for deliberate motion). Worse, both the
outgoing and incoming slide sit at ~0.5 opacity through the middle of the
crossfade, so two villas are visibly double-exposed on top of each other —
exactly the case AUDIT.md §7 says to mask with a subtle `filter: blur(2px)`.

**2. There is exactly one motion token, and it is a bare built-in easing.**

```css
/* output/assets/css/tokens.css:166 — current */
  --transition-base: 160ms ease;
```

Every custom curve introduced by this plan has nowhere to live. AUDIT.md §7:
curves and durations should be shared tokens.

**3. The global reduced-motion rule cannot reach JS-driven transforms.**

```css
/* output/assets/css/base.css:103-109 — current */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

This zeroes CSS durations only. A parallax loop that writes
`style.transform` every frame is completely unaffected by it, so the new JS must
check `prefers-reduced-motion` itself or it will ship movement to users who
asked for none (AUDIT.md §6).

## Target

### Target A — new easing tokens

```css
/* output/assets/css/tokens.css — target, appended inside the same block that
   contains --transition-base, immediately after it */
  --transition-base: 160ms ease;
  /* Strong custom curves — the built-in keywords are too weak for deliberate
     motion. ease-out for anything entering or exiting; ease-in-out for things
     moving across the screen. */
  --ease-out: cubic-bezier(0.23, 1, 0.32, 1);
  --ease-in-out: cubic-bezier(0.77, 0, 0.175, 1);
```

Both values are copied exactly from the animation playbook. Do not round them,
do not substitute `ease-out`, do not add a third curve.

### Target B — villa crossfade

```css
/* output/assets/css/pages/home.css:237-245 — target */
  .p-villa-slide {
    position: absolute;
    inset: 0;
    flex-direction: row;
    gap: 0;
    opacity: 0;
    visibility: hidden;
    /* Marketing-length crossfade, so 400ms is deliberate and stays. The blur
       masks the moment both villas are half-visible at once. */
    transition: opacity 400ms var(--ease-out), filter 400ms var(--ease-out);
    filter: blur(2px);
  }
```

and the active state gains the resolved blur:

```css
/* output/assets/css/pages/home.css — target, replacing the existing
   `.p-villa-slide.is-active` rule inside the same @media (min-width: 1024px) block */
  .p-villa-slide.is-active {
    opacity: 1;
    visibility: visible;
    filter: blur(0);
  }
```

Keep 400ms. This is a marketing crossfade, not UI — AUDIT.md §2 explicitly
allows marketing durations to run longer than the 300ms UI budget. Keep the blur
at 2px (AUDIT.md §7 names that exact value; §5 caps transition-time blur well
below it).

### Target C — parallax opt-in attributes in the markup

Add `data-parallax="<speed>"` to the ten images. Nothing else about the tags
changes — same classes, same `src`, same `alt`, same `width`/`height`, same
`loading`, same `decoding`. The speed is the fraction of scroll distance the
image lags behind its container; higher = more visible movement.

| Image | Selector | `data-parallax` |
| --- | --- | --- |
| Welcome (index.html:96) | `.p-welcome__image` | `0.12` |
| Villa big ×3 (124, 155, 186) | `.p-villa-slide__image` | `0.08` |
| Villa inset ×3 (131, 162, 193) | `.p-villa-slide__inset` | `0.14` |
| Highlight thumbs ×3 (226, 234, 242) | `.c-highlight-block__thumbnail` | `0.1` |

The villa insets move fastest and the big villa images slowest, so the small
image reads as floating in front of the large one.

Example of the exact end state for one of each kind:

```html
<!-- output/index.html:96-101 — target -->
      <img
        class="p-welcome__image"
        src="assets/images/welcome-image.jpg"
        alt="The Sankara Hill resort cliffside view over the ocean"
        width="1600" height="800" loading="lazy"
        data-parallax="0.12"
      />
```

```html
<!-- output/index.html:124-133 — target -->
              <img class="p-villa-slide__image" src="assets/images/ocean-hill-pool-villa-big-image.jpg"
                alt="Ocean Hill Pool Villa exterior with its private pool overlooking the sea"
                width="1081" height="1100" loading="lazy" decoding="async" data-parallax="0.08">
              ...
              <img class="p-villa-slide__inset" src="assets/images/ocean-hill-pool-villa-small-image.jpg"
                alt="Ocean Hill Pool Villa interior with private pool and ocean view"
                width="519" height="540" loading="lazy" decoding="async" data-parallax="0.14">
```

```html
<!-- output/index.html:226 — target -->
          <img class="c-highlight-block__thumbnail" src="assets/images/highlight-infinity-pool.png" alt="Infinity pool overlooking the ocean at sunset" width="513" height="560" loading="lazy" data-parallax="0.1" />
```

Explicitly **not** parallaxed:

- `.c-map` — it is a Google Maps `<iframe>`, not an image. Do not touch it.
- `.p-reservations` background — a CSS `background-image`, no element to
  transform. Out of scope for this plan; do not restructure the markup for it.
- Footer social icons and the inline `<symbol>` icon defs — 24px SVGs. Moving
  them would be decorative noise on a frequently-seen element (AUDIT.md §1).

### Target D — parallax CSS

Two things are needed. First, a scale headroom so translating the image never
exposes an empty edge: an image moved 30px up must have 30px of overflow to give.
Second, the transform must be composited.

```css
/* output/assets/css/pages/home.css — target, appended at the end of the file */

/* --- image parallax ---------------------------------------------------- */
/* home.js drives translate3d() on these; the scale gives the movement room so
   the crop never slides past the element's own edge. Gated on
   prefers-reduced-motion so a reduced-motion visitor gets the plain,
   un-scaled crop rather than a zoomed one that never moves. */
@media (prefers-reduced-motion: no-preference) {
  [data-parallax] {
    /* Not `will-change` — that is toggled from JS only while the element is
       actually in range, so ten images do not hold ten layers for the whole
       page lifetime. */
    transform: translate3d(0, 0, 0) scale(1.12);
    backface-visibility: hidden;
  }
}

/* The parallax element must not be able to paint outside its own box. */
.p-welcome__media,
.p-villa-slide__media,
.c-highlight-block {
  overflow: hidden;
}
```

Before writing that last rule, confirm those three class names exist as the
direct parent of the corresponding image in `index.html`. If a parent is named
differently, use the real name; if an image has no wrapping element at all,
apply `overflow: hidden` to the nearest ancestor that has a border radius or a
fixed size, and note the substitution in your report. The `.p-villa-slide__inset`
has no dedicated wrapper — it sits inside `.p-villa-slide__detail`, which is
already inside `.p-cards-row { overflow: hidden }`, so it needs no new rule.

### Target E — the parallax engine

Appended to `output/assets/js/home.js` as a third IIFE, after the two that exist.
It must follow the conventions of the two IIFEs already in that file: `var`, not
`let`/`const`; `'use strict'`; a leading comment block explaining the mechanism;
`Array.prototype.forEach.call` for NodeLists; `{ passive: true }` on the scroll
listener; a single shared `requestAnimationFrame`, never one per element.

```js
/* output/assets/js/home.js — target, appended after the existing IIFEs */

(function () {
  'use strict';

  // Image parallax. Every [data-parallax] image is offset vertically by a
  // fraction of how far it has travelled through the viewport, smoothed with a
  // lerp so a fast scroll or a trackpad fling eases into place instead of
  // snapping. One shared rAF loop drives all of them; it parks itself when
  // every image has settled and wakes on the next scroll, so an idle page
  // costs nothing.
  //
  // The CSS pre-scales these images (see pages/home.css) to give the movement
  // headroom. Position is read fresh each frame rather than cached, because
  // the villa images live inside a position:sticky row whose document-relative
  // offset changes as the pin scrolls.

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  var nodes = document.querySelectorAll('[data-parallax]');
  if (!nodes.length) return;

  var SCALE = 1.12;   // must match the scale() in pages/home.css
  var EASE = 0.12;    // lerp factor per frame — lower is smoother and laggier
  var SETTLED = 0.05; // px; below this the loop stops writing

  var items = [];
  Array.prototype.forEach.call(nodes, function (el) {
    var speed = parseFloat(el.getAttribute('data-parallax'));
    if (!speed) return;
    items.push({ el: el, speed: speed, current: 0, target: 0, live: false });
  });
  if (!items.length) return;

  var running = false;

  function measure() {
    var vh = window.innerHeight;
    var awake = false;

    for (var i = 0; i < items.length; i++) {
      var item = items[i];
      var rect = item.el.getBoundingClientRect();

      // Skip anything with no box (display:none at this breakpoint, or a
      // villa slide that is not the active one).
      if (rect.height === 0) {
        item.target = 0;
        continue;
      }

      // Off screen with a viewport-height margin either side: leave it where
      // it is and stop paying for it.
      if (rect.bottom < -vh || rect.top > vh * 2) continue;

      // -1 when the element sits one viewport below the fold, +1 when it has
      // scrolled one viewport above it, 0 when its centre is centred.
      var progress = (rect.top + rect.height / 2 - vh / 2) / vh;
      if (progress < -1) progress = -1;
      if (progress > 1) progress = 1;

      // Travel is bounded by the headroom the scale bought us, so the crop can
      // never slide past the element's own edge.
      var headroom = (rect.height * (SCALE - 1)) / 2;
      item.target = -progress * item.speed * vh;
      if (item.target > headroom) item.target = headroom;
      if (item.target < -headroom) item.target = -headroom;
      awake = true;
    }

    return awake;
  }

  function frame() {
    // Read every rect first, then write every transform — interleaving them
    // forces a layout recalculation per image.
    var awake = measure();
    var moving = false;

    for (var i = 0; i < items.length; i++) {
      var item = items[i];
      var delta = item.target - item.current;

      if (Math.abs(delta) < SETTLED) {
        if (item.current !== item.target) {
          item.current = item.target;
          item.el.style.transform =
            'translate3d(0, ' + item.current.toFixed(2) + 'px, 0) scale(' + SCALE + ')';
        }
        if (item.live) {
          item.el.style.willChange = '';
          item.live = false;
        }
        continue;
      }

      item.current += delta * EASE;
      if (!item.live) {
        item.el.style.willChange = 'transform';
        item.live = true;
      }
      item.el.style.transform =
        'translate3d(0, ' + item.current.toFixed(2) + 'px, 0) scale(' + SCALE + ')';
      moving = true;
    }

    if (moving || awake) {
      window.requestAnimationFrame(frame);
    } else {
      running = false;
    }
  }

  function start() {
    if (running) return;
    running = true;
    window.requestAnimationFrame(frame);
  }

  function enable() {
    window.addEventListener('scroll', start, { passive: true });
    window.addEventListener('resize', start);
    start();
  }

  function disable() {
    window.removeEventListener('scroll', start);
    window.removeEventListener('resize', start);
    running = false;
    for (var i = 0; i < items.length; i++) {
      items[i].current = 0;
      items[i].target = 0;
      items[i].live = false;
      items[i].el.style.transform = '';
      items[i].el.style.willChange = '';
    }
  }

  if (!reduced.matches) enable();

  // Honour a mid-session change of the OS setting. The global reduced-motion
  // rule in base.css only zeroes CSS durations — it cannot stop a script that
  // writes style.transform, so this branch is the only thing protecting a
  // reduced-motion visitor from the movement.
  reduced.addEventListener('change', function () {
    if (reduced.matches) disable();
    else enable();
  });
})();
```

## Repo conventions to follow

- **CSS layer order** is `tokens.css` → `base.css` → `components.css` (`c-*`
  classes) → `pages/home.css` (`p-*` classes). A rule for a `p-*` element goes
  in `pages/home.css`; a rule for a `c-*` element goes in `components.css`. The
  `[data-parallax]` block is an exception — it spans both prefixes, so it lives
  at the end of `pages/home.css` where the page-specific scroll behaviour
  already lives.
- **Tokens** live in `output/assets/css/tokens.css`. The existing exemplar to
  imitate is line 166, `--transition-base: 160ms ease;` — a custom property in
  the same `:root`-level block, kebab-case, one per line, semicolon-terminated.
- **JS style** — `output/assets/js/home.js:49-110` is the exemplar. Note it uses
  `var`, wraps in `(function () { 'use strict'; … })();`, guards with an early
  `return` when its target element is missing, batches work behind a single
  `requestAnimationFrame`, and registers scroll with `{ passive: true }`. Match
  all of that. Do not modernise the surrounding code to `const`/arrow functions.
- **Comment density** — both existing IIFEs open with a multi-line comment
  explaining *why* the mechanism works the way it does, not what the next line
  does. The new IIFE's header comment above matches that register; keep it.
- **Progressive enhancement** — the file header comment states "without JS the
  first villa stays visible". Parallax must follow the same principle: with JS
  off, the images simply sit still. The CSS above achieves this because the
  scale is inert on its own and the transform only ever comes from JS.

## Steps

1. **`output/assets/css/tokens.css`** — find the line `--transition-base: 160ms ease;`
   (currently line 166). Directly after it, add the comment and the two custom
   properties from Target A. Change nothing else in this file.

2. **`output/assets/css/pages/home.css`** — in the `@media (min-width: 1024px)`
   block, locate `.p-villa-slide` (currently line 237). Replace its
   `transition: opacity 400ms ease;` (line 244) with the two-property transition
   from Target B and add the `filter: blur(2px);` line. Then find the
   `.p-villa-slide.is-active` rule in the same media block and add
   `filter: blur(0);` to it.

3. **`output/assets/css/pages/home.css`** — append the `[data-parallax]` block
   and the `overflow: hidden` rule from Target D at the very end of the file.
   Before writing the `overflow` rule, open `index.html` and confirm
   `.p-welcome__media`, `.p-villa-slide__media` and `.c-highlight-block` are
   really the wrapping elements of the welcome image, the villa big image, and
   the highlight thumbnail respectively. If a name differs, use the real one.

4. **`output/index.html`** — add the `data-parallax` attribute to the ten images
   listed in the Target C table, using the exact speed value from that table.
   Add the attribute and nothing else: no reordering, no reformatting, no
   changes to `alt`, `loading`, `decoding`, `width` or `height`.

5. **`output/assets/js/home.js`** — append the entire IIFE from Target E after
   the closing `})();` of the second IIFE (currently line 110). Do not modify
   either existing IIFE.

6. Run the verification below.

## Boundaries

- Do **NOT** touch `output/assets/js/main.js`. It is out of scope and its
  behaviour is unknown to this plan.
- Do **NOT** modify the two existing IIFEs in `home.js`. In particular, the
  navbar pin guard at `home.js:22-32` is deliberate — it keeps the navbar hidden
  in both scroll directions while the accommodations pin fills the viewport.
  Leave it exactly as it is.
- Do **NOT** remove or weaken `.c-navbar:focus-within` /
  `.c-navbar[data-nav-open="true"] { transform: none; }` at
  `output/assets/css/components.css:63-66`. That rule stops the bar hiding out
  from under a keyboard user; it is an accessibility guard, not dead code.
- Do **NOT** change the global reduced-motion block at
  `output/assets/css/base.css:103-109`. The new JS branch supplements it; it does
  not replace it.
- Do **NOT** add parallax to the Google Maps iframe, the reservations background,
  or any SVG icon.
- Do **NOT** add dependencies, a build step, or a package to `output/package.json`.
  This is plain HTML/CSS/vanilla JS and stays that way.
- Do **NOT** change markup beyond adding the `data-parallax` attributes in step 4.
- Do **NOT** convert the existing `var` declarations to `let`/`const` or the
  functions to arrow functions anywhere in `home.js`.
- If a step does not match the code you find — the line numbers have drifted, a
  class name differs, a rule is already present — STOP and report what you found
  instead of improvising a substitute.

## Verification

**Mechanical**

- `node --check output/assets/js/home.js` — must exit 0 with no output.
- `grep -c 'data-parallax' output/index.html` — must print `10`.
- `grep -n 'ease-out\|ease-in-out' output/assets/css/tokens.css` — must show
  exactly the two new lines, with the cubic-beziers `cubic-bezier(0.23, 1, 0.32, 1)`
  and `cubic-bezier(0.77, 0, 0.175, 1)` character-for-character.
- `grep -n 'transition: all\|ease-in ' output/assets/css/` (recursive) — must
  return nothing new. `ease-in-out` matches are fine; a bare `ease-in` is not.

**Feel check** — open `output/index.html` in a browser at a desktop width
(≥1024px) and scroll the full page slowly:

- The welcome image drifts *against* the scroll — as the page moves up, the
  image content lags slightly behind. The movement should be barely nameable; if
  it reads as "that image is sliding", the speed is too high.
- No image ever shows a gap, a white edge, or its own background at any scroll
  position. If one does, the scale headroom is being exceeded — report it rather
  than raising `SCALE` past 1.12.
- Scroll fast, then stop dead. The images should coast to a halt over a few
  frames, not stop the instant the wheel stops.
- Inside the pinned accommodations section, scroll through all three villas. The
  large image and the small inset must drift at visibly different rates, and the
  inset must never overlap or escape the panel.
- In DevTools → Performance, record a scroll through the whole page. There must
  be no red "long task" bars and no layout-thrash warnings; the parallax writes
  only `transform`.
- In DevTools → Rendering → "Paint flashing", scroll again. The parallax images
  should not repaint on every frame — they are composited layers.
- With the page idle (not scrolling), open the Performance monitor. CPU should
  return to ~0%: the loop must actually park itself rather than spin forever.
- Villa crossfade in slow motion: DevTools → Animations panel, set playback to
  10%, then scroll through a villa change. Confirm the outgoing villa blurs
  slightly as it fades and the incoming one sharpens as it arrives — you should
  never see two crisp villas stacked at half opacity.
- DevTools → Rendering → emulate `prefers-reduced-motion: reduce`, then reload
  and scroll the whole page. **No image may move at all.** The images should sit
  at their natural crop with no zoom applied, and the villa crossfade should
  become effectively instant. If anything still drifts, the JS guard is wrong.
- Resize the window from desktop down to mobile width and back while scrolled
  into the accommodations section. Nothing should jump, and no image should be
  left stranded at an offset.

**Done when**

- All four mechanical checks pass.
- Ten images visibly parallax on desktop, none clips its own edge at any scroll
  position, and the loop's CPU cost drops to zero when scrolling stops.
- With `prefers-reduced-motion: reduce` emulated, zero images move and zero
  images are scaled.
- The navbar still hides for the whole accommodations pin in both scroll
  directions, exactly as before this plan.

## Post-execution review notes (2026-09-03)

Review of the executor's diff found and fixed four defects after the fact:

1. **CSS `scale(1.12)` was not inert without JS.** The plan claimed the CSS
   scale was progressive enhancement; it was not — a visitor with JS disabled
   saw a permanent 12% zoom crop on all ten images. Fix: removed `scale()`
   from the `[data-parallax]` CSS rule and from the `prefers-reduced-motion`
   media wrapper entirely; JS now applies the scale on init. No-JS visitors
   get the natural crop, exactly as the plan's intent stated.
2. **Welcome image had no clipping ancestor.** `.p-welcome__media` does not
   exist in the markup (the `<img>` is a direct child of the section). The
   executor correctly refused to invent one. Fix: `.p-welcome` (the section)
   is the clip boundary. Backstop only — the JS headroom clamp still bounds
   travel, so no edge should ever be reachable.
3. **`.c-highlight-block` clips at the wrong box.** That element is a flex
   column wrapping thumbnail *and* text, so the clip boundary sits below the
   text. Same backstop rationale as (2); kept rather than dropped so the
   scale bleed cannot escape the card. `.p-villa-slide__detail` added for the
   inset images, same rationale.
4. **The rAF loop never parked.** `measure()` returned `awake` true for every
   frame an image was on-screen, and `frame()` re-armed on `moving || awake`
   — so the loop spun at 60fps forever while the page sat still. Fix: park on
   `moving` alone; scroll and resize both re-arm via `start()`.

Mechanical checks re-run after the fixes: `node --check` exit 0,
`data-parallax` count = 10, both cubic-beziers character-exact in
tokens.css:170-171, no `transition: all`, no bare `ease-in`.

## Follow-up fix: parallax images overlapping sibling content (2026-09-03)

Reported by the user after the plan shipped: the parallax itself felt right,
but the images visibly covered nearby content instead of staying inside a box.

**Cause.** Three of the parallaxing images (`.p-welcome__image`,
`.p-villa-slide__inset`, `.c-highlight-block__thumbnail`) were bare `<img>`
elements sitting as flex-column siblings of text and meta content. The
post-execution backstop added in note (2)/(3) above put `overflow: hidden` on
the nearest *section* ancestor, which is a loose box that also contains those
siblings. `translate3d()` moves painted pixels without moving layout, so a
translated image could paint over its own siblings while still being well
inside the ancestor's clip box — the backstop could never catch it.

**Decision.** The user chose a tight per-image wrapper (over the alternatives
of cutting the `scale(1.12)` headroom, or restructuring the offending
layouts). This exceeds the plan's original "do not change markup beyond adding
`data-parallax` attributes" boundary, and was done with the user's explicit
approval.

**Fix applied.**

- `output/index.html` — 7 new wrapper `<div>`s, one per affected image:
  `.p-welcome__media` (1), `.p-villa-slide__inset-media` (3),
  `.c-highlight-block__media` (3). Naming follows the existing
  `.p-villa-slide__media` wrapper. `data-parallax` attribute count unchanged
  at 10.
- `output/assets/css/pages/home.css` — sizing (`width` / `max-width` /
  `aspect-ratio`) and `overflow: hidden` + `border-radius` moved off the
  `<img>` rules onto the new wrappers, for both the mobile-first rules and
  the `@media (min-width: 1024px)` block. `.p-villa-slide__inset-media` also
  joined the desktop `flex: 0 0 auto` group so the wrapper, not the image,
  is what the flex column sizes. Each `<img>` now only fills its wrapper
  (`width/height: 100%`, `object-fit: cover`).
- `output/assets/css/components.css` — same split for
  `.c-highlight-block__thumbnail`, with the new `.c-highlight-block__media`
  carrying `height: var(--size-highlight-thumb)`.
- The section-level `overflow: hidden` rule at the bottom of `home.css` is
  kept but demoted in its comment to a secondary backstop; the tight
  wrappers are now the real clip.

**Verified mechanically.** `grep -c 'data-parallax' index.html` = 10;
`grep -c '__media' index.html` = 7 and each class matches a CSS rule;
`node --check assets/js/home.js` passes (`home.js` was not touched).
Visual confirmation that no image overlaps its siblings still needs a browser
check on both desktop and mobile widths.
