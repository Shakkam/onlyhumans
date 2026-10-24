/* ═══════════════════════════════════════════════════
   ONLY HUMANS · lecteur de la page Musique
   Le spectre réel du morceau (Web Audio) monte en flammes depuis le bas de la scène ;
   à l'arrêt, des braises respirent doucement.
   ═══════════════════════════════════════════════════ */
(function () {
  'use strict';
  var TRACKS = (window.OH && window.OH.tracks) || [];
  var audio = document.getElementById('audio'), list = document.getElementById('tracklist');
  if (!audio || !list || !TRACKS.length) return;
  var playBtn = document.getElementById('play'), seek = document.getElementById('seek');
  var tCur = document.getElementById('t-cur'), tDur = document.getElementById('t-dur');
  var nTitle = document.getElementById('now-title'), nArtist = document.getElementById('now-artist'), nNote = document.getElementById('now-note');
  var cv = document.getElementById('viz'), ctx = cv.getContext('2d');
  var gsap = window.gsap, RM = window.FX ? FX.RM : false;
  var PLAY = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M7 4l14 8-14 8z"/></svg>';
  var PAUSE = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 4h4v16H6zM14 4h4v16h-4z"/></svg>';
  var cur = 0;

  function fmt(s) { if (!isFinite(s)) return '0:00'; return Math.floor(s / 60) + ':' + String(Math.floor(s % 60)).padStart(2, '0'); }

  list.innerHTML = TRACKS.map(function (t, i) {
    return '<li><button type="button" data-i="' + i + '"><span class="t-num">' + String(i + 1).padStart(2, '0') + '</span>' +
      '<span class="t-title">' + t.title + '<small>' + t.artist + '</small></span><span class="t-time" data-dur="' + i + '"></span></button></li>';
  }).join('');
  /* durées de chaque morceau, lues sans tout télécharger */
  TRACKS.forEach(function (t, i) {
    var a = new Audio(); a.preload = 'metadata'; a.src = t.src;
    a.addEventListener('loadedmetadata', function () {
      var c = list.querySelector('[data-dur="' + i + '"]'); if (c) c.textContent = fmt(a.duration);
      a.removeAttribute('src'); a.load();   /* on libère la connexion, sinon le vrai lecteur attend son tour */
    });
  });

  function load(i, autoplay) {
    cur = i;
    var t = TRACKS[i];
    audio.src = t.src;
    list.querySelectorAll('button').forEach(function (b) { b.setAttribute('aria-current', String(+b.getAttribute('data-i') === i)); });
    function apply() { nTitle.textContent = t.title; nArtist.textContent = t.artist; nNote.textContent = t.note || 'Live'; }
    if (gsap && !RM) {
      gsap.to([nTitle, nArtist], { opacity: 0, y: -10, duration: 0.18, onComplete: function () {
        apply(); gsap.fromTo([nTitle, nArtist], { opacity: 0, y: 16, filter: 'blur(6px)' }, { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.5, ease: 'expo.out', stagger: 0.05 });
      } });
    } else apply();
    if (autoplay) play();
  }

  /* ── Web Audio : créé au premier clic (règle des navigateurs) ── */
  var actx = null, analyser = null, freq = null, wave = null;
  function ensureAudio() {
    if (actx) { if (actx.state === 'suspended') actx.resume(); return; }
    var AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    try {
      actx = new AC();
      var src = actx.createMediaElementSource(audio);
      analyser = actx.createAnalyser(); analyser.fftSize = 1024; analyser.smoothingTimeConstant = 0.8;
      src.connect(analyser); analyser.connect(actx.destination);
      freq = new Uint8Array(analyser.frequencyBinCount); wave = new Uint8Array(analyser.fftSize);
    } catch (e) { actx = null; analyser = null; }
  }
  function play() { ensureAudio(); audio.play().catch(function () {}); }

  playBtn.addEventListener('click', function () { if (audio.paused) play(); else audio.pause(); });
  list.addEventListener('click', function (e) {
    var b = e.target.closest('button[data-i]'); if (!b) return;
    var i = +b.getAttribute('data-i');
    if (i === cur && !audio.paused) { audio.pause(); return; }
    if (i === cur && audio.src) { play(); return; }
    load(i, true);
  });
  audio.addEventListener('play', function () { playBtn.innerHTML = PAUSE; playBtn.setAttribute('aria-label', 'Pause'); });
  audio.addEventListener('pause', function () { playBtn.innerHTML = PLAY; playBtn.setAttribute('aria-label', 'Lecture'); });
  audio.addEventListener('ended', function () { load((cur + 1) % TRACKS.length, true); });
  audio.addEventListener('loadedmetadata', function () { tDur.textContent = fmt(audio.duration); });
  audio.addEventListener('timeupdate', function () {
    tCur.textContent = fmt(audio.currentTime);
    if (audio.duration && !seeking) seek.value = Math.round(audio.currentTime / audio.duration * 1000);
  });
  var seeking = false;
  seek.addEventListener('input', function () { seeking = true; if (audio.duration) tCur.textContent = fmt(seek.value / 1000 * audio.duration); });
  seek.addEventListener('change', function () { if (audio.duration) audio.currentTime = seek.value / 1000 * audio.duration; seeking = false; });

  /* ── Visualisation ── */
  var W = 0, H = 0, dpr = 1, bars = new Float32Array(64), sparks = [];
  function size() { dpr = Math.min(devicePixelRatio || 1, 2); W = cv.offsetWidth; H = cv.offsetHeight; cv.width = W * dpr; cv.height = H * dpr; }
  size(); window.addEventListener('resize', size);
  var visible = true;
  new IntersectionObserver(function (en) { visible = en[0].isIntersecting; }).observe(cv);

  function frame(now) {
    requestAnimationFrame(frame);
    if (!visible || document.hidden) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);
    var live = analyser && !audio.paused, n = bars.length, t = now / 1000;
    if (live) analyser.getByteFrequencyData(freq);
    for (var i = 0; i < n; i++) {
      /* bandes logarithmiques : les graves à gauche, les aigus à droite */
      var target;
      if (live) {
        var a = Math.floor(Math.pow(i / n, 1.7) * freq.length * 0.7), b = Math.max(a + 1, Math.floor(Math.pow((i + 1) / n, 1.7) * freq.length * 0.7)), s = 0;
        for (var k = a; k < b; k++) s += freq[k];
        target = s / (b - a) / 255;
      } else target = RM ? 0.08 : 0.06 + 0.05 * (Math.sin(t * 1.4 + i * 0.45) + 1) * 0.5;
      bars[i] += (target - bars[i]) * (target > bars[i] ? 0.5 : 0.12);
    }
    var bw = W / n, base = H;
    ctx.globalCompositeOperation = 'lighter';
    for (var j = 0; j < n; j++) {
      var h = bars[j] * H * 0.6, x = j * bw;
      var g = ctx.createLinearGradient(0, base, 0, base - h);
      g.addColorStop(0, 'rgba(227,38,31,0.85)'); g.addColorStop(0.55, 'rgba(240,128,30,0.65)'); g.addColorStop(1, 'rgba(255,210,0,0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.moveTo(x + 1, base);
      ctx.quadraticCurveTo(x + bw * 0.5, base - h * 1.15, x + bw - 1, base);   /* une langue de flamme par bande */
      ctx.fill();
      if (live && bars[j] > 0.55 && Math.random() < 0.08) sparks.push({ x: x + bw / 2, y: base - h, vy: -1 - Math.random() * 2.5, vx: (Math.random() - 0.5), life: 1 });
    }
    /* l'oscilloscope en filigrane */
    if (live) {
      analyser.getByteTimeDomainData(wave);
      ctx.beginPath();
      for (var w = 0; w < wave.length; w += 4) {
        var px = w / wave.length * W, py = H * 0.38 + (wave[w] - 128) / 128 * H * 0.18;
        if (w) ctx.lineTo(px, py); else ctx.moveTo(px, py);
      }
      ctx.strokeStyle = 'rgba(255,220,140,0.35)'; ctx.lineWidth = 1.5; ctx.stroke();
    }
    for (var q = sparks.length - 1; q >= 0; q--) {
      var p = sparks[q]; p.x += p.vx; p.y += p.vy; p.life -= 0.015;
      if (p.life <= 0) { sparks.splice(q, 1); continue; }
      ctx.globalAlpha = p.life; ctx.fillStyle = '#ffc040'; ctx.beginPath(); ctx.arc(p.x, p.y, 1.8, 0, Math.PI * 2); ctx.fill();
    }
    ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
  }
  requestAnimationFrame(frame);
  load(0, false);
})();
