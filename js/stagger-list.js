/* stagger-list.js — motion-anything recipe · category: entrance · target: list
 *
 * Staggers the direct children of every [data-stagger] container in on load.
 * Delays come from CSS :nth-child rules (no element.style — strict CSP).
 * Honors prefers-reduced-motion.
 */
(function () {
  'use strict';
  function init() {
    var lists = document.querySelectorAll('[data-stagger]');
    if (!lists.length) return;
    var reduce = window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) {
      lists.forEach(function (l) { l.classList.add('is-in'); });
      return;
    }
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        lists.forEach(function (l) { l.classList.add('is-in'); });
      });
    });
  }
  if (document.readyState !== 'loading') init();
  else document.addEventListener('DOMContentLoaded', init);
})();
