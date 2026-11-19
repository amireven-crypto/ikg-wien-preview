/*! A11y menu v1.0 (18 Nov 2026) — self-made, free, no dependencies, no tracking.
   One file shared by all PIXELPOP demo sites. Settings live only in this browser (localStorage).
   Load it in <head> (not deferred) so saved settings apply before the first paint:
   <script src="a11y/a11y.js?v=..." data-site="pixelpop" data-statement="accessibility.html"></script>
   Optional: data-statement-de|en|he|ru (per-language statement URL), data-pos="left|right",
   data-mount="CSS selector" (put the button into the header instead of floating), data-reload="0". */
(function () {
  'use strict';
  var doc = document, root = doc.documentElement, W = window;
  var me = doc.currentScript || {};
  function cfg(n, d) { var v = me.getAttribute && me.getAttribute('data-' + n); return v == null || v === '' ? d : v; }
  var SITE = cfg('site', 'site'), KEY = 'a11y:' + SITE, POS = cfg('pos', 'left');
  var STEPS = [1, 1.15, 1.3, 1.5];
  var NOSCALE = cfg('noscale', '.logo, .wordmark, [data-a11y-noscale]');
  var OPTS = ['contrast', 'gray', 'links', 'font', 'spacing', 'still', 'cursor', 'focus'];

  var T = {
    en: { fab: 'Accessibility options', title: 'Accessibility', intro: 'Adjust this site to your needs. Your settings are saved in this browser only.', close: 'Close accessibility options', size: 'Text size', smaller: 'Decrease text size', larger: 'Increase text size', contrast: 'High contrast', gray: 'Grayscale', links: 'Highlight links', font: 'Readable font', spacing: 'Text spacing', still: 'Stop animations', cursor: 'Big cursor', focus: 'Highlight focus', reset: 'Reset settings', statement: 'Accessibility statement', on: 'on', off: 'off', resetDone: 'All settings reset' },
    de: { fab: 'Einstellungen zur Barrierefreiheit', title: 'Barrierefreiheit', intro: 'Passen Sie diese Website an Ihre Bedürfnisse an. Die Einstellungen werden nur in diesem Browser gespeichert.', close: 'Einstellungen zur Barrierefreiheit schließen', size: 'Schriftgröße', smaller: 'Schrift verkleinern', larger: 'Schrift vergrößern', contrast: 'Hoher Kontrast', gray: 'Graustufen', links: 'Links hervorheben', font: 'Lesbare Schrift', spacing: 'Textabstand', still: 'Animationen stoppen', cursor: 'Großer Mauszeiger', focus: 'Fokus hervorheben', reset: 'Zurücksetzen', statement: 'Barrierefreiheitserklärung', on: 'ein', off: 'aus', resetDone: 'Alle Einstellungen zurückgesetzt' },
    he: { fab: 'אפשרויות נגישות', title: 'נגישות', intro: 'התאימו את האתר לצרכים שלכם. ההגדרות נשמרות בדפדפן זה בלבד.', close: 'סגירת אפשרויות הנגישות', size: 'גודל טקסט', smaller: 'הקטנת טקסט', larger: 'הגדלת טקסט', contrast: 'ניגודיות גבוהה', gray: 'גווני אפור', links: 'הדגשת קישורים', font: 'גופן קריא', spacing: 'ריווח טקסט', still: 'עצירת אנימציות', cursor: 'סמן עכבר גדול', focus: 'הדגשת מיקוד', reset: 'איפוס הגדרות', statement: 'הצהרת נגישות', on: 'פעיל', off: 'כבוי', resetDone: 'כל ההגדרות אופסו' },
    ru: { fab: 'Настройки доступности', title: 'Доступность', intro: 'Настройте сайт под свои потребности. Настройки сохраняются только в этом браузере.', close: 'Закрыть настройки доступности', size: 'Размер текста', smaller: 'Уменьшить текст', larger: 'Увеличить текст', contrast: 'Высокий контраст', gray: 'Оттенки серого', links: 'Выделить ссылки', font: 'Удобочитаемый шрифт', spacing: 'Интервалы текста', still: 'Остановить анимацию', cursor: 'Крупный курсор', focus: 'Выделять фокус', reset: 'Сбросить настройки', statement: 'Заявление о доступности', on: 'вкл.', off: 'выкл.', resetDone: 'Все настройки сброшены' }
  };
  function lang() { var l = (root.getAttribute('lang') || 'en').slice(0, 2).toLowerCase(); return T[l] ? l : 'en'; }
  function t(k) { return T[lang()][k] || T.en[k]; }

  /* ---------- settings ---------- */
  var P = {};
  try { P = JSON.parse(localStorage.getItem(KEY) || '{}') || {}; } catch (e) { P = {}; }
  if (SITE === 'ikg' && P.fs == null) { /* old A−/A+ header control */
    try { var old = localStorage.getItem('ikg-demo-text-size'); if (old === 'lg') P.fs = 1; if (old === 'xl') P.fs = 2; localStorage.removeItem('ikg-demo-text-size'); } catch (e) {}
  }
  var osReduce = false;
  try { osReduce = W.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {}
  if (P.still == null && osReduce) P.still = true;
  P.fs = Math.max(0, Math.min(STEPS.length - 1, parseInt(P.fs, 10) || 0));
  function save() { try { localStorage.setItem(KEY, JSON.stringify(P)); } catch (e) {} }

  /* Sites read prefers-reduced-motion when they start; report "reduce" when the visitor stopped animations here. */
  if (W.matchMedia) {
    var mm = W.matchMedia.bind(W);
    W.matchMedia = function (q) {
      if (P.still && /prefers-reduced-motion/.test(q)) return mm(/no-preference/.test(q) ? 'not all' : 'all');
      return mm(q);
    };
  }
  function classes() {
    OPTS.forEach(function (k) { root.classList.toggle('a11y-' + k, !!P[k]); });
    root.classList.toggle('a11y-fs', P.fs > 0);
  }
  root.setAttribute('data-a11y-site', SITE);
  classes();

  /* ---------- text size: scale each element's own computed size, so px, rem and clamp() all grow ---------- */
  var touched = [], scaled = 0, ui = null;
  function restore() {
    for (var i = 0; i < touched.length; i++) {
      var o = touched[i], s = o.el.style;
      s.removeProperty('font-size'); s.removeProperty('line-height');
      if (o.fs) s.setProperty('font-size', o.fs, o.fsp);
      if (o.lh) s.setProperty('line-height', o.lh, o.lhp);
    }
    touched = []; scaled = 0;
  }
  function scaleText() {
    restore();
    var f = STEPS[P.fs];
    if (f === 1 || !doc.body) return;
    var els = doc.body.getElementsByTagName('*'), list = [], i, el, cs;
    for (i = 0; i < els.length; i++) {
      el = els[i];
      if (el.namespaceURI !== 'http://www.w3.org/1999/xhtml') continue;
      if (/^(SCRIPT|STYLE|NOSCRIPT|TEMPLATE|BR|IMG|VIDEO|CANVAS|IFRAME|PICTURE|SOURCE)$/.test(el.tagName)) continue;
      if (ui && ui.contains(el)) continue;
      if (NOSCALE && el.closest(NOSCALE)) continue;
      cs = getComputedStyle(el);
      list.push([el, parseFloat(cs.fontSize), cs.lineHeight]);
    }
    var keepLh = !P.spacing;
    for (i = 0; i < list.length; i++) {
      el = list[i][0]; var s = el.style, px = list[i][1], lh = list[i][2];
      if (!px) continue;
      touched.push({ el: el, fs: s.getPropertyValue('font-size'), fsp: s.getPropertyPriority('font-size'), lh: s.getPropertyValue('line-height'), lhp: s.getPropertyPriority('line-height') });
      s.setProperty('font-size', (px * f).toFixed(2) + 'px', 'important');
      if (keepLh && lh && lh !== 'normal' && /px$/.test(lh)) s.setProperty('line-height', (parseFloat(lh) / px).toFixed(3), 'important');
    }
    scaled = f;
  }
  var mo = null, tmr = 0, lastW = 0;
  function later() { clearTimeout(tmr); tmr = setTimeout(function () { if (P.fs > 0) scaleText(); }, 350); }
  function watch() {
    if (mo || !W.MutationObserver) return;
    mo = new MutationObserver(function (recs) {
      if (!(P.fs > 0)) return;
      for (var i = 0; i < recs.length; i++) {
        var a = recs[i].addedNodes;
        for (var j = 0; j < a.length; j++) if (a[j].nodeType === 1 && !(ui && ui.contains(a[j]))) { later(); return; }
      }
    });
    mo.observe(doc.body, { childList: true, subtree: true });
    lastW = W.innerWidth;
    W.addEventListener('resize', function () { if (W.innerWidth !== lastW) { lastW = W.innerWidth; if (P.fs > 0) later(); } });
  }

  /* ---------- stop animations ---------- */
  function stillNow() {
    if (!P.still) return;
    try {
      (doc.getAnimations ? doc.getAnimations() : []).forEach(function (a) {
        if (ui && a.effect && a.effect.target && ui.contains(a.effect.target)) return;
        try { a.finish(); } catch (e) { try { a.pause(); } catch (e2) {} }
      });
    } catch (e) {}
    var v = doc.getElementsByTagName('video');
    for (var i = 0; i < v.length; i++) { if (!v[i].controls) { v[i].autoplay = false; try { v[i].pause(); } catch (e) {} } }
  }
  doc.addEventListener('play', function (e) { if (P.still && e.target && e.target.tagName === 'VIDEO' && !e.target.controls) e.target.pause(); }, true);
  var stillT = 0;
  W.addEventListener('scroll', function () { if (P.still && !stillT) stillT = setTimeout(function () { stillT = 0; stillNow(); }, 400); }, { passive: true });

  /* ---------- UI ---------- */
  var ICON = {
    fab: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><circle cx="12" cy="4.2" r="2.2"/><path d="M4.2 7.6c2.6.8 5.2 1.2 7.8 1.2s5.2-.4 7.8-1.2l.6 1.9c-2 .7-4.1 1.1-6.2 1.3v3.3l2.2 7.6-1.9.6L12 15.2l-2.5 7.1-1.9-.6 2.2-7.6v-3.3c-2.1-.2-4.2-.6-6.2-1.3z"/></svg>',
    x: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M6.4 5 12 10.6 17.6 5 19 6.4 13.4 12l5.6 5.6-1.4 1.4-5.6-5.6L6.4 19 5 17.6l5.6-5.6L5 6.4z"/></svg>',
    contrast: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm0 2v16a8 8 0 0 1 0-16z"/></svg>',
    gray: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 2.5S5 10 5 14.5a7 7 0 0 0 14 0C19 10 12 2.5 12 2.5zm0 3.1c1.9 2.3 5 6.4 5 8.9a5 5 0 0 1-5 5z"/></svg>',
    links: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M10.6 13.4a1 1 0 0 1 0-1.4l3.5-3.5a1 1 0 1 1 1.4 1.4L12 13.4a1 1 0 0 1-1.4 0zM8.5 11 6.4 13.1a3 3 0 0 0 4.2 4.3l2.1-2.1 1.4 1.4-2.1 2.1a5 5 0 0 1-7-7.1L7.1 9.6zm7-1.9 2.1-2.1a3 3 0 0 0-4.2-4.2l-2.1 2-1.4-1.4L12 1.4a5 5 0 0 1 7 7.1l-2.1 2.1zM3 21h18v2H3z"/></svg>',
    font: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M9.2 3h2.6l6 16h-2.3l-1.6-4.4H7.1L5.5 19H3.2zm-1.4 9.6h5.4L10.5 5.2z"/><path d="M19 13h2v8h-2z"/></svg>',
    spacing: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M3 4h18v2H3zm0 7h18v2H3zm0 7h18v2H3z"/><path d="M1 8.5 4 11l-3 2.5zm22 0L20 11l3 2.5z"/></svg>',
    still: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm0 2a8 8 0 1 1 0 16 8 8 0 0 1 0-16zM9 8h2v8H9zm4 0h2v8h-2z"/></svg>',
    cursor: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M5 2l14 10.5-6.2.9 3.6 7.3-2.8 1.3-3.5-7.3L5 19z"/></svg>',
    focus: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M3 3h6v2H5v4H3zm12 0h6v6h-2V5h-4zM3 15h2v4h4v2H3zm16 0h2v6h-6v-2h4z"/><rect x="8" y="8" width="8" height="8" rx="1.5"/></svg>',
    reset: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 4a8 8 0 1 1-7.7 10h2.1A6 6 0 1 0 12 6v3L7.5 5 12 1z"/></svg>'
  };
  var fab, dlg, live, sizeOut, sizeDown, sizeUp, link, uid = 'a11y-panel';
  function statementUrl() { return cfg('statement-' + lang(), cfg('statement', '')); }
  function build() {
    ui = doc.createElement('div');
    ui.className = 'a11y-ui a11y-pos-' + POS;
    ui.setAttribute('translate', 'no');
    ui.setAttribute('data-no-i18n', '');
    var opts = OPTS.map(function (k) {
      return '<button type="button" class="a11y-opt a11y-opt-' + k + '" data-a11y="' + k + '" aria-pressed="false">' + ICON[k] + '<span class="a11y-opt-l"></span></button>';
    }).join('');
    ui.innerHTML =
      '<button type="button" class="a11y-fab" aria-haspopup="dialog" aria-expanded="false" aria-controls="' + uid + '">' + ICON.fab + '<span class="a11y-sr a11y-fab-l"></span></button>' +
      '<dialog class="a11y-panel" id="' + uid + '" aria-labelledby="a11y-title" aria-describedby="a11y-intro">' +
        '<div class="a11y-head"><h2 class="a11y-title" id="a11y-title"></h2><button type="button" class="a11y-x">' + ICON.x + '<span class="a11y-sr a11y-x-l"></span></button></div>' +
        '<p class="a11y-intro" id="a11y-intro"></p>' +
        '<div class="a11y-size" role="group" aria-labelledby="a11y-size-l"><span class="a11y-size-l" id="a11y-size-l"></span>' +
          '<span class="a11y-size-ctl"><button type="button" class="a11y-step" data-step="-1"><span aria-hidden="true">A−</span><span class="a11y-sr a11y-down-l"></span></button>' +
          '<output class="a11y-size-v" aria-live="polite"></output>' +
          '<button type="button" class="a11y-step" data-step="1"><span aria-hidden="true">A+</span><span class="a11y-sr a11y-up-l"></span></button></span></div>' +
        '<div class="a11y-grid">' + opts + '</div>' +
        '<div class="a11y-foot"><button type="button" class="a11y-reset">' + ICON.reset + '<span class="a11y-reset-l"></span></button><a class="a11y-statement" href="#"></a></div>' +
        '<p class="a11y-sr a11y-live" role="status" aria-live="polite"></p>' +
      '</dialog>';
    var mountSel = cfg('mount', ''), mount = mountSel && doc.querySelector(mountSel);
    fab = ui.querySelector('.a11y-fab'); dlg = ui.querySelector('dialog');
    live = ui.querySelector('.a11y-live'); sizeOut = ui.querySelector('.a11y-size-v');
    sizeDown = ui.querySelector('[data-step="-1"]'); sizeUp = ui.querySelector('[data-step="1"]');
    link = ui.querySelector('.a11y-statement');
    doc.body.appendChild(ui);
    if (mount) { ui.classList.add('a11y-mounted'); fab.classList.add('a11y-inline'); mount.insertBefore(fab, mount.firstChild); }
    texts(); state();
    fab.addEventListener('click', function () { dlg.open ? close() : open(); });
    ui.querySelector('.a11y-x').addEventListener('click', close);
    dlg.addEventListener('cancel', function (e) { e.preventDefault(); close(); });
    dlg.addEventListener('click', function (e) { if (e.target === dlg) close(); }); /* click on the backdrop */
    dlg.addEventListener('keydown', trap);
    ui.querySelector('.a11y-grid').addEventListener('click', function (e) {
      var b = e.target.closest('[data-a11y]'); if (!b) return;
      var k = b.getAttribute('data-a11y'); P[k] = !P[k]; save(); classes(); state();
      if (k === 'spacing' && P.fs > 0) scaleText();
      say(t(k) + ': ' + (P[k] ? t('on') : t('off')));
      if (k === 'still') { if (P.still) stillNow(); reloadForMotion(k); }
    });
    [sizeDown, sizeUp].forEach(function (b) {
      b.addEventListener('click', function () {
        if (b.getAttribute('aria-disabled') === 'true') return;
        P.fs = Math.max(0, Math.min(STEPS.length - 1, P.fs + parseInt(b.getAttribute('data-step'), 10)));
        save(); classes(); scaleText(); state();
      });
    });
    ui.querySelector('.a11y-reset').addEventListener('click', function () {
      var wasStill = !!P.still; P = { fs: 0 }; if (osReduce) P.still = true; save(); classes(); scaleText(); state(); say(t('resetDone'));
      if (wasStill && !P.still) reloadForMotion('reset');
    });
    if (W.MutationObserver) new MutationObserver(function () { texts(); }).observe(root, { attributes: true, attributeFilter: ['lang'] });
    try { var back = sessionStorage.getItem('a11y-reopen'); if (back) { sessionStorage.removeItem('a11y-reopen'); open(back); } } catch (e) {}
  }
  function texts() {
    var l = lang(), rtl = l === 'he';
    ui.setAttribute('lang', l); dlg.setAttribute('dir', rtl ? 'rtl' : 'ltr');
    fab.setAttribute('aria-label', t('fab')); fab.setAttribute('title', t('fab'));
    fab.querySelector('.a11y-fab-l').textContent = t('fab');
    ui.querySelector('.a11y-title').textContent = t('title');
    ui.querySelector('.a11y-intro').textContent = t('intro');
    var x = ui.querySelector('.a11y-x'); x.setAttribute('aria-label', t('close')); x.setAttribute('title', t('close'));
    ui.querySelector('.a11y-size-l').textContent = t('size');
    sizeDown.setAttribute('title', t('smaller')); sizeDown.querySelector('.a11y-down-l').textContent = t('smaller');
    sizeUp.setAttribute('title', t('larger')); sizeUp.querySelector('.a11y-up-l').textContent = t('larger');
    OPTS.forEach(function (k) { ui.querySelector('.a11y-opt-' + k + ' .a11y-opt-l').textContent = t(k); });
    ui.querySelector('.a11y-reset-l').textContent = t('reset');
    var u = statementUrl();
    link.textContent = t('statement'); link.hidden = !u; if (u) link.setAttribute('href', u);
    state();
  }
  function pct() { var n = Math.round(STEPS[P.fs] * 100); return lang() === 'de' ? n + '\u00a0%' : n + '%'; }
  function state() {
    if (!ui) return;
    OPTS.forEach(function (k) { ui.querySelector('.a11y-opt-' + k).setAttribute('aria-pressed', P[k] ? 'true' : 'false'); });
    sizeOut.textContent = pct();
    sizeDown.setAttribute('aria-disabled', P.fs === 0 ? 'true' : 'false');
    sizeUp.setAttribute('aria-disabled', P.fs === STEPS.length - 1 ? 'true' : 'false');
    fab.classList.toggle('a11y-active', P.fs > 0 || OPTS.some(function (k) { return P[k]; }));
  }
  function say(m) { live.textContent = ''; setTimeout(function () { live.textContent = m; }, 30); }
  function focusables() {
    return [].slice.call(dlg.querySelectorAll('button,a[href]:not([hidden])')).filter(function (e) { return !e.hidden && e.offsetParent !== null; });
  }
  function trap(e) {
    if (e.key === 'Escape') { e.preventDefault(); close(); return; }
    if (e.key !== 'Tab') return;
    var f = focusables(); if (!f.length) return;
    var first = f[0], last = f[f.length - 1];
    if (e.shiftKey && doc.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && doc.activeElement === last) { e.preventDefault(); first.focus(); }
  }
  function open(focusKey) {
    if (dlg.open) return;
    if (dlg.showModal) { try { dlg.showModal(); } catch (e) { dlg.setAttribute('open', ''); } } else { dlg.setAttribute('open', ''); ui.classList.add('a11y-nomodal'); }
    fab.setAttribute('aria-expanded', 'true');
    var target = focusKey && ui.querySelector('[data-a11y="' + focusKey + '"]') || (focusKey === 'reset' && ui.querySelector('.a11y-reset')) || ui.querySelector('.a11y-x');
    setTimeout(function () { target.focus(); }, 0);
    doc.addEventListener('keydown', escAny, true);
  }
  function escAny(e) { if (e.key === 'Escape' && dlg.open) { e.preventDefault(); close(); } }
  function close() {
    if (!dlg.open) return;
    if (dlg.close) dlg.close(); else dlg.removeAttribute('open');
    dlg.removeAttribute('open');
    fab.setAttribute('aria-expanded', 'false');
    doc.removeEventListener('keydown', escAny, true);
    fab.focus();
  }
  /* Scripted effects (scroll smoothing, 3D, counters) read the motion setting when the page starts. */
  function reloadForMotion(k) {
    if (cfg('reload', '1') === '0') return;
    var typed = [].some.call(doc.querySelectorAll('input,textarea'), function (i) { return i.type !== 'hidden' && i.type !== 'checkbox' && i.type !== 'radio' && i.value !== i.defaultValue; });
    if (typed) return;
    try { sessionStorage.setItem('a11y-reopen', k); } catch (e) {}
    setTimeout(function () { location.reload(); }, 450);
  }
  /* keep the button clear of the site's own fixed bottom bars (data-avoid="selector") */
  var AVOID = cfg('avoid', ''), lastDodge = '';
  function dodge() {
    if (!AVOID || !ui || ui.classList.contains('a11y-mounted')) return;
    var h = 0, vh = W.innerHeight;
    [].forEach.call(doc.querySelectorAll(AVOID), function (e) {
      var cs = getComputedStyle(e), r = e.getBoundingClientRect();
      if (cs.position === 'fixed' && cs.display !== 'none' && cs.visibility !== 'hidden' && r.height > 0 && r.top > vh * 0.5 && r.top < vh) h = Math.max(h, vh - r.top);
    });
    var v = h ? Math.ceil(h + 12) + 'px' : '';
    if (v === lastDodge) return; lastDodge = v;
    [ui, fab].forEach(function (n) { if (v) n.style.setProperty('--a11y-bottom', v); else n.style.removeProperty('--a11y-bottom'); });
  }
  function start() {
    build(); watch();
    if (AVOID) { dodge(); W.addEventListener('resize', dodge); W.addEventListener('load', dodge); setInterval(dodge, 1000); }
    if (P.fs > 0) scaleText();
    if (P.still) stillNow();
    W.addEventListener('load', function () { if (P.fs > 0) later(); if (P.still) stillNow(); });
  }
  if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', start); else start();
  W.A11yMenu = { open: function () { open(); }, close: close, prefs: function () { return JSON.parse(JSON.stringify(P)); } };
})();
