/* ==========================================================================
   Sankara Hill — Smooth Scrolling Engine
   Uses Lenis for inertial/momentum smooth wheel physics and synchronized
   anchor jumps with dynamic navbar offset.
   Progressive enhancement: gracefully falls back to native CSS smooth scroll.
   ========================================================================== */

(function () {
  'use strict';

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)');

  function getNavOffset() {
    var nav = document.querySelector('.c-navbar');
    return nav ? -nav.offsetHeight : -80;
  }

  function setupAnchorLinks(instance) {
    document.addEventListener('click', function (e) {
      var anchor = e.target.closest('a[href^="#"]');
      if (!anchor) return;

      var href = anchor.getAttribute('href');
      if (!href || href === '#' || href.length <= 1) return;

      // Skip internal SVG icons or non-element targets
      var target = document.querySelector(href);
      if (!target) return;

      e.preventDefault();

      if (instance && !reduced.matches) {
        instance.scrollTo(target, {
          offset: getNavOffset(),
          duration: 1.2
        });
      } else {
        target.scrollIntoView({ behavior: reduced.matches ? 'auto' : 'smooth' });
      }

      // Close mobile navbar if open
      var nav = document.querySelector('.c-navbar');
      if (nav && nav.getAttribute('data-nav-open') === 'true') {
        nav.setAttribute('data-nav-open', 'false');
        var toggle = nav.querySelector('.c-navbar__toggle');
        if (toggle) toggle.setAttribute('aria-expanded', 'false');
      }

      // Update URL hash quietly without jumping
      if (history.pushState) {
        history.pushState(null, '', href);
      }
    });
  }

  if (!window.Lenis || reduced.matches) {
    setupAnchorLinks(null);
    return;
  }

  var lenis = new Lenis({
    duration: 1.15,
    easing: function (t) {
      return Math.min(1, 1.001 - Math.pow(2, -10 * t));
    },
    orientation: 'vertical',
    gestureOrientation: 'vertical',
    smoothWheel: true,
    wheelMultiplier: 1.0,
    touchMultiplier: 1.2,
    infinite: false
  });

  window.lenis = lenis;
  lenis.scrollTo(0, { immediate: true });

  function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);

  setupAnchorLinks(lenis);

  reduced.addEventListener('change', function () {
    if (reduced.matches) {
      lenis.destroy();
    } else {
      location.reload();
    }
  });
})();
