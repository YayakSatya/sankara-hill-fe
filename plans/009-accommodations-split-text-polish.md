# 009 — Polish accommodations split-text animation

- **Status**: DONE
- **Commit**: 02b25df
- **Severity**: HIGH
- **Category**: Performance / Easing & Physicality / Typography
- **Estimated scope**: 2 files (`output/assets/js/home.js`, `output/assets/css/pages/home.css`), ~70 lines

## Problem

The accommodations split-text simultaneous clip-path unmasking functions, but carries five craft and performance defects:

1. **DOM Query Allocation in rAF loop (`home.js:171, 207`)**:
   `slide.querySelectorAll('.c-split-line')` is queried inside `showTransition` on every scroll animation frame, creating garbage collection pressure and layout queries during active scroll:
   ```javascript
   /* output/assets/js/home.js:207 — current */
   var toLines = toItem.slide.querySelectorAll('.c-split-line');
   for (var tl = 0; tl < toLines.length; tl++) {
     toLines[tl].style.clipPath = 'inset(' + entryTopInset + '% 0px 0px 0px)';
     toLines[tl].style.transform = 'translateY(' + entryY + '%)';
   }
   ```
2. **Reflow Layout Thrashing on Init & Resize (`home.js:503-516`)**:
   `splitElement` interleaves `el.innerHTML = ...` (DOM write) with `span.offsetTop` (DOM read) sequentially across 8 target elements, triggering 8 forced synchronous layouts on load and every resize event:
   ```javascript
   /* output/assets/js/home.js:503-516 — current */
   el.innerHTML = words.map(...).join(' ');
   var spans = el.querySelectorAll('.c-split-word');
   for (var i = 0; i < spans.length; i++) {
     var top = spans[i].offsetTop; // forced reflow per element
   }
   ```
3. **Harsh Clip-Edge Pixel Cutoff**:
   Text enters with an abrupt subpixel clip boundary against the dark teal `#1f4b51` background. Without a gentle opacity onset during the initial 20% of translation, letter glyphs appear razor-cut rather than naturally unmasked.
4. **Typographic Word Orphans (`home.js:499`)**:
   Simple whitespace splitting permits single-word trailing lines (e.g. solitary "escape." or "Solitude" on line 3), violating luxury editorial balance.
5. **State Reset Inconsistency on Breakpoint Shift (`home.js:213-233`)**:
   `resetMobile` clears inline styles but leaves `.c-split-line` wrappers if triggered before `revertElement`, creating potential DOM structure divergence.

## Target

1. **Pre-Cached Line References in `slideData`**:
   Cache `.c-split-line` elements in each `slideData[i].lines` array once during init/split. `showTransition` accesses cached arrays with zero DOM queries per frame.
2. **Batched Read/Write Split Engine**:
   Phase 1 (write): Inject temporary `.c-split-word` spans into all elements.
   Phase 2 (read): Measure all `span.offsetTop` in a single layout read.
   Phase 3 (write): Build and commit `.c-split-line-mask` DOM for all elements.
3. **Subtle Opacity Lead on Unmasking**:
   Blend a smooth opacity onset during $p_\text{entry} \in [0, 0.25]$ (`opacity: Math.min(1, easeEntry / 0.25)`) with the `clip-path` + `translateY` reveal so letterforms enter softly without harsh pixel clipping.
4. **Orphan Prevention**:
   Join the last two words with a non-breaking space (`\u00A0`) before line measurement so headings and paragraphs never produce single-word trailing lines.
5. **Unified Mobile Teardown**:
   Fully restore text and dismantle split DOM structure cleanly when viewport drops below 1024px.

## Repo conventions to follow

- Easing curves use `--ease-out: cubic-bezier(0.23, 1, 0.32, 1);` from `output/assets/css/tokens.css`.
- Smoothstep curve $t_\text{eased} = t^2 (3 - 2t)$ for scroll scrub progression matching plan 002.
- Accessibility: `aria-label` retains complete string; visual lines keep `aria-hidden="true"`.
- Mobile layout reset matches `desktop.matches` architecture.

## Steps

1. **Update `output/assets/js/home.js` split engine**:
   - Add orphan protection (`\u00A0` between last two words).
   - Separate `splitElement` into a two-pass batch measure (`injectTempSpans()`, `measureLines()`, `applyLineMasks()`).
   - Cache created lines on `slideData[i].lines`.
2. **Update `output/assets/js/home.js` villa slider**:
   - In `showTransition`: use `fromItem.lines` and `toItem.lines` directly instead of `querySelectorAll`.
   - In `showTransition`: add subtle opacity lead `var entryOpacity = Math.min(1, easeEntry / 0.25).toFixed(3)` combined with `clipPath` and `transform`.
   - In `hideSlide` and `showDwell`: operate directly on cached `item.lines`.
3. **Update `output/assets/css/pages/home.css`**:
   - Ensure `.c-split-line` supports smooth opacity entry (`transition: transform 800ms var(--ease-out), clip-path 800ms var(--ease-out), opacity 400ms var(--ease-out)`).
   - Ensure `.p-villa-slide.is-transitioning .c-split-line` has `transition: none !important;`.

## Boundaries

- Do NOT touch HTML markup in `output/index.html`.
- Do NOT alter Figma layout proportions or typography tokens.
- Do NOT introduce external libraries (GSAP, SplitType, etc.). Plain vanilla JS only.

## Verification

- **Mechanical**:
  - Run `node --check output/assets/js/home.js` — must exit code 0.
  - In DevTools Performance panel: record a scroll through Accommodations pin. Confirm zero Forced Reflows (red triangles) during scrub.
- **Feel check**:
  - Scroll slowly into Accommodations: verify words unmask smoothly with no harsh cut glyph edges.
  - Scroll through all 3 villas: confirm zero micro-stutters or frame drops.
  - Inspect last line of villa description: confirm no solitary single-word orphan.
  - Resize viewport across 1024px boundary: confirm clean transition between split-text and plain text flow.
