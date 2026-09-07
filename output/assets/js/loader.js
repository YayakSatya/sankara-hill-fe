/* ==========================================================================
   Sankara Hill — Editorial 3:4 Bottom-to-Top Clip-Path Reveal Loader
   Sequential image unmasking & continuous hero scale transition
   ========================================================================== */

(function () {
  'use strict';

  var loader = document.getElementById('loader');
  if (!loader) return;

  // Active on every load during development / review so user can always see it
  // (Optional production override: add ?skip=1 in URL if needed to bypass)
  var urlParams = new URLSearchParams(window.location.search);
  if (urlParams.has('skip')) {
    loader.classList.add('is-done');
    if (loader.parentNode) loader.parentNode.removeChild(loader);
    return;
  }

  // Check reduced motion
  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Lock scroll restoration and force top scroll during animation
  if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
  }
  document.body.classList.add('is-loading');
  document.body.style.overflow = 'hidden';
  window.scrollTo(0, 0);

  // Stop Lenis if it's already running or when it boots
  if (window.lenis && typeof window.lenis.stop === 'function') {
    window.lenis.stop();
  } else {
    var checkLenisInterval = setInterval(function () {
      if (window.lenis && typeof window.lenis.stop === 'function') {
        if (document.body.classList.contains('is-loading')) {
          window.lenis.stop();
        }
        clearInterval(checkLenisInterval);
      }
    }, 50);
  }

  var slides = Array.prototype.slice.call(loader.querySelectorAll('.c-loader__slide'));
  var finalSlide = document.getElementById('loader-hero-slide') || slides[slides.length - 1];

  function finishLoader() {
    document.body.classList.remove('is-loading', 'is-loader-revealing');
    document.body.style.overflow = '';
    loader.classList.add('is-done');
    if (loader.parentNode) {
      loader.parentNode.removeChild(loader);
    }
    window.scrollTo(0, 0);
    if (window.lenis && typeof window.lenis.start === 'function') {
      if (typeof window.lenis.scrollTo === 'function') {
        window.lenis.scrollTo(0, { immediate: true });
      }
      window.lenis.start();
    }
    window.dispatchEvent(new Event('resize'));
    window.dispatchEvent(new Event('scroll'));
  }

  if (reducedMotion) {
    loader.style.transition = 'opacity 0.3s ease';
    loader.style.opacity = '0';
    setTimeout(finishLoader, 300);
    return;
  }

  var hasStarted = false;

  function startOrchestration() {
    if (hasStarted) return;
    hasStarted = true;

    // Sequence:
    // Step 1: Start with empty image area (initial state).
    // Calm luxury sequence — clean cadence without overlapping GPU rasterization
    var revealDuration = 600; // ms for bottom-to-top clip-path unmasking
    var stepInterval = 650;   // ms between slide reveals (allows previous to finish cleanly)
    var initialDelay = 150;   // ms pause before first reveal

    slides.forEach(function (slide, index) {
      setTimeout(function () {
        slide.classList.add('is-revealed');
      }, initialDelay + index * stepInterval);
    });

    // Hold serene moment on final hero portrait before expansion
    var finalFullyRevealedTime = initialDelay + (slides.length - 1) * stepInterval + revealDuration;
    var pauseAfterFinal = 420;
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

    // Guarantee scroll is strictly 0,0 before computing bounds
    window.scrollTo(0, 0);
    if (window.lenis && typeof window.lenis.scrollTo === 'function') {
      window.lenis.scrollTo(0, { immediate: true });
    }

    var slideRect = finalSlide.getBoundingClientRect();
    var heroRect = hero.getBoundingClientRect();

    var heroW = heroRect.width;
    var heroH = heroRect.height;
    var slideW = slideRect.width;
    var slideH = slideRect.height;

    // Preserve true aspect ratio with uniform scale (zero stretching or distortion)
    var s = Math.max(slideW / heroW, slideH / heroH);

    // Center offsets from hero center to initial slide center
    var slideCenterX = slideRect.left + slideW / 2;
    var slideCenterY = slideRect.top + slideH / 2;
    var heroCenterX = heroRect.left + heroW / 2;
    var heroCenterY = heroRect.top + heroH / 2;

    var translateX = slideCenterX - heroCenterX;
    var translateY = slideCenterY - heroCenterY;

    // Aperture crop in unscaled hero coordinates so visible box equals slideRect exactly
    var visibleW = slideW / s;
    var visibleH = slideH / s;
    var insetX = Math.max(0, (heroW - visibleW) / 2);
    var insetY = Math.max(0, (heroH - visibleH) / 2);

    // CRITICAL: Disable transitions during initial positioning to eliminate animation collision / 1-frame hitch
    finalSlide.style.transition = 'none';
    finalSlide.style.position = 'fixed';
    finalSlide.style.top = heroRect.top + 'px';
    finalSlide.style.left = heroRect.left + 'px';
    finalSlide.style.width = heroW + 'px';
    finalSlide.style.height = heroH + 'px';
    finalSlide.style.margin = '0';
    finalSlide.style.zIndex = '10002';
    finalSlide.style.transformOrigin = 'center center';
    finalSlide.style.clipPath = 'inset(' + insetY.toFixed(2) + 'px ' + insetX.toFixed(2) + 'px ' + insetY.toFixed(2) + 'px ' + insetX.toFixed(2) + 'px)';
    finalSlide.style.transform = 'translate3d(' + translateX.toFixed(2) + 'px, ' + translateY.toFixed(2) + 'px, 0) scale(' + s.toFixed(5) + ')';

    // Force layout flush so initial geometry is fully committed before transition starts
    void finalSlide.offsetHeight;

    // Trigger reveal classes: scrim dissolves, hero and navbar fade in
    loader.classList.add('is-morphing');
    document.body.classList.add('is-loader-revealing');

    // Double requestAnimationFrame ensures browser commits initial frame before starting 1.4s expansion
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        finalSlide.style.transition = ''; // restore CSS transitions
        finalSlide.classList.add('is-expanding');
        finalSlide.style.clipPath = 'inset(0px 0px 0px 0px)';
        finalSlide.style.transform = 'translate3d(0, 0, 0) scale(1)';

        var overlay = finalSlide.querySelector('.c-loader__slide-overlay');
        if (overlay) {
          overlay.style.opacity = '1';
        }
      });
    });

    // When scale transition completes (1400ms duration + buffer for content entrance)
    setTimeout(function () {
      finishLoader();
    }, 2400);
  }

  // Kick off orchestration promptly
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      requestAnimationFrame(startOrchestration);
    });
  } else {
    requestAnimationFrame(startOrchestration);
  }

})();
