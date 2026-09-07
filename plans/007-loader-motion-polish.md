# 007 — Polish loader performance, pacing, and motion cohesion

- **Status**: DONE
- **Commit**: 02b25df
- **Severity**: HIGH
- **Category**: Performance & Duration
- **Estimated scope**: 2 files (`output/assets/js/loader.js`, `output/assets/css/loader.css`)

## Problem

The initial portrait stack reveal loader has three critical motion defects:

1. **GPU Reflow / Dropped frames ([`output/assets/css/loader.css:115-119`](file:///c:/Users/Yayak/Documents/sankara-hill-fe/TSH-project/output/assets/css/loader.css#L115-L119) and [`output/assets/js/loader.js:128-133`](file:///c:/Users/Yayak/Documents/sankara-hill-fe/TSH-project/output/assets/js/loader.js#L128-L133)):**
   The hero expansion animation interpolates `top`, `left`, `width`, and `height` continuously over 1100ms. Modifying layout geometry on every frame triggers continuous style recalculations, reflows, and repaints across the entire document during the transition.

```css
/* output/assets/css/loader.css:115-119 — current */
.c-loader__slide--final.is-expanding {
  z-index: 9999;
  box-shadow: none;
  transition: top 1.1s cubic-bezier(0.23, 1, 0.32, 1),
              left 1.1s cubic-bezier(0.23, 1, 0.32, 1),
              width 1.1s cubic-bezier(0.23, 1, 0.32, 1),
              height 1.1s cubic-bezier(0.23, 1, 0.32, 1);
}
```

```javascript
/* output/assets/js/loader.js:128-133 — current */
finalSlide.classList.add('is-expanding');
finalSlide.style.top = heroRect.top + 'px';
finalSlide.style.left = heroRect.left + 'px';
finalSlide.style.width = heroRect.width + 'px';
finalSlide.style.height = heroRect.height + 'px';
```

2. **Excessive Duration / High Wait Penalty ([`output/assets/js/loader.js:77-92`](file:///c:/Users/Yayak/Documents/sankara-hill-fe/TSH-project/output/assets/js/loader.js#L77-L92)):**
   The loader holds user attention hostage for over 5.6 seconds (180ms delay + 5 × 780ms reveal sequence + 480ms hold + 1150ms expand). The pace is sluggish and exceeds reasonable thresholds for luxury editorial web pacing.

3. **Motion Desynchronization & Non-standard Tokens ([`output/assets/css/loader.css:75-102`](file:///c:/Users/Yayak/Documents/sankara-hill-fe/TSH-project/output/assets/css/loader.css#L75-L102)):**
   Image zoom-out takes `0.9s` while clip-path reveal completes in `0.75s`. The overlay uses an arbitrary cubic bezier `(0.25, 1, 0.3, 1)` that does not match the project's `--ease-out` token `(0.23, 1, 0.32, 1)`.

---

## Target

1. **Hardware-Accelerated FLIP Expansion:**
   Hero expansion must use `transform: translate3d(...) scale(...)` on a fixed-coordinate element with `transform-origin: top left`. No layout properties (`top`, `left`, `width`, `height`) animate.
2. **Snappy Editorial Pacing:**
   Reduce total duration from ~5.6s to ~3.1s:
   - `initialDelay`: `120ms`
   - `revealDuration`: `520ms` (down from 700ms)
   - `stepInterval`: `380ms` (gentle cascade overlap)
   - `pauseAfterFinal`: `240ms`
   - `morphDuration`: `850ms` (down from 1100ms)
3. **Synchronized Easing & Zoom:**
   - Synchronize slide `clip-path` (520ms) and image `scale(1.06) -> scale(1)` (520ms).
   - Standardize all transitions to `cubic-bezier(0.23, 1, 0.32, 1)`.

---

## Repo conventions to follow

- Easing curve: `cubic-bezier(0.23, 1, 0.32, 1)` (defined in `output/assets/css/tokens.css` as `--ease-out`).
- Vanilla JavaScript in IIFE pattern without external dependencies.
- Maintain existing `prefers-reduced-motion` compliance.

---

## Steps

### Step 1: Update CSS transition properties in `output/assets/css/loader.css`

Replace lines 74-88 and 100-123 in [`output/assets/css/loader.css`](file:///c:/Users/Yayak/Documents/sankara-hill-fe/TSH-project/output/assets/css/loader.css):

```css
/* output/assets/css/loader.css — target */

/* Image inside slide */
.c-loader__img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  display: block;
  user-select: none;
  -webkit-user-drag: none;
  transform: scale(1.06);
  transition: transform 0.52s cubic-bezier(0.23, 1, 0.32, 1);
  will-change: transform;
}

/* Revealing state: bottom-to-top unmasking */
.c-loader__slide.is-revealed {
  clip-path: inset(0% 0 0 0);
  transition: clip-path 0.52s cubic-bezier(0.23, 1, 0.32, 1);
}

.c-loader__slide.is-revealed .c-loader__img {
  transform: scale(1);
}
```

And update `.c-loader__slide-overlay` and `.is-expanding`:

```css
/* Subtle dark gradient overlay for final hero slide */
.c-loader__slide-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.7) 100%);
  opacity: 0;
  transition: opacity 0.85s cubic-bezier(0.23, 1, 0.32, 1);
  pointer-events: none;
}

/* Scrim fade duration */
.c-loader__scrim {
  position: absolute;
  inset: 0;
  background-color: var(--color-teal-950, #081a1c);
  opacity: 1;
  transition: opacity 0.85s cubic-bezier(0.23, 1, 0.32, 1);
  will-change: opacity;
  z-index: 1;
}

/* Morphing / Expanding state — GPU only */
.c-loader.is-morphing .c-loader__scrim {
  opacity: 0;
}

.c-loader__slide--final.is-expanding {
  z-index: 9999;
  box-shadow: none;
  transition: transform 0.85s cubic-bezier(0.23, 1, 0.32, 1);
  will-change: transform;
}
```

And coordinate navbar and hero reveal:

```css
body.is-loader-revealing .c-navbar {
  opacity: 1;
  transform: translateY(0);
  transition: opacity 0.7s cubic-bezier(0.23, 1, 0.32, 1) 0.2s,
              transform 0.7s cubic-bezier(0.23, 1, 0.32, 1) 0.2s;
}

body.is-loader-revealing .p-hero__content {
  opacity: 1;
  transform: translateY(0);
  transition: opacity 0.8s cubic-bezier(0.23, 1, 0.32, 1) 0.25s,
              transform 0.8s cubic-bezier(0.23, 1, 0.32, 1) 0.25s;
}
```

---

### Step 2: Update orchestration timings and FLIP morph in `output/assets/js/loader.js`

Replace lines 77-144 in [`output/assets/js/loader.js`](file:///c:/Users/Yayak/Documents/sankara-hill-fe/TSH-project/output/assets/js/loader.js):

```javascript
    // Snappy luxury sequence
    var revealDuration = 520; // ms for bottom-to-top clip-path unmasking
    var stepInterval = 380;   // ms between slide reveals
    var initialDelay = 120;   // ms pause before first reveal

    slides.forEach(function (slide, index) {
      setTimeout(function () {
        slide.classList.add('is-revealed');
      }, initialDelay + index * stepInterval);
    });

    var finalFullyRevealedTime = initialDelay + (slides.length - 1) * stepInterval + revealDuration;
    var pauseAfterFinal = 240;
    var morphStartTime = finalFullyRevealedTime + pauseAfterFinal;

    setTimeout(function () {
      startHeroScaleTransition();
    }, morphStartTime);
  }

  function startHeroScaleTransition() {
    var hero = document.querySelector('.p-hero');
    if (!hero || !finalSlide) {
      finishLoader();
      return;
    }

    var slideRect = finalSlide.getBoundingClientRect();
    var heroRect = hero.getBoundingClientRect();

    // FLIP: Position finalSlide at the target hero bounding rect
    finalSlide.style.position = 'fixed';
    finalSlide.style.top = heroRect.top + 'px';
    finalSlide.style.left = heroRect.left + 'px';
    finalSlide.style.width = heroRect.width + 'px';
    finalSlide.style.height = heroRect.height + 'px';
    finalSlide.style.clipPath = 'none';
    finalSlide.style.margin = '0';
    finalSlide.style.zIndex = '10002';
    finalSlide.style.transformOrigin = 'top left';

    // Invert: compute scale and translation offset from initial portrait box
    var scaleX = slideRect.width / heroRect.width;
    var scaleY = slideRect.height / heroRect.height;
    var translateX = slideRect.left - heroRect.left;
    var translateY = slideRect.top - heroRect.top;

    finalSlide.style.transform = 'translate3d(' + translateX + 'px, ' + translateY + 'px, 0) scale(' + scaleX + ', ' + scaleY + ')';

    // Force reflow before applying transition class
    void finalSlide.offsetHeight;

    // Trigger morphing: scrim dissolves, hero and navbar fade in
    loader.classList.add('is-morphing');
    document.body.classList.add('is-loader-revealing');

    // Play: transition transform to identity (translate 0, scale 1) — pure GPU composite
    requestAnimationFrame(function () {
      finalSlide.classList.add('is-expanding');
      finalSlide.style.transform = 'translate3d(0, 0, 0) scale(1, 1)';

      var overlay = finalSlide.querySelector('.c-loader__slide-overlay');
      if (overlay) {
        overlay.style.opacity = '1';
      }
    });

    // When scale transition completes (850ms duration + buffer)
    setTimeout(function () {
      finishLoader();
    }, 900);
  }
```

---

## Boundaries

- Do NOT add `sessionStorage` or click-to-skip handlers (excluded per user preference for production review).
- Do NOT alter HTML markup or remove slides.
- Do NOT touch hero styles outside of coordinating classes.
- If existing code does not match commit `02b25df`, STOP and report.

---

## Verification

- **Mechanical**:
  - Open `http://localhost:4173/` in browser.
  - Check browser console: zero errors.
- **Feel check**:
  - **Pacing**: Sequence starts promptly, slide cascade feels rhythmic (~3.1s total), never stalls.
  - **Expansion**: Open Chrome DevTools > Rendering > Paint Flashing. Observe hero expansion: the expanding portrait slide must NOT trigger full-page green paint rectangles during the 850ms scale transition.
  - **Synchronization**: Image zoom-in completes exactly when clip-path finishes unmasking.
  - **Reduced Motion**: Emulate `prefers-reduced-motion: reduce`. Loader fades out smoothly in 300ms without card animation or morph.
- **Done when**: Loader finishes in ~3.1 seconds with silky 60fps GPU-only expansion into the hero section.
