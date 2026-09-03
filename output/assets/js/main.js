/* ==========================================================================
   Sankara Hill — global interactive components
   Vanilla JS only. Progressive enhancement: with JS disabled the navbar
   keeps its desktop layout on desktop; on mobile the panel simply stays
   collapsed rather than breaking the page.
   ========================================================================== */

(function () {
  'use strict';

  var nav = document.querySelector('.c-navbar');
  if (!nav) return;

  var toggle = nav.querySelector('.c-navbar__toggle');
  if (!toggle) return;

  function setOpen(open) {
    nav.setAttribute('data-nav-open', String(open));
    toggle.setAttribute('aria-expanded', String(open));
  }

  toggle.addEventListener('click', function () {
    setOpen(nav.getAttribute('data-nav-open') !== 'true');
  });

  // Close on Escape, and when a link inside the panel is followed.
  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && nav.getAttribute('data-nav-open') === 'true') {
      setOpen(false);
      toggle.focus();
    }
  });

  nav.addEventListener('click', function (event) {
    if (event.target.closest('.c-navbar__link')) setOpen(false);
  });

  // Language switcher: visual state only — wire to real i18n when available.
  var langOptions = nav.querySelectorAll('.c-navbar__lang-option');
  Array.prototype.forEach.call(langOptions, function (option) {
    option.addEventListener('click', function () {
      Array.prototype.forEach.call(langOptions, function (other) {
        other.setAttribute('aria-current', String(other === option));
      });
    });
  });
})();
