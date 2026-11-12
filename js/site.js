/* Mobile navigation only. Motion is handled by motion-anything recipe scripts. */
(function () {
  'use strict';
  var toggle = document.querySelector('.menu-toggle');
  var panel = document.getElementById('mobile-nav');
  if (!toggle || !panel) return;

  var pageLang = (document.documentElement.getAttribute('lang') || 'de').slice(0, 2).toLowerCase();
  var menuLabels = {
    de: ['Menü öffnen', 'Menü schließen'],
    en: ['Open menu', 'Close menu'],
    he: ['פתיחת תפריט', 'סגירת תפריט'],
    ru: ['Открыть меню', 'Закрыть меню']
  }[pageLang] || ['Menü öffnen', 'Menü schließen'];

  function setOpen(open) {
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    toggle.setAttribute('aria-label', open ? menuLabels[1] : menuLabels[0]);
    panel.classList.toggle('is-open', open);
    panel.hidden = !open;
    document.body.classList.toggle('menu-open', open);
    if (open) {
      document.querySelectorAll('.lang-switcher-toggle').forEach(function (b) {
        b.setAttribute('aria-expanded', 'false');
      });
      document.querySelectorAll('.lang-menu').forEach(function (m) { m.hidden = true; });
    }
  }

  toggle.addEventListener('click', function () {
    setOpen(toggle.getAttribute('aria-expanded') !== 'true');
  });

  panel.querySelectorAll('a').forEach(function (a) {
    a.addEventListener('click', function () { setOpen(false); });
  });

  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    var openLang = document.querySelector('.lang-switcher-toggle[aria-expanded="true"]');
    if (openLang) return;
    setOpen(false);
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


/* Hero background video: reduced-motion only (no visible pause/play control). */
(function () {
  'use strict';
  var video = document.getElementById('hero-video');
  if (!video) return;

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');

  function setPlaying(play) {
    if (play) {
      video.classList.add('is-playing');
      video.classList.remove('is-paused');
      var attempt = video.play();
      if (attempt && attempt.catch) {
        attempt.catch(function () { setPlaying(false); });
      }
    } else {
      video.pause();
      video.classList.remove('is-playing');
      video.classList.add('is-paused');
    }
  }

  function applyMotionPref() {
    setPlaying(!reduce.matches);
  }

  if (reduce.addEventListener) reduce.addEventListener('change', applyMotionPref);
  else if (reduce.addListener) reduce.addListener(applyMotionPref);

  if (video.readyState >= 2) applyMotionPref();
  else video.addEventListener('loadeddata', applyMotionPref, { once: true });
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
      var fl = (document.documentElement.getAttribute("lang") || "de").slice(0, 2);
      var msg = { en: "Demo – no data is sent", he: "הדגמה – לא נשלחים נתונים", ru: "Демо – данные не отправляются" }[fl] || "Demo – keine Daten werden gesendet";
      if (n) n.textContent = msg;
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
    if (a.classList.contains('btn') || a.classList.contains('wordmark') || a.closest('.lang-switch, .lang-switcher, .lang-flags')) return;
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
  if (lang.indexOf('en') === 0 || lang.indexOf('he') === 0 || lang.indexOf('ru') === 0) {
    var group = document.querySelector('.text-size');
    var labels = {
      en: { group: 'Text size', down: 'Decrease text size', up: 'Increase text size' },
      he: { group: 'גודל כתב', down: 'הקטן את הכתב', up: 'הגדל את הכתב' },
      ru: { group: 'Размер текста', down: 'Уменьшить текст', up: 'Увеличить текст' }
    };
    var L = labels[lang.slice(0, 2)] || labels.en;
    if (group) group.setAttribute('aria-label', L.group);
    document.querySelectorAll('.text-size-btn').forEach(function (btn) {
      if (btn.getAttribute('data-text-size') === 'down') {
        btn.setAttribute('aria-label', L.down);
        btn.setAttribute('title', L.down);
      } else {
        btn.setAttribute('aria-label', L.up);
        btn.setAttribute('title', L.up);
      }
    });
  }
})();


/* Language switcher: disclosure button + menu, Esc / arrows, CSP-safe. */
(function () {
  'use strict';
  var roots = document.querySelectorAll('.lang-switcher');
  if (!roots.length) return;

  function closeAll(except) {
    roots.forEach(function (root) {
      if (root === except) return;
      var btn = root.querySelector('.lang-switcher-toggle');
      var menu = root.querySelector('.lang-menu');
      if (btn) btn.setAttribute('aria-expanded', 'false');
      if (menu) menu.hidden = true;
    });
  }

  roots.forEach(function (root) {
    var btn = root.querySelector('.lang-switcher-toggle');
    var menu = root.querySelector('.lang-menu');
    if (!btn || !menu) return;

    function items() {
      return Array.prototype.slice.call(menu.querySelectorAll('[role="menuitem"]'));
    }
    function setOpen(open) {
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      menu.hidden = !open;
    }
    function close() { setOpen(false); }

    btn.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      var open = btn.getAttribute('aria-expanded') === 'true';
      closeAll();
      setOpen(!open);
    });

    btn.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        closeAll();
        setOpen(true);
        var list = items();
        if (list[0]) list[0].focus();
      } else if (e.key === 'Escape') {
        close();
      }
    });

    menu.addEventListener('keydown', function (e) {
      var list = items();
      var i = list.indexOf(document.activeElement);
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        close();
        btn.focus();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (list.length) list[(i + 1 + list.length) % list.length].focus();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (list.length) list[(i - 1 + list.length) % list.length].focus();
      } else if (e.key === 'Home') {
        e.preventDefault();
        if (list[0]) list[0].focus();
      } else if (e.key === 'End') {
        e.preventDefault();
        if (list.length) list[list.length - 1].focus();
      } else if (e.key === 'Tab') {
        close();
      }
    });
  });

  document.addEventListener('click', function (e) {
    if (!e.target.closest || !e.target.closest('.lang-switcher')) closeAll();
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeAll();
  });
})();
