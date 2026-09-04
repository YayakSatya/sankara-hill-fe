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
      // Ignore sub-pixel jitter; hide only after leaving the very top.
      if (y < lastY - 4 || y < 80) navbar.classList.remove('is-hidden');
      else if (y > lastY + 4) navbar.classList.add('is-hidden');
      lastY = y;
    }

    function schedule() {
      if (queued) return;
      queued = true;
      window.requestAnimationFrame(update);
    }

    window.addEventListener('scroll', schedule, { passive: true });
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
  var queued = false;

  // Cross-fade: only the active index is opaque. The fade duration lives in
  // CSS so the two never disagree.
  function setActive(index) {
    Array.prototype.forEach.call(slides, function (slide, i) {
      slide.classList.toggle('is-active', i === index);
      slide.setAttribute('aria-hidden', String(i !== index));
    });
  }

  function update() {
    queued = false;

    if (!desktop.matches) {
      // Stacked layout — every villa visible, no aria-hidden.
      Array.prototype.forEach.call(slides, function (slide) {
        slide.classList.remove('is-active');
        slide.removeAttribute('aria-hidden');
      });
      return;
    }

    var rect = pin.getBoundingClientRect();
    // The cards row is sticky; the header above it scrolls away first, so
    // the swap window starts only once the row reaches the top. Use the
    // header's rendered height directly — row.offsetTop is unreliable on a
    // position:sticky element (some browsers report its stuck offset, which
    // grows as the page scrolls, instead of its static flow position).
    var offset = header ? header.offsetHeight : 0;
    // Scrollable distance while the cards row stays stuck.
    var travel = rect.height - window.innerHeight - offset;
    var progress = travel > 0 ? (-rect.top - offset) / travel : 0;
    progress = Math.min(Math.max(progress, 0), 0.9999);

    // Equal dwell per villa: progress 0..1 splits into `slides.length` even
    // zones, each showing one villa.
    setActive(Math.floor(progress * slides.length));
  }

  function schedule() {
    if (queued) return;
    queued = true;
    window.requestAnimationFrame(update);
  }

  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule);
  desktop.addEventListener('change', schedule);
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
