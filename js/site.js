/* Mobile navigation only. Motion is handled by motion-anything recipe scripts. */
(function () {
  'use strict';
  var toggle = document.querySelector('.menu-toggle');
  var panel = document.getElementById('mobile-nav');
  if (!toggle || !panel) return;

  function setOpen(open) {
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
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
