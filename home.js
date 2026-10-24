/* ═══════════════════════════════════════════════════
   ONLY HUMANS · accueil
   Entrée du hero · galerie en colonnes · line-up piloté par le défilement :
   chaque musicien a son onde (riff haché, solo, voix, accords, frappes, grave),
   dessinée en néon de feu, avec traînée et reflet au sol.
   ═══════════════════════════════════════════════════ */
(function () {
  'use strict';
  var gsap = window.gsap, ST = window.ScrollTrigger;
  var FX = window.FX || { RM: true, fire: ['#ffd200', '#fbb03b', '#f7931e', '#f0801e', '#e3261f'], onReady: function (f) { f(); } };
  var ANIM = !!(gsap && ST && !FX.RM);

  /* ── Entrée du hero ── */
  var intro = document.querySelectorAll('.hero-index .fx-intro');
  if (ANIM) gsap.set(intro, { y: 30 });
  FX.onReady(function () {
    if (!ANIM) { Array.prototype.forEach.call(intro, function (e) { e.style.opacity = 1; }); return; }
    var title = document.querySelector('.hero-index .hero-title');
    if (title && FX.splitChars) {
      gsap.fromTo(FX.splitChars(title), { yPercent: 135, rotate: 14, opacity: 0 },
        { yPercent: 0, rotate: 0, opacity: 1, duration: 1.4, ease: 'expo.out', stagger: 0.06, delay: 0.25 });
    }
    gsap.to(intro, { opacity: 1, y: 0, duration: 1.2, ease: 'expo.out', stagger: 0.12, delay: 0.7 });
  });

  /* ── Galerie : colonnes plus hautes que le cadre, qui ne font que monter ── */
  if (ANIM) {
    document.querySelectorAll('.fx-col').forEach(function (col) {
      var sp = parseFloat(col.getAttribute('data-speed')) || 10, a = Math.abs(sp);
      gsap.fromTo(col, { yPercent: sp > 0 ? -a : 0 }, { yPercent: sp > 0 ? 0 : -a, ease: 'none',
        scrollTrigger: { trigger: col.parentNode, start: 'top bottom', end: 'bottom top', scrub: true } });
    });
  }

  /* ═══ Line-up piloté par le défilement ═══ */
  var sec = document.querySelector('.fx-lineup');
  var MEMBERS = (window.OH && window.OH.members) || [];
  if (!sec || !MEMBERS.length) return;
  var pin = sec.querySelector('.fx-lineup-pin'), cv = sec.querySelector('canvas.fx-lineup-cv'), ctx = cv.getContext('2d');
  var total = MEMBERS.length;

  /* une onde par instrument : x ∈ [0,1], ph = temps → amplitude ∈ [-1,1] */
  var TAU = Math.PI * 2;
  var WAVES = {
    rhythm: function (x, ph) { return Math.tanh(5 * Math.sin(TAU * 7 * x + ph * 7)) * 0.5 * (0.6 + 0.4 * Math.abs(Math.sin(TAU * 1.75 * x - ph * 2))); },
    lead: function (x, ph) { return Math.sin(TAU * (12 + 6 * x) * x + ph * 9) * 0.42 + Math.sin(TAU * 33 * x - ph * 15) * 0.16 * Math.sin(Math.PI * x); },
    voice: function (x, ph) { return Math.sin(TAU * 3.5 * x + ph * 2.6) * 0.62 * (0.55 + 0.45 * Math.sin(TAU * 1.2 * x + ph)); },
    voice2: function (x, ph) { return Math.sin(TAU * 5 * x - ph * 3.2) * 0.5 + Math.sin(TAU * 21 * x + ph * 8) * 0.1; },
    keys: function (x, ph) { return (Math.sin(TAU * 3 * x + ph) + Math.sin(TAU * 3.78 * x + ph * 1.26) + Math.sin(TAU * 4.5 * x + ph * 0.8)) * 0.27; },
    drums: function (x, ph) {
      var v = 0;
      for (var k = 0; k < 8; k++) {
        var p = (k / 8 + ph * 0.09) % 1, dx = x - p;
        if (dx > 0 && dx < 0.12) v += Math.exp(-dx * (k % 2 ? 40 : 22)) * Math.sin(TAU * (k % 2 ? 95 : 48) * dx) * (k % 2 ? 0.55 : 0.95);
      }
      return v;
    },
    bass: function (x, ph) { return Math.sin(TAU * 1.6 * x + ph * 1.8) * 0.72 + Math.sin(TAU * 3.2 * x + ph * 3.6) * 0.08; }
  };

  var W = 0, H = 0, dpr = 1;
  function size() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = pin.clientWidth; H = pin.clientHeight;
    cv.width = W * dpr; cv.height = H * dpr;
  }

  var tNow = 0, tTarget = 0, visible = false, hist = [], lastIdx = -1;
  var elName = document.getElementById('lu-name'), elRole = document.getElementById('lu-role'), elTxt = document.getElementById('lu-txt');
  var elI = document.getElementById('lu-i'), elN = document.getElementById('lu-n'), elBar = document.getElementById('lu-bar');
  if (elN) elN.textContent = String(total).padStart(2, '0');

  function caption(i) {
    var m = MEMBERS[i];
    elI.textContent = String(i + 1).padStart(2, '0');
    function apply() { elName.textContent = m.name; elRole.textContent = m.role; elTxt.textContent = m.txt; }
    if (!ANIM) { apply(); return; }
    gsap.killTweensOf([elName, elRole, elTxt]);
    gsap.to([elName, elRole, elTxt], { opacity: 0, y: -14, duration: 0.18, ease: 'power2.in', onComplete: function () {
      apply();
      gsap.fromTo([elName, elRole, elTxt], { opacity: 0, y: 18, filter: 'blur(8px)' }, { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.5, ease: 'expo.out', stagger: 0.05 });
    } });
  }

  /* le tracé courant : l'onde du musicien, fondue dans la suivante en fin de plage */
  function wavePoints(t, ph, x0, x1, cy, A) {
    var i = Math.min(total - 1, Math.floor(t)), f = t - i;
    var wa = WAVES[MEMBERS[i].wave] || WAVES.voice, wb = WAVES[(MEMBERS[i + 1] || MEMBERS[i]).wave] || wa;
    var k = Math.max(0, (f - 0.72) / 0.28); k = k * k * (3 - 2 * k);
    var pts = [], n = 260;
    for (var s = 0; s <= n; s++) {
      var x = s / n, env = Math.pow(Math.sin(Math.PI * x), 0.7);
      var v = (wa(x, ph) * (1 - k) + wb(x, ph) * k) * env;
      pts.push(x0 + (x1 - x0) * x, cy - v * A);
    }
    return pts;
  }
  function stroke(pts) {
    ctx.beginPath(); ctx.moveTo(pts[0], pts[1]);
    for (var j = 2; j < pts.length; j += 2) ctx.lineTo(pts[j], pts[j + 1]);
    ctx.stroke();
  }

  function draw(now) {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);
    var mobile = W < 860;
    var cx = mobile ? W * 0.5 : W * 0.32, cy = mobile ? H * 0.36 : H * 0.48;
    var x0 = mobile ? W * 0.04 : W * 0.03, x1 = mobile ? W * 0.96 : W * 0.6;
    var A = Math.min(H * 0.2, (x1 - x0) * 0.22);
    var groundY = cy + A * 1.45;
    var idx = Math.min(total - 1, Math.floor(tNow));

    /* halo */
    var gr = ctx.createRadialGradient(cx, cy, 0, cx, cy, H * 0.7);
    gr.addColorStop(0, 'rgba(240,128,30,0.2)'); gr.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = gr; ctx.fillRect(0, 0, W, H);

    /* initiale du musicien en filigrane */
    ctx.save();
    ctx.font = Math.round(H * 0.9) + 'px "Pirata One", serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.strokeStyle = 'rgba(247,147,30,0.16)'; ctx.lineWidth = 1.5;
    ctx.strokeText(MEMBERS[idx].name.charAt(0), cx, H * 0.46);
    ctx.restore();

    /* sol */
    var fl = ctx.createLinearGradient(0, 0, W, 0);
    fl.addColorStop(0, 'rgba(0,0,0,0)'); fl.addColorStop(0.5, 'rgba(240,128,30,0.7)'); fl.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = fl; ctx.fillRect(0, groundY, W, 1.5);

    var ph = now / 1000;
    var pts = wavePoints(tNow, ph, x0, x1, cy, A);
    var fire = ctx.createLinearGradient(0, cy - A, 0, cy + A);
    fire.addColorStop(0, '#ffd200'); fire.addColorStop(0.5, '#f7931e'); fire.addColorStop(1, '#e3261f');
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';

    /* reflet au sol, écrasé puis fondu */
    ctx.save();
    ctx.translate(0, groundY); ctx.scale(1, -0.45); ctx.translate(0, -groundY);
    ctx.globalAlpha = 0.18; ctx.strokeStyle = fire; ctx.lineWidth = 3;
    stroke(pts);
    ctx.restore();
    var fade = ctx.createLinearGradient(0, groundY, 0, Math.min(H, groundY + H * 0.3));
    fade.addColorStop(0, 'rgba(0,0,0,0)'); fade.addColorStop(1, '#000');
    ctx.fillStyle = fade; ctx.fillRect(0, groundY + 1.5, W, H - groundY);

    /* traînées : les tracés récents s'effacent derrière */
    for (var g = 0; g < hist.length; g++) {
      ctx.globalAlpha = 0.04 + 0.16 * (g / hist.length);
      ctx.strokeStyle = fire; ctx.lineWidth = 2;
      stroke(hist[g]);
    }
    ctx.globalAlpha = 1;

    /* l'onde : néon de feu, cœur blanc */
    ctx.save();
    ctx.shadowColor = '#f0801e'; ctx.shadowBlur = 26;
    ctx.strokeStyle = fire; ctx.lineWidth = 4.5;
    stroke(pts);
    ctx.shadowBlur = 0; ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = 0.6;
    ctx.strokeStyle = '#fff3d6'; ctx.lineWidth = 1.4;
    stroke(pts);
    ctx.restore();

    hist.push(pts); if (hist.length > 9) hist.shift();
    if (idx !== lastIdx) { lastIdx = idx; caption(idx); }
    if (elBar) elBar.style.transform = 'scaleX(' + (tNow / total).toFixed(4) + ')';
  }

  function loop(now) {
    requestAnimationFrame(loop);
    tNow += (tTarget - tNow) * 0.14;
    if (visible) draw(now || performance.now());
  }

  size();
  window.addEventListener('resize', size);
  new IntersectionObserver(function (en) { visible = en[0].isIntersecting; }).observe(sec);

  if (ANIM) {
    ST.create({
      trigger: pin, pin: pin, start: 'top top',
      end: function () { return '+=' + Math.round(window.innerHeight * 3.6); },
      invalidateOnRefresh: true, anticipatePin: 1,
      onUpdate: function (st) { tTarget = st.progress * (total - 0.001); }
    });
  } else {
    window.addEventListener('scroll', function () {
      var r = sec.getBoundingClientRect(), span = Math.max(1, sec.offsetHeight - window.innerHeight);
      tTarget = Math.max(0, Math.min(1, -r.top / span)) * (total - 0.001);
    }, { passive: true });
  }
  caption(0); lastIdx = 0;
  requestAnimationFrame(loop);
})();
