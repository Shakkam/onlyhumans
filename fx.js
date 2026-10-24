/* ═══════════════════════════════════════════════════
   ONLY HUMANS · effets communs à toutes les pages
   Ouverture (anneau de feu autour du H) · transitions à rideau · défilement fluide
   curseur-médiator à traînée de flammes · textes cinétiques · images · braises · bandeau
   D'après la couche « ouf » de Fan Yao v4.
   ═══════════════════════════════════════════════════ */
(function () {
  'use strict';

  var root = document.documentElement;
  var RM = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var FINE = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var gsap = window.gsap, ST = window.ScrollTrigger;
  var HAS_GSAP = !!(gsap && ST);
  if (HAS_GSAP) gsap.registerPlugin(ST);

  /* les couleurs du logo, du cœur de la flamme à sa pointe */
  var FIRE = ['#ffd200', '#fbb03b', '#f7931e', '#f0801e', '#e3261f'];
  var FX = window.FX = {
    RM: RM, FINE: FINE, ready: false, color: '#f7931e', fire: FIRE, velocity: 0, lenis: null,
    onReady: function (fn) { if (FX.ready) fn(); else document.addEventListener('fx:ready', fn, { once: true }); }
  };

  function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function ssGet(k) { try { return sessionStorage.getItem(k); } catch (e) { return null; } }
  function ssSet(k, v) { try { sessionStorage.setItem(k, v); } catch (e) {} }

  /* page → [libellé, chiffre romain (comme les pistes d'un album)] */
  var PAGES = {
    'index.html': ['Accueil', 'I'], 'groupe.html': ['Le groupe', 'II'], 'musique.html': ['Musique', 'III'],
    'concerts.html': ['Concerts', 'IV'], 'medias.html': ['Médias', 'V'], 'contact.html': ['Contact', 'VI']
  };
  var page = document.body.getAttribute('data-page') || 'index';
  var pageKey = page + '.html';
  FX.numeral = (PAGES[pageKey] || ['', 'I'])[1];

  /* ── Défilement fluide ── */
  if (!RM && window.Lenis) {
    var lenis = FX.lenis = new window.Lenis({ lerp: 0.085, wheelMultiplier: 1 });
    var lastScrollT = 0;
    lenis.on('scroll', function (e) { FX.velocity = e.velocity || 0; lastScrollT = performance.now(); if (ST) ST.update(); });
    if (HAS_GSAP) {
      gsap.ticker.add(function (t) {
        lenis.raf(t * 1000);
        /* plus d'évènement de défilement : la vitesse retombe (sinon les grilles restent penchées) */
        if (performance.now() - lastScrollT > 120) FX.velocity *= 0.8;
      });
      gsap.ticker.lagSmoothing(0);
    } else {
      (function raf(t) { lenis.raf(t); requestAnimationFrame(raf); })(performance.now());
    }
    window.addEventListener('click', function (e) {
      var bt = e.target.closest('#back-top');
      if (bt) { e.stopPropagation(); lenis.scrollTo(0, { duration: 1.6 }); }
    }, true);
    var mob = document.getElementById('mobile-nav');
    if (mob) new MutationObserver(function () { if (mob.hidden) lenis.start(); else lenis.stop(); })
      .observe(mob, { attributes: true, attributeFilter: ['hidden'] });
  }

  /* ── Barre de progression ── */
  var prog = el('div'); prog.id = 'fx-progress'; prog.setAttribute('aria-hidden', 'true'); document.body.appendChild(prog);
  function updateProgress() {
    var h = document.documentElement.scrollHeight - window.innerHeight;
    prog.style.transform = 'scaleX(' + (h > 0 ? clamp(window.scrollY / h, 0, 1) : 0) + ')';
  }
  window.addEventListener('scroll', updateProgress, { passive: true }); updateProgress();

  /* ═══ Ouverture / transitions ═══
     Transition : un mur de flammes monte et couvre l'écran (nom de la page au centre),
     puis à l'arrivée il continue de monter et « brûle » à travers, en laissant une lueur.
     Ouverture : décompte « 1, 2, 3, 4 ! » façon baguettes, puis le H s'embrase. */
  var trans = el('div', '', '<div class="fx-burn"><img class="fx-burn-logo" src="images/logo-h.png" alt=""><span class="fx-burn-label"></span></div>');
  trans.id = 'fx-trans'; trans.setAttribute('aria-hidden', 'true');
  document.body.appendChild(trans);
  var wall = trans.querySelector('.fx-burn'), wallLabel = trans.querySelector('.fx-burn-label'), wallLogo = trans.querySelector('.fx-burn-logo');
  function below() { return window.innerHeight * 1.35; }   /* assez bas pour cacher aussi la crête des flammes */
  if (gsap) gsap.set(wall, { y: below() });

  function fireReady() {
    if (FX.ready) return;
    FX.ready = true;
    document.dispatchEvent(new CustomEvent('fx:ready'));
  }

  function runLoader() {
    var L = el('div', '',
      '<div class="fx-flash"></div><span class="fx-count"></span>' +
      '<img class="fx-loader-logo" src="images/logo-h.png" alt="">' +
      '<div class="fx-loader-tag">Only Humans · Rock live</div>');
    L.id = 'fx-loader'; L.setAttribute('aria-hidden', 'true');
    document.body.appendChild(L);
    root.classList.remove('fx-first');
    var count = L.querySelector('.fx-count'), logo = L.querySelector('.fx-loader-logo'), flash = L.querySelector('.fx-flash');
    gsap.set(logo, { opacity: 0 });
    var tl = gsap.timeline({ onComplete: function () { L.remove(); } });
    lockScroll();
    ['1', '2', '3', '4 !'].forEach(function (n, i) {
      var t = 0.08 + i * 0.22;
      tl.add(function () { count.textContent = n; }, t)
        .fromTo(count, { scale: i === 3 ? 2.6 : 1.9, opacity: 0, rotate: i % 2 ? 6 : -6 }, { scale: 1, opacity: 1, rotate: 0, duration: 0.14, ease: 'power4.out' }, t)
        .fromTo(flash, { opacity: i === 3 ? 0.5 : 0.22 }, { opacity: 0, duration: 0.2, ease: 'power2.out' }, t);
    });
    tl.to(count, { scale: 3, opacity: 0, filter: 'blur(10px)', duration: 0.3, ease: 'power2.in' }, 0.98)
      .fromTo(logo, { opacity: 0, scale: 0.35, filter: 'blur(14px) brightness(4)' }, { opacity: 1, scale: 1, filter: 'blur(0px) brightness(1)', duration: 0.55, ease: 'expo.out' }, 1.05)
      .add(fireReady, 1.45)
      .to(logo, { scale: 1.25, opacity: 0, duration: 0.35, ease: 'power2.in' }, 1.5)
      .to(L, { opacity: 0, duration: 0.35, ease: 'power2.in' }, 1.55)
      .add(unlockScroll, 1.9);
    ssSet('oh-seen', '1');
  }

  /* Sous le rideau, la page ne doit pas défiler (molette, inertie d'un pavé tactile) */
  var navType = ((performance.getEntriesByType && performance.getEntriesByType('navigation')[0]) || {}).type;
  var freshNav = (navType || 'navigate') === 'navigate' && !location.hash;
  function toTop() { if (!freshNav) return; window.scrollTo(0, 0); if (FX.lenis) FX.lenis.scrollTo(0, { immediate: true, force: true }); }
  function blockWheel(e) { e.preventDefault(); }
  function lockScroll() {
    toTop();
    if (FX.lenis) FX.lenis.stop();
    window.addEventListener('wheel', blockWheel, { passive: false });
    window.addEventListener('touchmove', blockWheel, { passive: false });
  }
  function unlockScroll() {
    toTop();
    window.removeEventListener('wheel', blockWheel);
    window.removeEventListener('touchmove', blockWheel);
    if (FX.lenis) FX.lenis.start();
    guardTop(1500);
  }
  /* après l'arrivée, tout défilement qui ne vient pas de l'utilisateur est annulé */
  var userMoved = false, guardUntil = 0;
  ['wheel', 'touchstart', 'keydown', 'pointerdown'].forEach(function (ev) {
    window.addEventListener(ev, function () { if (!document.getElementById('fx-loader') && !trans.classList.contains('on')) userMoved = true; }, { passive: true, capture: true });
  });
  function guardTop(ms) {
    if (!freshNav) return;
    userMoved = false;
    guardUntil = performance.now() + ms;
  }
  window.addEventListener('scroll', function () {
    if (!userMoved && performance.now() < guardUntil && window.scrollY > 0) toTop();
  }, { passive: true });
  toTop();
  guardTop(2500);

  function runEnter() {
    trans.classList.add('on');
    wallLabel.textContent = (PAGES[pageKey] || [''])[0];
    gsap.set(wall, { y: 0 });
    root.classList.remove('fx-entering');
    ssSet('oh-trans', '0');
    lockScroll();
    gsap.timeline({ onComplete: function () { trans.classList.remove('on'); gsap.set(wall, { y: below() }); unlockScroll(); } })
      .to([wallLabel, wallLogo], { opacity: 0, y: -40, duration: 0.2, ease: 'power2.in' }, 0)
      .add(fireReady, 0.12)
      .to(wall, { y: -window.innerHeight * 1.3, duration: 0.65, ease: 'power3.inOut' }, 0.05);   /* le feu passe à travers */
  }

  function leaveTo(href, label) {
    trans.classList.add('on');
    wallLabel.textContent = label;
    gsap.set([wallLabel, wallLogo], { opacity: 0, y: 30 });
    gsap.set(wall, { y: below() });
    ssSet('oh-trans', '1');
    if (FX.lenis) FX.lenis.stop();
    window.addEventListener('wheel', blockWheel, { passive: false });
    gsap.timeline({ onComplete: function () { window.location.href = href; } })
      .to(wall, { y: 0, duration: 0.46, ease: 'power3.inOut' }, 0)
      .to([wallLogo, wallLabel], { opacity: 1, y: 0, duration: 0.28, ease: 'expo.out', stagger: 0.05 }, 0.24);
  }

  if (HAS_GSAP && !RM) {
    if (root.classList.contains('fx-first')) runLoader();
    else if (root.classList.contains('fx-entering')) runEnter();
    else fireReady();

    document.addEventListener('click', function (e) {
      var a = e.target.closest('a[href]');
      if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      if (a.target && a.target !== '_self') return;
      var href = a.getAttribute('href');
      if (!href || href.charAt(0) === '#' || /^(mailto|tel|https?):/i.test(href) || /\.(pdf|jpe?g|png)($|\?)/i.test(href)) return;
      var key = href.split('#')[0].split('?')[0].split('/').pop() || 'index.html';
      if (!PAGES[key]) return;
      e.preventDefault();
      if (key === pageKey) { if (FX.lenis) FX.lenis.scrollTo(0, { duration: 1.4 }); else window.scrollTo(0, 0); return; }
      leaveTo(href, PAGES[key][0]);
    });
    window.addEventListener('pageshow', function (e) {
      if (e.persisted) { trans.classList.remove('on'); gsap.set(wall, { y: below() }); window.removeEventListener('wheel', blockWheel); if (FX.lenis) FX.lenis.start(); }
    });
  } else {
    root.classList.remove('fx-first', 'fx-entering');
    fireReady();
  }

  /* ═══ Curseur : un médiator qui laisse une traînée de flammes ═══
     La pointe du médiator est le point actif ; il balance selon le mouvement,
     se dresse et s'embrase au survol des liens, et un clic « gratte » : onde + étincelles. */
  if (FINE && !RM) {
    root.classList.add('fx-cursor');
    var ink = el('canvas'); ink.id = 'fx-ink';
    var tag = el('div', 'fx-cursor-label', 'Voir');
    [ink, tag].forEach(function (n) { n.setAttribute('aria-hidden', 'true'); document.body.appendChild(n); });
    var ictx = ink.getContext('2d'), iw = 0, ih = 0, idpr = 1;
    function sizeInk() { idpr = Math.min(window.devicePixelRatio || 1, 2); iw = innerWidth; ih = innerHeight; ink.width = iw * idpr; ink.height = ih * idpr; }
    sizeInk(); window.addEventListener('resize', sizeInk);

    var mx = -100, my = -100, pmx = -100, vxs = 0, shown = false, hoverLink = false, hoverView = false;
    var ang = -35, angV = 0, scl = 1;
    var trail = [], sparks = [];

    /* réacteur : à chaque mouvement, la pointe crache un jet de particules à l'opposé du déplacement */
    var lmx = -100, lmy = -100;
    window.addEventListener('mousemove', function (e) {
      mx = e.clientX; my = e.clientY;
      if (!shown) { pmx = mx; lmx = mx; lmy = my; }
      shown = true;
      var dx = mx - lmx, dy = my - lmy, sp = Math.hypot(dx, dy);
      lmx = mx; lmy = my;
      if (sp < 0.5) return;
      var ux = -dx / sp, uy = -dy / sp, n = Math.min(16, 2 + Math.floor(sp * 0.5));
      for (var k = 0; k < n; k++) {
        var f = Math.random();                          /* répartis le long du segment parcouru */
        var spread = (Math.random() - 0.5) * 0.7, c = Math.cos(spread), s2 = Math.sin(spread);
        var v = (2 + Math.random() * 4) * Math.min(2.2, 0.6 + sp * 0.05);
        trail.push({ x: mx + dx * -f, y: my + dy * -f, vx: (ux * c - uy * s2) * v, vy: (ux * s2 + uy * c) * v, life: 1, d: 0.028 + Math.random() * 0.03, r: 1.2 + Math.random() * 2.6 });
      }
    }, { passive: true });
    window.addEventListener('mousedown', function () {
      angV += 26;                                       /* coup de médiator */
      /* une gerbe de petites étincelles, dans toutes les directions, qui retombent */
      for (var i = 0; i < 38; i++) {
        var a = Math.random() * Math.PI * 2, sp = 1.5 + Math.random() * 6.5;
        sparks.push({ x: mx, y: my, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 1.2, life: 1, d: 0.022 + Math.random() * 0.03,
          c: Math.random() < 0.3 ? '#fff4d6' : FIRE[Math.floor(Math.random() * 3)] });
      }
    });
    document.addEventListener('mouseover', function (e) {
      var t = e.target;
      hoverView = !!t.closest('.fx-view, .gallery-item, .fx-col figure');
      hoverLink = !hoverView && !!t.closest('a, button, [role="button"], input, textarea, select, label');
      tag.classList.toggle('on', hoverView);
    });
    document.documentElement.addEventListener('mouseleave', function () { shown = false; tag.classList.remove('on'); });

    function pick(c, glow) {
      /* repère local : pointe en (0,0), le médiator s'élargit vers -y */
      c.beginPath();
      c.moveTo(0, 0);
      c.bezierCurveTo(-6, -6, -15, -17, -15, -26);
      c.bezierCurveTo(-15, -36, -7, -40, 0, -40);
      c.bezierCurveTo(7, -40, 15, -36, 15, -26);
      c.bezierCurveTo(15, -17, 6, -6, 0, 0);
      c.closePath();
      var g = c.createLinearGradient(0, -40, 0, 0);
      g.addColorStop(0, '#ffd200'); g.addColorStop(0.55, '#f0801e'); g.addColorStop(1, '#e3261f');
      c.fillStyle = g;
      c.shadowColor = glow ? '#ffb000' : 'rgba(0,0,0,0.7)'; c.shadowBlur = glow ? 22 : 6;
      c.fill();
      c.shadowBlur = 0;
      c.lineWidth = 1; c.strokeStyle = 'rgba(30,10,0,0.6)'; c.stroke();
      /* reflet */
      c.beginPath(); c.moveTo(-8, -30); c.quadraticCurveTo(-6, -37, 2, -37); c.lineWidth = 1.6; c.strokeStyle = 'rgba(255,255,255,0.55)'; c.stroke();
      /* le H gravé */
      c.fillStyle = 'rgba(20,6,0,0.75)';
      c.fillRect(-6, -31, 2.6, 12); c.fillRect(3.4, -31, 2.6, 12); c.fillRect(-6, -26.2, 12, 2.4);
    }

    (function loop() {
      requestAnimationFrame(loop);
      var now = performance.now();
      ictx.setTransform(idpr, 0, 0, idpr, 0, 0);
      ictx.clearRect(0, 0, iw, ih);

      /* jet du réacteur : blanc brûlant à la sortie, puis jaune, orange, rouge, et ça s'éteint */
      ictx.globalCompositeOperation = 'lighter';
      ictx.lineCap = 'round';
      if (trail.length > 900) trail.splice(0, trail.length - 900);
      for (var i = trail.length - 1; i >= 0; i--) {
        var P = trail[i];
        P.x += P.vx; P.y += P.vy; P.vx *= 0.93; P.vy *= 0.93; P.life -= P.d;
        if (P.life <= 0) { trail.splice(i, 1); continue; }
        var heat = P.life;
        ictx.strokeStyle = heat > 0.82 ? '#fff4d6' : FIRE[Math.min(FIRE.length - 1, Math.floor((1 - heat) / 0.82 * FIRE.length))];
        ictx.globalAlpha = Math.min(1, heat * 1.3) * 0.9;
        ictx.lineWidth = P.r * (0.6 + (1 - heat) * 1.2);       /* les gaz s'élargissent en refroidissant */
        ictx.beginPath(); ictx.moveTo(P.x, P.y); ictx.lineTo(P.x - P.vx * 2.2, P.y - P.vy * 2.2); ictx.stroke();
      }
      /* étincelles : de petits traits vifs qui filent, ralentissent, tombent et s'éteignent */
      ictx.lineCap = 'round';
      for (var d = sparks.length - 1; d >= 0; d--) {
        var q = sparks[d];
        q.x += q.vx; q.y += q.vy; q.vy += 0.16; q.vx *= 0.95; q.vy *= 0.97; q.life -= q.d;
        if (q.life <= 0) { sparks.splice(d, 1); continue; }
        ictx.globalAlpha = Math.min(1, q.life * 1.4) * (0.7 + Math.random() * 0.3);   /* elles scintillent */
        ictx.strokeStyle = q.c; ictx.lineWidth = 1.1 + q.life * 0.9;
        ictx.beginPath(); ictx.moveTo(q.x, q.y); ictx.lineTo(q.x - q.vx * 1.6, q.y - q.vy * 1.6); ictx.stroke();
      }
      ictx.globalAlpha = 1;
      ictx.globalCompositeOperation = 'source-over';
      if (!shown) return;

      /* balancier : le médiator penche selon la vitesse horizontale, ressort amorti */
      vxs += ((mx - pmx) - vxs) * 0.25; pmx = mx;
      var target = (hoverLink ? -8 : hoverView ? -20 : -35) + clamp(vxs * 1.2, -40, 40);
      angV += (target - ang) * 0.16; angV *= 0.74; ang += angV;
      scl += ((hoverLink ? 1.25 : 1) - scl) * 0.2;
      ictx.save();
      ictx.translate(mx, my); ictx.rotate(ang * Math.PI / 180 + Math.PI); ictx.scale(scl * 0.72, scl * 0.72);
      pick(ictx, hoverLink || hoverView);
      ictx.restore();
      tag.style.transform = 'translate3d(' + (mx + 18) + 'px,' + (my - 34) + 'px,0)';
    })();
  }

  if (!HAS_GSAP || RM) return;   /* tout ce qui suit est de l'animation pure */

  /* ═══ Textes découpés en lettres ═══ */
  function splitChars(node) {
    if (node.getAttribute('data-fx-split')) return node._fxChars || [];
    node.setAttribute('data-fx-split', '1');
    node.setAttribute('aria-label', node.textContent.replace(/\s+/g, ' ').trim());
    var chars = [];
    (function walk(n) {
      Array.prototype.slice.call(n.childNodes).forEach(function (ch) {
        if (ch.nodeType === 3) {
          var frag = document.createDocumentFragment();
          ch.textContent.split(/(\s+)/).forEach(function (part) {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(' ')); return; }
            var w = el('span', 'fx-word'); w.setAttribute('aria-hidden', 'true');
            Array.from(part).forEach(function (c) {
              var o = el('span', 'fx-char-wrap'), i = el('span', 'fx-char'); i.textContent = c;
              o.appendChild(i); w.appendChild(o); chars.push(i);
            });
            frag.appendChild(w);
          });
          n.replaceChild(frag, ch);
        } else if (ch.nodeType === 1 && ch.tagName !== 'BR') walk(ch);
      });
    })(node);
    node._fxChars = chars;
    return chars;
  }
  function splitWords(node) {
    var words = [];
    (function walk(n) {
      Array.prototype.slice.call(n.childNodes).forEach(function (ch) {
        if (ch.nodeType === 3) {
          var frag = document.createDocumentFragment();
          ch.textContent.split(/(\s+)/).forEach(function (part) {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
            var w = el('span', 'fx-hw'); w.textContent = part; frag.appendChild(w); words.push(w);
          });
          n.replaceChild(frag, ch);
        } else if (ch.nodeType === 1) walk(ch);
      });
    })(node);
    return words;
  }
  FX.splitChars = splitChars;

  FX.onReady(function () {
    document.querySelectorAll('.section-title, .page-hero-title, .cta-band-title, .fx-split').forEach(function (h) {
      var chars = splitChars(h);
      var inHero = !!h.closest('.page-hero');
      gsap.fromTo(chars, { yPercent: 120, rotate: 9, opacity: 0 }, {
        yPercent: 0, rotate: 0, opacity: 1, duration: 1.1, ease: 'expo.out', stagger: 0.03,
        delay: inHero ? 0.15 : 0,
        scrollTrigger: inHero ? null : { trigger: h, start: 'top 88%', once: true }
      });
    });
    document.querySelectorAll('.page-hero-eyebrow').forEach(function (e) {
      gsap.fromTo(e, { letterSpacing: '1.3em', opacity: 0 }, { letterSpacing: '0.42em', opacity: 1, duration: 1.4, ease: 'expo.out' });
    });
    /* citations : s'allument mot à mot au défilement */
    document.querySelectorAll('.preview-pull').forEach(function (q) {
      var words = splitWords(q);
      gsap.fromTo(words, { opacity: 0.12 }, { opacity: 1, ease: 'none', stagger: 0.1,
        scrollTrigger: { trigger: q, start: 'top 85%', end: 'bottom 45%', scrub: true } });
    });
    /* chiffres : défilement aléatoire avant de se figer */
    document.querySelectorAll('.fx-num').forEach(function (n) {
      var f = n.textContent;
      ST.create({ trigger: n, start: 'top 92%', once: true, onEnter: function () {
        var o = { p: 0 };
        gsap.to(o, { p: 1, duration: 1.3, ease: 'power3.out', onUpdate: function () {
          n.textContent = f.replace(/\d/g, function (d) { return o.p > 0.92 ? d : String(Math.floor(Math.random() * 10)); });
        } });
      } });
    });
  });

  /* ═══ Révélation des images + parallaxe ═══ */
  FX.revealImages = function (scope) {
    (scope || document).querySelectorAll('.preview-image, .gallery-item, .fx-col figure').forEach(function (box) {
      if (box._fxRev) return; box._fxRev = 1;
      var img = box.querySelector('img');
      if (!img) return;
      gsap.fromTo(box, { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.3, ease: 'expo.inOut',
        scrollTrigger: { trigger: box, start: 'top 90%', once: true } });
      gsap.fromTo(img, { scale: 1.45 }, { scale: 1.12, duration: 1.7, ease: 'expo.out',
        scrollTrigger: { trigger: box, start: 'top 90%', once: true } });
      if (!box.closest('.fx-col')) {
        gsap.fromTo(img, { yPercent: -6 }, { yPercent: 6, ease: 'none',
          scrollTrigger: { trigger: box, start: 'top bottom', end: 'bottom top', scrub: true } });
      }
    });
  };
  FX.revealImages();
  document.querySelectorAll('.cta-band-bg').forEach(function (bg) {
    gsap.fromTo(bg, { scale: 1.35, yPercent: -10 }, { scale: 1.05, yPercent: 10, ease: 'none',
      scrollTrigger: { trigger: bg.parentNode, start: 'top bottom', end: 'bottom top', scrub: true } });
  });

  /* ═══ Inclinaison selon la vitesse de défilement ═══ */
  var skewEls = document.querySelectorAll('.gallery-grid, .members, .shows, .fx-cols');
  if (skewEls.length) {
    var skewTo = Array.prototype.map.call(skewEls, function (s) { return gsap.quickTo(s, 'skewY', { duration: 0.5, ease: 'power3' }); });
    gsap.ticker.add(function () { var v = clamp(FX.velocity * 0.18, -5, 5); skewTo.forEach(function (f) { f(v); }); });
  }

  /* ═══ Boutons aimantés, cartes éclairées, cartes inclinées ═══ */
  if (FINE) {
    document.querySelectorAll('.btn-primary, .btn-outline, .play-btn, .back-top, .nav-logo, .foot-social a').forEach(function (b) {
      var xTo = gsap.quickTo(b, 'x', { duration: 0.6, ease: 'elastic.out(1, 0.35)' });
      var yTo = gsap.quickTo(b, 'y', { duration: 0.6, ease: 'elastic.out(1, 0.35)' });
      b.addEventListener('mousemove', function (e) {
        var r = b.getBoundingClientRect();
        xTo((e.clientX - r.left - r.width / 2) * 0.35); yTo((e.clientY - r.top - r.height / 2) * 0.45);
      });
      b.addEventListener('mouseleave', function () { xTo(0); yTo(0); });
    });

    document.querySelectorAll('.contact-info-card, .next-show, .show-card, .player-stage').forEach(function (c) {
      c.classList.add('fx-spot');
      c.addEventListener('mousemove', function (e) {
        var r = c.getBoundingClientRect();
        c.style.setProperty('--mx', (e.clientX - r.left) + 'px'); c.style.setProperty('--my', (e.clientY - r.top) + 'px');
      });
    });

    document.querySelectorAll('.member-card').forEach(function (c) {
      c.classList.add('fx-tilt');
      var g = el('span', 'fx-glare'); g.setAttribute('aria-hidden', 'true'); c.appendChild(g);
      var rX = gsap.quickTo(c, 'rotationX', { duration: 0.6, ease: 'power3' }), rY = gsap.quickTo(c, 'rotationY', { duration: 0.6, ease: 'power3' });
      gsap.set(c, { transformPerspective: 900 });
      c.addEventListener('mousemove', function (e) {
        var r = c.getBoundingClientRect(), px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
        rY((px - 0.5) * 12); rX((0.5 - py) * 9);
        c.style.setProperty('--gx', px * 100 + '%'); c.style.setProperty('--gy', py * 100 + '%');
      });
      c.addEventListener('mouseleave', function () { rX(0); rY(0); });
    });
  }

  /* ═══ En-têtes intérieurs : la photo éclairée par un feu qui vacille par en dessous + parallaxe ═══ */
  document.querySelectorAll('.page-hero').forEach(function (hero) {
    var heat = el('span', 'fx-heat'); heat.setAttribute('aria-hidden', 'true'); hero.appendChild(heat);
    var bg = hero.querySelector('.page-hero-bg');
    FX.onReady(function () {
      gsap.fromTo(heat, { opacity: 0 }, { opacity: 1, duration: 1.6, ease: 'power2.out' });
      if (bg) gsap.fromTo(bg, { scale: 1.3 }, { scale: 1.05, duration: 2.2, ease: 'expo.out' });
    });
    if (bg) gsap.to(bg, { yPercent: 18, ease: 'none', scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true } });
    if (FINE && bg) {
      var bx = gsap.quickTo(bg, 'x', { duration: 1.2, ease: 'power3' });
      hero.addEventListener('mousemove', function (e) { bx((e.clientX / innerWidth - 0.5) * -30); });
    }
  });

  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { ST.refresh(); });
  window.addEventListener('load', function () { ST.refresh(); });
})();
