/* ==========================================================================
   Sankara Hill — home page interactions
   Villa slider: on desktop (>=1024px) the accommodations section is pinned
   and scroll progress through the pin selects the active villa. Below that
   breakpoint the CSS stacks all villas and this script does nothing.
   Progressive enhancement: without JS the first villa stays visible.
   ========================================================================== */

(function () {
  'use strict';

  var navbar = document.querySelector('.c-navbar');
  if (navbar) {
    var pin = document.querySelector('[data-villa-slider]');
    var desktop = window.matchMedia('(min-width: 1024px)');
    var lastY = window.scrollY;
    var queued = false;

    function update() {
      queued = false;
      var y = window.scrollY;

      // Transparent at top, solid white when scrolled
      if (y > 20) {
        navbar.classList.add('is-scrolled');
      } else {
        navbar.classList.remove('is-scrolled');
      }

      if (pin && desktop.matches) {
        // While the accommodations pin spans the viewport the villa swap
        // animation is running — keep the navbar hidden in BOTH scroll
        // directions so it never slides in over the pinned panels.
        var rect = pin.getBoundingClientRect();
        if (rect.top <= 0 && rect.bottom >= window.innerHeight) {
          navbar.classList.add('is-hidden');
          lastY = y;
          return;
        }
      }

      navbar.classList.remove('is-hidden');
      lastY = y;
    }

    function schedule() {
      if (queued) return;
      queued = true;
      window.requestAnimationFrame(update);
    }

    window.addEventListener('scroll', schedule, { passive: true });
    if (window.lenis) {
      window.lenis.on('scroll', update);
    }
    update();
  }
})();

(function () {
  'use strict';

  var pin = document.querySelector('[data-villa-slider]');
  if (!pin) return;

  var header = pin.querySelector('.p-accommodations__header');
  var slides = pin.querySelectorAll('[data-villa-slide]');
  if (slides.length < 2) return;

  var desktop = window.matchMedia('(min-width: 1024px)');
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  var queued = false;

  var slideData = Array.prototype.map.call(slides, function (slide) {
    return {
      slide: slide,
      media: slide.querySelector('.p-villa-slide__media'),
      title: slide.querySelector('.p-villa-slide__title'),
      titleWrapper: slide.querySelector('.p-villa-slide__title-wrapper'),
      insetMedia: slide.querySelector('.p-villa-slide__inset-media'),
      insetWrapper: slide.querySelector('.p-villa-slide__inset-wrapper'),
      content: slide.querySelector('.p-villa-slide__content-wrapper'),
      meta: slide.querySelector('.p-villa-meta'),
      desc: slide.querySelector('.p-villa-slide__description'),
      link: slide.querySelector('.p-villa-slide__link'),
      lines: []
    };
  });

  window.__tshRefreshVillaLines = function () {
    for (var i = 0; i < slideData.length; i++) {
      slideData[i].lines = Array.prototype.slice.call(slideData[i].slide.querySelectorAll('.c-split-line'));
    }
  };

  // =========================================================================
  // Text Transition Modes:
  // 'option2' = Pure Masking / Curtain (pure clip-path + translateY, NO opacity fade on text lines)
  // 'option1' = Clean & Editorial (clip-path bottom-to-top reveal + quick fade on enter, pure fade/translateY on exit)
  // =========================================================================
  var TEXT_TRANSITION_MODE = 'option2';
  document.documentElement.setAttribute('data-split-mode', TEXT_TRANSITION_MODE);

  window.__tshSetTextAnimationMode = function (mode) {
    if (mode === 'option1' || mode === 'option2') {
      TEXT_TRANSITION_MODE = mode;
      document.documentElement.setAttribute('data-split-mode', mode);
      schedule();
      console.log('[TSH] Text animation mode switched to:', mode);
    }
  };

  function hideSlide(item) {
    item.slide.style.visibility = 'hidden';
    item.slide.style.opacity = '0';
    item.slide.style.pointerEvents = 'none';
    item.slide.style.zIndex = '0';
    item.slide.classList.remove('is-active', 'is-transitioning');
    item.slide.setAttribute('aria-hidden', 'true');
    if (item.media) item.media.style.clipPath = '';
    if (item.insetMedia) item.insetMedia.style.clipPath = '';
    if (item.title) {
      item.title.style.visibility = 'hidden';
      item.title.style.opacity = '0';
      item.title.style.transform = '';
    }
    if (item.content) {
      item.content.style.visibility = 'hidden';
      item.content.style.opacity = '0';
    }
    if (item.meta) {
      item.meta.style.opacity = '0';
      item.meta.style.transform = '';
    }
    if (item.link) {
      item.link.style.opacity = '0';
      item.link.style.transform = '';
    }
    for (var l = 0; l < item.lines.length; l++) {
      item.lines[l].style.clipPath = 'inset(100% 0px 0px 0px)';
      item.lines[l].style.transform = 'translateY(105%)';
      item.lines[l].style.opacity = '0';
    }
  }

  function showDwell(activeIdx) {
    for (var i = 0; i < slideData.length; i++) {
      var item = slideData[i];
      if (i === activeIdx) {
        item.slide.style.visibility = 'visible';
        item.slide.style.opacity = '1';
        item.slide.style.pointerEvents = 'auto';
        item.slide.style.zIndex = '2';
        item.slide.classList.add('is-active');
        item.slide.classList.remove('is-transitioning');
        item.slide.setAttribute('aria-hidden', 'false');
        if (item.media) item.media.style.clipPath = 'none';
        if (item.insetMedia) item.insetMedia.style.clipPath = 'none';
        if (item.title) {
          item.title.style.visibility = 'visible';
          item.title.style.opacity = '1';
          item.title.style.transform = 'translateY(0px)';
        }
        if (item.content) {
          item.content.style.visibility = 'visible';
          item.content.style.opacity = '1';
        }
        if (item.meta) {
          item.meta.style.opacity = '1';
          item.meta.style.transform = 'translateY(0px)';
        }
        if (item.link) {
          item.link.style.opacity = '1';
          item.link.style.transform = 'translateY(0px)';
        }
        for (var al = 0; al < item.lines.length; al++) {
          item.lines[al].style.clipPath = 'inset(0% 0px 0px 0px)';
          item.lines[al].style.transform = 'translateY(0%)';
          item.lines[al].style.opacity = '1';
        }
      } else {
        hideSlide(item);
      }
    }
  }

  function showTransition(fromIdx, toIdx, t) {
    for (var i = 0; i < slideData.length; i++) {
      if (i !== fromIdx && i !== toIdx) {
        hideSlide(slideData[i]);
      }
    }

    var fromItem = slideData[fromIdx];
    var toItem = slideData[toIdx];

    // Outgoing slide (base layer)
    fromItem.slide.style.visibility = 'visible';
    fromItem.slide.style.opacity = '1';
    if (fromItem.slide.style.zIndex !== '1') fromItem.slide.style.zIndex = '1';
    fromItem.slide.style.pointerEvents = t < 0.5 ? 'auto' : 'none';
    fromItem.slide.classList.remove('is-active');
    fromItem.slide.classList.add('is-transitioning');
    fromItem.slide.setAttribute('aria-hidden', t < 0.5 ? 'false' : 'true');
    if (fromItem.media) fromItem.media.style.clipPath = 'none';
    if (fromItem.insetMedia) fromItem.insetMedia.style.clipPath = 'none';

    // Incoming slide visual layer (photos clip wipe across t: 0 -> 1)
    var easeT = t * t * (3 - 2 * t);
    var topInset = ((1 - easeT) * 100).toFixed(2);
    var clipVal = 'inset(' + topInset + '% 0px 0px 0px)';

    toItem.slide.style.visibility = 'visible';
    toItem.slide.style.opacity = '1';
    if (toItem.slide.style.zIndex !== '2') toItem.slide.style.zIndex = '2';
    toItem.slide.style.pointerEvents = t >= 0.5 ? 'auto' : 'none';
    toItem.slide.classList.remove('is-active');
    toItem.slide.classList.add('is-transitioning');
    toItem.slide.setAttribute('aria-hidden', t >= 0.5 ? 'false' : 'true');
    if (toItem.media) toItem.media.style.clipPath = clipVal;
    if (toItem.insetMedia) toItem.insetMedia.style.clipPath = clipVal;

    // 1. Outgoing typography & meta clears during first 35% of transition (t: 0 -> 0.35)
    var pExit = Math.min(1, Math.max(0, t / 0.35));
    if (pExit >= 1) {
      if (fromItem.title) {
        fromItem.title.style.visibility = 'hidden';
        fromItem.title.style.opacity = '0';
      }
      if (fromItem.content) {
        fromItem.content.style.visibility = 'hidden';
        fromItem.content.style.opacity = '0';
      }
      if (fromItem.meta) fromItem.meta.style.opacity = '0';
      if (fromItem.link) fromItem.link.style.opacity = '0';
      for (var fl = 0; fl < fromItem.lines.length; fl++) {
        fromItem.lines[fl].style.clipPath = 'inset(0px 0px 100% 0px)';
        fromItem.lines[fl].style.opacity = '0';
      }
    } else {
      var fromOpacity = (1 - pExit).toFixed(3);
      var fromY = (-pExit * 14).toFixed(1);

      if (fromItem.title) {
        fromItem.title.style.visibility = 'visible';
        fromItem.title.style.opacity = fromOpacity;
        fromItem.title.style.transform = 'translateY(0px)';
      }
      if (fromItem.content) {
        fromItem.content.style.visibility = 'visible';
        fromItem.content.style.opacity = fromOpacity;
      }
      if (fromItem.meta) {
        fromItem.meta.style.opacity = fromOpacity;
        fromItem.meta.style.transform = 'translateY(' + fromY + 'px)';
      }
      if (fromItem.link) {
        fromItem.link.style.opacity = fromOpacity;
        fromItem.link.style.transform = 'translateY(' + fromY + 'px)';
      }

      if (TEXT_TRANSITION_MODE === 'option2') {
        // [OPTION 2]: Pure Curtain / Masking only (100% opacity, pure clip wipe)
        var easeExit2 = pExit * pExit * (3 - 2 * pExit);
        var exitClipBottom2 = (easeExit2 * 100).toFixed(1);
        var exitLineY2 = (-easeExit2 * 20).toFixed(1);
        for (var fl2 = 0; fl2 < fromItem.lines.length; fl2++) {
          fromItem.lines[fl2].style.clipPath = 'inset(0px 0px ' + exitClipBottom2 + '% 0px)';
          fromItem.lines[fl2].style.transform = 'translateY(' + exitLineY2 + 'px)';
          fromItem.lines[fl2].style.opacity = '1';
        }
      } else {
        // [OPTION 1]: Clean & Editorial (pure fade-out + slight rise, NO clip slicing on exit)
        for (var fl1 = 0; fl1 < fromItem.lines.length; fl1++) {
          fromItem.lines[fl1].style.clipPath = 'none';
          fromItem.lines[fl1].style.transform = 'translateY(' + fromY + 'px)';
          fromItem.lines[fl1].style.opacity = fromOpacity;
        }
      }
    }

    // 2. Incoming typography & meta enters during last 35% of transition (t: 0.65 -> 1.0)
    // Middle 30% gap (t: 0.35 -> 0.65) has zero text overlap
    var pEntry = Math.min(1, Math.max(0, (t - 0.65) / 0.35));
    if (pEntry <= 0) {
      if (toItem.title) {
        toItem.title.style.visibility = 'hidden';
        toItem.title.style.opacity = '0';
      }
      if (toItem.content) {
        toItem.content.style.visibility = 'hidden';
        toItem.content.style.opacity = '0';
      }
      if (toItem.meta) toItem.meta.style.opacity = '0';
      if (toItem.link) toItem.link.style.opacity = '0';
      for (var tl = 0; tl < toItem.lines.length; tl++) {
        toItem.lines[tl].style.clipPath = 'inset(100% 0px 0px 0px)';
        toItem.lines[tl].style.transform = 'translateY(105%)';
        toItem.lines[tl].style.opacity = '0';
      }
    } else {
      var toOpacity = pEntry.toFixed(3);
      var toY = ((1 - pEntry) * 14).toFixed(1);
      var easeEntry = pEntry * pEntry * (3 - 2 * pEntry);
      var entryTopInset = ((1 - easeEntry) * 100).toFixed(1);
      var entryLineY = ((1 - easeEntry) * 105).toFixed(1);

      if (toItem.title) {
        toItem.title.style.visibility = 'visible';
        toItem.title.style.opacity = toOpacity;
        toItem.title.style.transform = 'translateY(0px)';
      }
      if (toItem.content) {
        toItem.content.style.visibility = 'visible';
        toItem.content.style.opacity = toOpacity;
      }
      if (toItem.meta) {
        toItem.meta.style.opacity = toOpacity;
        toItem.meta.style.transform = 'translateY(' + toY + 'px)';
      }
      if (toItem.link) {
        toItem.link.style.opacity = toOpacity;
        toItem.link.style.transform = 'translateY(' + toY + 'px)';
      }

      if (TEXT_TRANSITION_MODE === 'option2') {
        // [OPTION 2]: Pure Curtain / Masking only (100% opacity, pure bottom-to-top clip unmask)
        for (var tl2 = 0; tl2 < toItem.lines.length; tl2++) {
          toItem.lines[tl2].style.clipPath = 'inset(' + entryTopInset + '% 0px 0px 0px)';
          toItem.lines[tl2].style.transform = 'translateY(' + entryLineY + '%)';
          toItem.lines[tl2].style.opacity = '1';
        }
      } else {
        // [OPTION 1]: Clean & Editorial (clip-path unmask + subtle quick fade-in)
        var lineFadeIn = Math.min(1, easeEntry / 0.35).toFixed(3);
        for (var tl1 = 0; tl1 < toItem.lines.length; tl1++) {
          toItem.lines[tl1].style.clipPath = 'inset(' + entryTopInset + '% 0px 0px 0px)';
          toItem.lines[tl1].style.transform = 'translateY(' + entryLineY + '%)';
          toItem.lines[tl1].style.opacity = lineFadeIn;
        }
      }
    }
  }

  function resetMobile() {
    for (var i = 0; i < slideData.length; i++) {
      var item = slideData[i];
      item.slide.style.visibility = '';
      item.slide.style.opacity = '';
      item.slide.style.pointerEvents = '';
      item.slide.style.zIndex = '';
      item.slide.classList.remove('is-active', 'is-transitioning');
      item.slide.removeAttribute('aria-hidden');
      if (item.media) item.media.style.clipPath = '';
      if (item.insetMedia) item.insetMedia.style.clipPath = '';
      if (item.title) {
        item.title.style.opacity = '';
        item.title.style.transform = '';
      }
      if (item.content) {
        item.content.style.opacity = '';
      }
      if (item.meta) {
        item.meta.style.opacity = '';
        item.meta.style.transform = '';
      }
      if (item.link) {
        item.link.style.opacity = '';
        item.link.style.transform = '';
      }
      for (var l = 0; l < item.lines.length; l++) {
        item.lines[l].style.clipPath = '';
        item.lines[l].style.transform = '';
        item.lines[l].style.opacity = '';
      }
    }
  }

  function update() {
    queued = false;

    if (!desktop.matches) {
      resetMobile();
      return;
    }

    var rect = pin.getBoundingClientRect();
    var offset = header ? header.offsetHeight : 0;
    var travel = rect.height - window.innerHeight - offset;
    var progress = travel > 0 ? (-rect.top - offset) / travel : 0;
    progress = Math.min(Math.max(progress, 0), 1);

    if (reduced.matches) {
      var step = Math.min(Math.floor(progress * slideData.length), slideData.length - 1);
      showDwell(step);
      return;
    }

    // 3 Slides timeline:
    // [0.00, 0.20) -> Slide 0 dwell
    // [0.20, 0.45) -> Transition 0 -> 1
    // [0.45, 0.70) -> Slide 1 dwell
    // [0.70, 0.95) -> Transition 1 -> 2
    // [0.95, 1.00] -> Slide 2 dwell
    if (progress < 0.20) {
      showDwell(0);
    } else if (progress < 0.45) {
      var t01 = (progress - 0.20) / 0.25;
      showTransition(0, 1, t01);
    } else if (progress < 0.70) {
      showDwell(1);
    } else if (progress < 0.95) {
      var t12 = (progress - 0.70) / 0.25;
      showTransition(1, 2, t12);
    } else {
      showDwell(2);
    }
  }

  function schedule() {
    if (queued) return;
    queued = true;
    window.requestAnimationFrame(update);
  }

  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule);
  desktop.addEventListener('change', schedule);
  reduced.addEventListener('change', schedule);
  update();
})();

(function () {
  'use strict';

  // Image parallax. Every [data-parallax] image is offset vertically by a
  // fraction of how far it has travelled through the viewport, smoothed by a
  // lerp so a fast scroll or trackpad fling eases into place instead of
  // snapping. One shared rAF loop drives all of them; it parks itself when
  // every image has settled and wakes on the next scroll, so an idle page
  // costs nothing.
  //
  // The engine applies the scale itself (see SCALE below) so it gives the
  // movement headroom: with no JS the images render at their natural crop,
  // not a permanent zoom. Position is read fresh each frame rather than
  // cached, because the villa images live inside a position:sticky row whose
  // document-relative offset changes as the pin scrolls.

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  var nodes = document.querySelectorAll('[data-parallax]');
  if (!nodes.length) return;

  // Must stay in sync with the [data-parallax] CSS in pages/home.css.
  var SCALE = 1.12;
  var EASE = 0.12; // lerp factor per frame — lower is smoother but laggier
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

      // Skip elements whose parent villa slide is currently hidden
      var slideParent = item.el.closest ? item.el.closest('[data-villa-slide]') : null;
      if (slideParent && slideParent.getAttribute('aria-hidden') === 'true') {
        item.target = 0;
        continue;
      }

      var rect = item.el.getBoundingClientRect();

      // Skip anything with no box (display:none at this breakpoint, or a
      // villa slide that isn't the active one).
      if (rect.height === 0) {
        item.target = 0;
        continue;
      }

      // Off screen by a viewport-height margin on either side: leave it where
      // it is and stop paying for it.
      if (rect.bottom < -vh || rect.top > vh * 2) continue;

      // -1 when the element sits one viewport below the fold, +1 when it's
      // scrolled one viewport above it, 0 at centre-of-viewport centred.
      var progress = (rect.top + rect.height / 2 - vh / 2) / vh;
      if (progress < -1) progress = -1;
      if (progress > 1) progress = 1;

      // Travel is bounded by the headroom the scale bought us, so the crop
      // can never slide past the element's own edge.
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
    measure();
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

    // Park the loop once everything has settled. The rects only change on
    // scroll or resize, and both re-arm it via start(), so there is nothing
    // to gain from spinning while the page sits still.
    if (moving) {
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

  // Honour a mid-session change to the OS setting. The global reduced-motion
  // rule in base.css only zeroes CSS durations — it cannot stop the script's
  // style.transform writes, so this branch is the only thing protecting a
  // reduced-motion visitor from movement.
  reduced.addEventListener('change', function () {
    if (reduced.matches) disable();
    else enable();
  });
})();

(function () {
  'use strict';

  /* ==========================================================================
     Accommodations Split-Text Simultaneous Line Reveal
     Dynamically calculates visual line breaks based on rendered layout.
     Wraps each line in an overflow-hidden mask.
     Reveals all lines simultaneously bottom-to-top with clip-path & ease-out.
     Plays once when entering viewport via IntersectionObserver.
     Desktop only (>=1024px).
     ========================================================================== */

  var desktop = window.matchMedia('(min-width: 1024px)');
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  var elements = document.querySelectorAll('.p-villa-slide__title[data-split-reveal], .p-villa-slide__description[data-split-reveal]');
  if (!elements.length) return;

  function prepareWords(text) {
    var words = text.trim().replace(/\s+/g, ' ').split(' ');
    if (words.length > 3) {
      var last = words.pop();
      var secondLast = words.pop();
      words.push(secondLast + '\u00A0' + last);
    }
    return words;
  }

  function revertElement(el) {
    var orig = el.getAttribute('data-split-orig');
    if (orig) {
      el.textContent = orig;
      el.removeAttribute('aria-label');
    }
    el.classList.remove('is-revealed', 'is-recalculating');
  }

  function updateAll() {
    if (!desktop.matches) {
      Array.prototype.forEach.call(elements, revertElement);
      if (window.__tshRefreshVillaLines) window.__tshRefreshVillaLines();
      return;
    }

    var items = [];

    // Phase 1 (Write): inject temporary word spans into all elements
    Array.prototype.forEach.call(elements, function (el) {
      var orig = el.getAttribute('data-split-orig');
      if (!orig) {
        orig = el.textContent.trim().replace(/\s+/g, ' ');
        el.setAttribute('data-split-orig', orig);
      }
      var words = prepareWords(orig);
      if (!words.length || (words.length === 1 && words[0] === '')) return;

      el.innerHTML = words.map(function (word) {
        return '<span class="c-split-word" style="display:inline-block;">' + word + '</span>';
      }).join(' ');

      items.push({
        el: el,
        orig: orig,
        spans: el.querySelectorAll('.c-split-word'),
        wasRevealed: el.classList.contains('is-revealed')
      });
    });

    // Phase 2 (Read): batch read offsetTop across all elements in one reflow
    for (var i = 0; i < items.length; i++) {
      var item = items[i];
      var lines = [];
      var currentLine = [];
      var currentTop = null;

      for (var j = 0; j < item.spans.length; j++) {
        var span = item.spans[j];
        var top = span.offsetTop;
        if (currentTop === null || Math.abs(top - currentTop) > 4) {
          if (currentLine.length > 0) {
            lines.push(currentLine.join(' '));
          }
          currentLine = [span.textContent];
          currentTop = top;
        } else {
          currentLine.push(span.textContent);
        }
      }
      if (currentLine.length > 0) {
        lines.push(currentLine.join(' '));
      }
      item.lines = lines;
    }

    // Phase 3 (Write): build and commit masked lines DOM for all elements
    for (var k = 0; k < items.length; k++) {
      var it = items[k];
      var html = '<span class="c-split-lines" aria-hidden="true">';
      for (var m = 0; m < it.lines.length; m++) {
        html += '<span class="c-split-line-mask">' +
                '<span class="c-split-line">' + it.lines[m] + '</span>' +
                '</span>';
      }
      html += '</span>';

      it.el.innerHTML = html;
      it.el.setAttribute('aria-label', it.orig);

      if (it.wasRevealed) {
        it.el.classList.add('is-revealed', 'is-recalculating');
        void it.el.offsetHeight;
        it.el.classList.remove('is-recalculating');
      }
    }

    // Phase 4: refresh cached line references in villa slider
    if (window.__tshRefreshVillaLines) {
      window.__tshRefreshVillaLines();
    }
  }

  // Viewport intersection observer: reveals lines once when in view
  var observer = null;
  if ('IntersectionObserver' in window) {
    observer = new IntersectionObserver(
      function (entries, obs) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-revealed');
            obs.unobserve(entry.target);
          }
        });
      },
      {
        root: null,
        rootMargin: '0px 0px -60px 0px',
        threshold: 0.1
      }
    );
  }

  function observeAll() {
    if (!observer) {
      // Fallback: reveal immediately if IntersectionObserver not supported
      Array.prototype.forEach.call(elements, function (el) {
        el.classList.add('is-revealed');
      });
      return;
    }

    Array.prototype.forEach.call(elements, function (el) {
      if (!el.classList.contains('is-revealed')) {
        observer.observe(el);
      }
    });
  }

  function init() {
    if (desktop.matches) {
      updateAll();
      observeAll();
    }
  }

  // Ensure custom typography is loaded before initial line measuring
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(init);
  } else {
    window.addEventListener('load', init);
  }

  // Responsive recalculation: re-split when desktop viewport width changes
  var resizeTimeout;
  var lastWidth = window.innerWidth;

  window.addEventListener('resize', function () {
    if (window.innerWidth === lastWidth) return;
    lastWidth = window.innerWidth;
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(function () {
      if (desktop.matches) {
        updateAll();
        observeAll();
      } else {
        Array.prototype.forEach.call(elements, function (el) {
          revertElement(el);
        });
      }
    }, 120);
  });

  desktop.addEventListener('change', function () {
    if (desktop.matches) {
      updateAll();
      observeAll();
    } else {
      Array.prototype.forEach.call(elements, function (el) {
        revertElement(el);
      });
    }
  });

  if (reduced.matches) {
    Array.prototype.forEach.call(elements, function (el) {
      el.classList.add('is-revealed');
    });
  }
})();

