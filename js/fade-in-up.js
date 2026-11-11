/* fade-in-up.js — motion-anything recipe · category: entrance
 *
 * Rises + fades [data-fade] elements in on load.
 * Delays come from CSS :nth-child rules (no element.style — strict CSP).
 * Honors prefers-reduced-motion (shows everything immediately).
 */
(function () {
  'use strict';
  function init() {
    var els = document.querySelectorAll('[data-fade]');
    if (!els.length) return;
    var reduce = window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) {
      els.forEach(function (el) { el.classList.add('is-in'); });
      return;
    }
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        els.forEach(function (el) { el.classList.add('is-in'); });
      });
    });
  }
  if (document.readyState !== 'loading') init();
  else document.addEventListener('DOMContentLoaded', init);
})();
