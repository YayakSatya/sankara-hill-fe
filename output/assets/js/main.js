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

  // Scrollspy: synchronize navbar active link with current section in view
  var navLinks = Array.prototype.slice.call(nav.querySelectorAll('.c-navbar__link'));
  if (navLinks.length > 0) {
    var linkMap = [];
    navLinks.forEach(function (link) {
      var href = link.getAttribute('href');
      if (href && href.charAt(0) === '#' && href.length > 1) {
        var target = document.querySelector(href);
        if (target) {
          linkMap.push({
            link: link,
            section: target,
            id: href.slice(1),
            aliasSection: href === '#contact' ? document.getElementById('reservations') : null
          });
        }
      }
    });

    var lockUntil = 0;

    function setActive(activeLink) {
      navLinks.forEach(function (link) {
        if (link === activeLink) {
          link.setAttribute('aria-current', 'page');
        } else {
          link.removeAttribute('aria-current');
        }
      });
    }

    // Instant visual update on click, locked during smooth scroll transition
    navLinks.forEach(function (link) {
      link.addEventListener('click', function () {
        setActive(link);
        lockUntil = Date.now() + 1300;
      });
    });

    // Release click lock immediately if user manually wheels or touches
    window.addEventListener('wheel', function () { lockUntil = 0; }, { passive: true });
    window.addEventListener('touchmove', function () { lockUntil = 0; }, { passive: true });

    var ticking = false;

    function updateScrollspy() {
      if (Date.now() < lockUntil) return;
      if (linkMap.length === 0) return;

      var scrollY = window.scrollY || window.pageYOffset || 0;
      var windowHeight = window.innerHeight;
      var docHeight = document.documentElement.scrollHeight;
      var navHeight = nav.offsetHeight || 80;

      // Bottom edge: near document end -> activate last link (Contact)
      if (scrollY + windowHeight >= docHeight - 50) {
        setActive(linkMap[linkMap.length - 1].link);
        return;
      }

      // Top edge: at or near page top -> activate first link (About)
      if (scrollY < 80) {
        setActive(linkMap[0].link);
        return;
      }

      var checkLine = navHeight + 80;
      var currentMatch = null;

      for (var i = 0; i < linkMap.length; i++) {
        var item = linkMap[i];
        var rect = item.section.getBoundingClientRect();
        var top = item.aliasSection ? item.aliasSection.getBoundingClientRect().top : rect.top;
        var bottom = rect.bottom;

        if (top <= checkLine && bottom > checkLine) {
          currentMatch = item;
          break;
        }
      }

      // Fallback: choose last section whose top has crossed checkLine
      if (!currentMatch) {
        for (var j = linkMap.length - 1; j >= 0; j--) {
          var fallbackItem = linkMap[j];
          var fallbackTop = fallbackItem.aliasSection
            ? fallbackItem.aliasSection.getBoundingClientRect().top
            : fallbackItem.section.getBoundingClientRect().top;
          if (fallbackTop <= checkLine) {
            currentMatch = fallbackItem;
            break;
          }
        }
      }

      if (currentMatch) {
        setActive(currentMatch.link);
      }
    }

    function onScroll() {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(function () {
        ticking = false;
        updateScrollspy();
      });
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });

    // Initial check on load
    updateScrollspy();
    window.addEventListener('load', updateScrollspy);
  }

  // Reservation form dates: ensure min date is today and checkout is after checkin
  var checkin = document.getElementById('field-checkin');
  var checkout = document.getElementById('field-checkout');
  if (checkin && checkout) {
    var today = new Date().toISOString().split('T')[0];
    checkin.min = today;
    checkin.addEventListener('change', function () {
      if (checkin.value) {
        checkout.min = checkin.value;
        if (checkout.value && checkout.value <= checkin.value) {
          checkout.value = '';
        }
      }
    });
  }
})();
