/* Mobile navigation only. Motion is handled by motion-anything recipe scripts. */
(function () {
  'use strict';
  var toggle = document.querySelector('.menu-toggle');
  var panel = document.getElementById('mobile-nav');
  if (!toggle || !panel) return;

  function setOpen(open) {
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    toggle.setAttribute('aria-label', open ? 'Menü schließen' : 'Menü öffnen');
    panel.classList.toggle('is-open', open);
    panel.hidden = !open;
    document.body.classList.toggle('menu-open', open);
  }

  toggle.addEventListener('click', function () {
    setOpen(toggle.getAttribute('aria-expanded') !== 'true');
  });

  panel.querySelectorAll('a').forEach(function (a) {
    a.addEventListener('click', function () { setOpen(false); });
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') setOpen(false);
  });

  setOpen(false);
})();


/* Highlight the section currently in view in the header nav. */
(function () {
  'use strict';
  var links = Array.prototype.slice.call(
    document.querySelectorAll('.nav-desktop a[href^="#"], .nav-mobile a[href^="#"]')
  ).filter(function (a) { return !a.classList.contains('btn'); });
  if (!links.length) return;

  var sections = [];
  links.forEach(function (a) {
    var id = a.getAttribute('href').slice(1);
    var el = document.getElementById(id);
    if (el && sections.indexOf(el) === -1) sections.push(el);
  });
  if (!sections.length) return;

  function setActive(id) {
    links.forEach(function (a) {
      a.classList.toggle('is-active', !!id && a.getAttribute('href') === '#' + id);
    });
  }

  if (!('IntersectionObserver' in window)) return;

  var visible = {};
  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) visible[entry.target.id] = true;
      else delete visible[entry.target.id];
    });
    var current = null;
    var best = Infinity;
    sections.forEach(function (section) {
      if (!visible[section.id]) return;
      var top = Math.abs(section.getBoundingClientRect().top);
      if (top < best) { best = top; current = section.id; }
    });
    setActive(current);
  }, { rootMargin: '-25% 0px -55% 0px', threshold: 0 });

  sections.forEach(function (section) { observer.observe(section); });
})();


/* Hero background video: pause/play toggle and reduced-motion. */
(function () {
  'use strict';
  var video = document.getElementById('hero-video');
  var btn = document.querySelector('.hero-media-toggle');
  if (!video || !btn) return;

  var iconPause = btn.querySelector('.icon-pause');
  var iconPlay = btn.querySelector('.icon-play');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');

  function setPlaying(play) {
    if (play) {
      video.classList.add('is-playing');
      video.classList.remove('is-paused');
      var attempt = video.play();
      if (attempt && attempt.catch) {
        attempt.catch(function () { setPlaying(false); });
      }
      btn.setAttribute('aria-pressed', 'true');
      btn.setAttribute('aria-label', 'Video pausieren');
      if (iconPause) iconPause.hidden = false;
      if (iconPlay) iconPlay.hidden = true;
    } else {
      video.pause();
      video.classList.remove('is-playing');
      video.classList.add('is-paused');
      btn.setAttribute('aria-pressed', 'false');
      btn.setAttribute('aria-label', 'Video abspielen');
      if (iconPause) iconPause.hidden = true;
      if (iconPlay) iconPlay.hidden = false;
    }
  }

  function applyMotionPref() {
    setPlaying(!reduce.matches);
  }

  btn.addEventListener('click', function () {
    setPlaying(video.paused);
  });

  video.addEventListener('error', function () {
    setPlaying(false);
    btn.hidden = true;
  });

  if (reduce.addEventListener) reduce.addEventListener('change', applyMotionPref);
  else if (reduce.addListener) reduce.addListener(applyMotionPref);

  if (video.readyState >= 2) applyMotionPref();
  else video.addEventListener('loadeddata', applyMotionPref, { once: true });

  /* If autoplay was blocked, reflect the paused state on the toggle. */
  video.addEventListener('pause', function () {
    if (!video.classList.contains('is-paused') && !document.hidden) {
      /* paused programmatically mid-play only if we called pause */ 
    }
  });
})();


/* Official-menu dropdowns (desktop) and accordions (mobile). */
(function () {
  'use strict';

  function closeAll(except) {
    document.querySelectorAll('.nav-group-toggle[aria-expanded="true"]').forEach(function (btn) {
      if (btn === except) return;
      btn.setAttribute('aria-expanded', 'false');
      var panel = document.getElementById(btn.getAttribute('aria-controls'));
      if (panel) panel.hidden = true;
    });
  }

  document.querySelectorAll('.nav-group-toggle').forEach(function (btn) {
    var panel = document.getElementById(btn.getAttribute('aria-controls'));
    if (!panel) return;
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      var open = btn.getAttribute('aria-expanded') === 'true';
      closeAll();
      if (!open) {
        btn.setAttribute('aria-expanded', 'true');
        panel.hidden = false;
      }
    });
  });

  document.addEventListener('click', function (e) {
    if (!e.target.closest('.nav-group')) closeAll();
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeAll();
  });

  document.querySelectorAll('.nav-acc-toggle').forEach(function (btn) {
    var panel = document.getElementById(btn.getAttribute('aria-controls'));
    if (!panel) return;
    btn.addEventListener('click', function () {
      var open = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', open ? 'false' : 'true');
      panel.hidden = open;
    });
  });


  /* Demo forms never send data */
  document.querySelectorAll("form").forEach(function (f) {
    f.setAttribute("action", "#");
    f.addEventListener("submit", function (e) {
      e.preventDefault();
      e.stopPropagation();
      var n = f.querySelector(".demo-form-note");
      if (n) n.textContent = "Demo – keine Daten werden gesendet";
    });
  });
})();


/* Highlight the current page in the header nav. Classes only (strict CSP). */
(function () {
  'use strict';
  var path = (window.location.pathname || '').replace(/\\/g, '/');
  var parts = path.split('/');
  var file = parts[parts.length - 1] || 'index.html';
  if (!file || file === 'ikg-wien-preview') file = 'index.html';

  var links = document.querySelectorAll('.nav-desktop a[href], .nav-mobile a[href]');
  links.forEach(function (a) {
    if (a.classList.contains('btn') || a.classList.contains('wordmark') || a.closest('.lang-switch')) return;
    var href = (a.getAttribute('href') || '').split('#')[0].split('?')[0];
    if (!href || href.indexOf('mailto:') === 0 || href.indexOf('http') === 0) return;
    var name = href.split('/');
    name = name[name.length - 1];
    if (name && name === file) {
      a.classList.add('is-active');
      a.setAttribute('aria-current', 'page');
      var group = a.closest('.nav-group, .nav-accordion');
      if (group) {
        var btn = group.querySelector('.nav-group-toggle, .nav-acc-toggle');
        if (btn) btn.classList.add('is-active');
      }
    }
  });
})();


/* Text size control. Classes only (strict CSP). Optional local preference. */
(function () {
  'use strict';
  var KEY = 'ikg-demo-text-size';
  var levels = ['md', 'lg', 'xl'];

  function current() {
    var html = document.documentElement;
    var i, level = 'md';
    for (i = 0; i < levels.length; i++) {
      if (html.classList.contains('text-size-' + levels[i])) level = levels[i];
    }
    return level;
  }

  function apply(level) {
    if (levels.indexOf(level) === -1) level = 'md';
    var html = document.documentElement;
    var i;
    for (i = 0; i < levels.length; i++) {
      html.classList.remove('text-size-' + levels[i]);
    }
    if (level !== 'md') html.classList.add('text-size-' + level);
    try { localStorage.setItem(KEY, level); } catch (e) {}
    document.querySelectorAll('.text-size-btn').forEach(function (btn) {
      var dir = btn.getAttribute('data-text-size');
      btn.disabled = (dir === 'down' && level === 'md') || (dir === 'up' && level === 'xl');
    });
  }

  var start = 'md';
  try { start = localStorage.getItem(KEY) || 'md'; } catch (e) {}
  apply(start);

  document.addEventListener('click', function (e) {
    var btn = e.target.closest && e.target.closest('.text-size-btn');
    if (!btn) return;
    var i = levels.indexOf(current());
    if (i < 0) i = 0;
    if (btn.getAttribute('data-text-size') === 'up' && i < levels.length - 1) i += 1;
    if (btn.getAttribute('data-text-size') === 'down' && i > 0) i -= 1;
    apply(levels[i]);
  });

  var lang = (document.documentElement.getAttribute('lang') || '').toLowerCase();
  if (lang.indexOf('en') === 0) {
    var group = document.querySelector('.text-size');
    if (group) group.setAttribute('aria-label', 'Text size');
    document.querySelectorAll('.text-size-btn').forEach(function (btn) {
      if (btn.getAttribute('data-text-size') === 'down') {
        btn.setAttribute('aria-label', 'Decrease text size');
        btn.setAttribute('title', 'Decrease text size');
      } else {
        btn.setAttribute('aria-label', 'Increase text size');
        btn.setAttribute('title', 'Increase text size');
      }
    });
  }
})();
