/* ═══════════════════════════════════════════════════
   ONLY HUMANS · hero en particules (Three.js)
   ~20 000 braises qui composent le logo (avec ses couleurs), puis le nom,
   une guitare, une onde sonore. La souris les écarte, un clic fait
   « gratter » une onde de choc, le défilement les disperse vers le haut.
   D'après le hero de Fan Yao v4.
   ═══════════════════════════════════════════════════ */
(function () {
  'use strict';
  var root = document.documentElement;
  var FX = window.FX || { RM: false, FINE: true, onReady: function (f) { f(); } };
  var host = document.getElementById('hero-gl'), hero = document.getElementById('hero-index');
  var THREE = window.THREE, gsap = window.gsap;
  function fail() { root.classList.add('fx-no-gl'); }
  if (!host || !hero || !THREE) { fail(); return; }

  var renderer;
  try {
    renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true, powerPreference: 'high-performance' });
    if (!renderer.getContext()) throw new Error('no gl');
  } catch (e) { fail(); return; }
  root.classList.add('fx-gl-ok');

  var small = window.innerWidth * window.innerHeight < 600000;
  var N = (FX.FINE && !small) ? 20000 : 8000;
  var dpr = Math.min(window.devicePixelRatio || 1, 2);
  renderer.setPixelRatio(dpr);
  renderer.setClearColor(0x000000, 0);
  host.appendChild(renderer.domElement);
  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
  camera.position.z = 10;

  /* ── Attributs : forme de départ/arrivée (aA/aB), leurs couleurs (cA/cB), sphère d'entrée, aléa ── */
  var aA = new Float32Array(N * 3), aB = new Float32Array(N * 3), cA = new Float32Array(N * 3), cB = new Float32Array(N * 3);
  var aS = new Float32Array(N * 3), aR = new Float32Array(N * 4);
  for (var i = 0; i < N; i++) {
    var u = Math.random() * 2 - 1, th = Math.random() * Math.PI * 2, r = 9 + Math.random() * 14, s = Math.sqrt(1 - u * u);
    aS[i * 3] = Math.cos(th) * s * r; aS[i * 3 + 1] = Math.sin(th) * s * r - 6; aS[i * 3 + 2] = u * r * 0.6 - 4;
    aR[i * 4] = Math.random(); aR[i * 4 + 1] = Math.random(); aR[i * 4 + 2] = Math.random(); aR[i * 4 + 3] = Math.random();
  }
  var geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(aS, 3));
  var attA = new THREE.BufferAttribute(aA, 3), attB = new THREE.BufferAttribute(aB, 3);
  var attCA = new THREE.BufferAttribute(cA, 3), attCB = new THREE.BufferAttribute(cB, 3);
  geo.setAttribute('aA', attA); geo.setAttribute('aB', attB);
  geo.setAttribute('cA', attCA); geo.setAttribute('cB', attCB);
  geo.setAttribute('aS', new THREE.BufferAttribute(aS, 3));
  geo.setAttribute('aR', new THREE.BufferAttribute(aR, 4));

  var U = {
    uTime: { value: 0 }, uMix: { value: 1 }, uIntro: { value: FX.RM ? 1 : 0 }, uScatter: { value: 0 },
    uScale: { value: 6 }, uOffset: { value: new THREE.Vector2(2, 0.3) }, uSize: { value: 2.6 }, uPR: { value: dpr },
    uMouse: { value: new THREE.Vector3(99, 99, 0) }, uShockT: { value: -10 }, uShockP: { value: new THREE.Vector3() },
    uBlow: { value: new Float32Array(48) }
  };

  var vert = [
    'attribute vec3 aA; attribute vec3 aB; attribute vec3 cA; attribute vec3 cB; attribute vec3 aS; attribute vec4 aR;',
    'uniform float uTime, uMix, uIntro, uScatter, uScale, uSize, uPR, uShockT;',
    'uniform vec2 uOffset; uniform vec3 uMouse, uShockP;',
    'uniform vec4 uBlow[12];',
    'varying float vGlow; varying float vAlpha; varying vec3 vCol; varying float vAsh; varying float vFlick; varying float vStoke; varying float vTongue; varying float vHeat;',
    'void main() {',
    '  float st = aR.w;',
    '  float m = clamp((uMix - st * 0.35) / 0.65, 0.0, 1.0); m = m * m * (3.0 - 2.0 * m);',
    '  vec3 p = mix(aA, aB, m);',
    '  vCol = mix(cA, cB, m);',
    '  p.xy = p.xy * uScale + uOffset; p.z *= uScale;',
    '  float mid = sin(m * 3.14159);',
    '  p += (aR.xyz - 0.5) * mid * vec3(2.6, 2.6, 4.0);',
    '  p.y += mid * aR.x * 1.6;',                                     /* pendant la métamorphose, ça monte comme des flammes */
    '  float ii = clamp((uIntro - st * 0.45) / 0.55, 0.0, 1.0); ii = 1.0 - pow(1.0 - ii, 3.0);',
    '  p = mix(aS, p, ii);',
    '  float t = uTime;',
    '  vAsh = step(0.86, aR.y);',                                     /* ~14 % de cendres */
    /* attiser : le passage de la souris (sillage des 12 derniers mouvements) ravive le feu autour */
    '  float stoke = 0.0;',
    '  for (int k = 0; k < 12; k++) {',
    '    vec2 q = p.xy - uBlow[k].xy;',
    '    stoke += length(uBlow[k].zw) * exp(-dot(q, q) * 1.4);',
    '  }',
    '  vec2 dm = p.xy - uMouse.xy;',
    '  stoke += exp(-dot(dm, dm) * 1.6) * 0.35;',                       /* le simple survol entretient la braise */
    '  stoke = clamp(stoke, 0.0, 1.6);',
    '  float sk = smoothstep(0.05, 0.8, stoke);',
    '  vStoke = sk;',
    /* attisées, les braises du corps s'embrasent aussi en langues de feu */
    '  vTongue = max(step(0.70, aR.z), step(0.25, aR.z) * sk) * (1.0 - vAsh);',
    '  p.z += sin(t * 0.6 + aR.z * 20.0) * 0.12;',
    /* langues de feu : nées sur la forme, elles montent en ondulant, rétrécissent et s'éteignent, en boucle ;
       attisées, elles brûlent plus vite (cycle 2 à 3 fois plus court) et montent plus haut */
    '  float lifeSlow = fract(t * (0.55 + aR.x * 0.7) + aR.w * 11.0);',
    '  float lifeFast = fract(t * (1.7 + aR.x * 1.6) + aR.w * 11.0);',
    '  float life = mix(lifeSlow, lifeFast, sk);',
    '  float hgt = vTongue * life * (0.35 + aR.w * 0.6) * (1.0 + sk * 1.4) + (1.0 - vTongue) * (1.0 - vAsh) * life * 0.05;',
    '  p.y += hgt;',
    '  p.x += sin(t * (3.2 + sk * 6.0) + aR.y * 20.0 + p.y * 2.4) * hgt * 0.28 + sin(t * 9.0 + aR.x * 40.0) * hgt * (0.05 + sk * 0.1);',
    '  vHeat = mix(1.0 - life * 0.25, 1.0 - life, vTongue);',
    /* cendres : elles flottent, dérivent, montent lentement — et s'envolent plus vite près du feu attisé */
    '  float rise = fract(t * (0.04 + sk * 0.25) + aR.z);',
    '  p += vAsh * vec3(sin(t * 0.7 + aR.x * 30.0) * 0.25, rise * (0.9 + sk * 1.2) - 0.2, 0.0);',
    '  vFlick = (1.0 - vAsh) * (0.75 + 0.25 * sin(t * (11.0 + aR.x * 14.0 + sk * 20.0) + aR.y * 40.0));',
    '  float age = t - uShockT, ring = 0.0;',
    '  if (age > 0.0 && age < 3.0) {',
    '    float ds = length(p.xy - uShockP.xy);',
    '    ring = exp(-pow(ds - age * 6.0, 2.0) * 1.5) * exp(-age * 1.2);',
    '    p.xy += ((p.xy - uShockP.xy) / (ds + 0.001)) * ring * 0.9; p.z += ring * 2.5;',
    '  }',
    '  p += (aR.xyz - 0.5) * uScatter * vec3(16.0, 6.0, 6.0); p.y += uScatter * (4.0 + st * 10.0); p.z += uScatter * st * 6.0;',
    '  vec4 mv = modelViewMatrix * vec4(p, 1.0);',
    '  gl_Position = projectionMatrix * mv;',
    '  gl_PointSize = min(48.0, uSize * uPR * (0.55 + st * 0.9) * (10.0 / -mv.z));',
    '  vGlow = clamp(ring * 1.5 + mid * 0.6 + (1.0 - ii) * 0.8, 0.0, 1.0);',
    '  vAlpha = (0.75 + 0.6 * aR.y) * (1.0 - uScatter * 0.8) * mix(1.0, 0.45, vAsh);',
    '  gl_PointSize *= mix(1.0, 0.7, vAsh) * mix(1.15, 0.9 + vHeat * 1.5, vTongue) * (1.0 + vStoke * 0.35);',   /* flamme grosse à la base, fine en haut */
    '  vAlpha *= mix(1.0, smoothstep(0.0, 0.35, vHeat), vTongue);',
    '}'
  ].join('\n');
  var frag = [
    'varying float vGlow; varying float vAlpha; varying vec3 vCol; varying float vAsh; varying float vFlick; varying float vStoke; varying float vTongue; varying float vHeat;',
    'void main() {',
    '  vec2 c = gl_PointCoord - 0.5;',
    /* langue de feu : une goutte large en bas, pointue en haut ; braise : un point rond */
    '  float narrow = mix(1.0, 1.7 - c.y * 2.6, vTongue);',
    '  float d = length(vec2(c.x * narrow, c.y * mix(1.0, 0.8, vTongue)));',
    '  if (d > 0.5) discard;',
    '  float a = 1.0 - d * 2.0; a *= a;',
    /* rampe de feu selon la chaleur : blanc-jaune à la base → orange → rouge sombre */
    '  vec3 fire = mix(vec3(0.55, 0.06, 0.02), vec3(0.95, 0.42, 0.06), smoothstep(0.1, 0.55, vHeat));',
    '  fire = mix(fire, vec3(1.0, 0.86, 0.45), smoothstep(0.6, 0.97, vHeat));',
    '  vec3 base = mix(vCol * 1.35, fire, 0.2);',                             /* le lit de braises garde les couleurs de la forme */
    '  vec3 col = mix(base, fire, vTongue);',
    '  col = mix(col, vec3(1.0, 0.9, 0.6), vGlow * 0.6) * (0.6 + 0.6 * vFlick);',
    '  col *= 1.0 + vStoke * 0.7;',                                  /* attisé : plus chaud, plus clair */
    '  col = mix(col, vec3(1.0, 0.93, 0.75), vStoke * vTongue * smoothstep(0.55, 1.0, vHeat) * 0.6);',
    '  col = mix(col, vec3(0.30, 0.28, 0.26), vAsh);',
    '  gl_FragColor = vec4(col, a * vAlpha);',
    '}'
  ].join('\n');

  var mat = new THREE.ShaderMaterial({ uniforms: U, vertexShader: vert, fragmentShader: frag,
    transparent: true, depthWrite: false, depthTest: false, blending: THREE.AdditiveBlending });
  var points = new THREE.Points(geo, mat);
  points.frustumCulled = false;
  scene.add(points);

  /* ── Formes : on dessine dans un canvas et on tire N points dans les pixels pleins (avec leur couleur) ── */
  var FIRE = [[1, 0.82, 0], [0.98, 0.69, 0.23], [0.94, 0.5, 0.12], [0.89, 0.15, 0.12]];
  function fireAt(t) {      /* 0 = haut (jaune) → 1 = bas (rouge) */
    var x = Math.max(0, Math.min(0.999, t)) * (FIRE.length - 1), k = Math.floor(x), f = x - k, a = FIRE[k], b = FIRE[k + 1];
    return [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f, a[2] + (b[2] - a[2]) * f];
  }
  function sample(draw, keepColor) {
    var S = 360, c = document.createElement('canvas'); c.width = c.height = S;
    var g = c.getContext('2d'); g.fillStyle = '#fff'; g.strokeStyle = '#fff';
    draw(g, S);
    var d = g.getImageData(0, 0, S, S).data, pts = [];
    for (var y = 0; y < S; y++) for (var x = 0; x < S; x++) if (d[(y * S + x) * 4 + 3] > 120) pts.push(x, y);
    var pos = new Float32Array(N * 3), col = new Float32Array(N * 3), n = pts.length / 2;
    var y0 = S, y1 = 0;
    for (var q = 1; q < pts.length; q += 2) { if (pts[q] < y0) y0 = pts[q]; if (pts[q] > y1) y1 = pts[q]; }
    for (var k = 0; k < N; k++) {
      var j = n ? Math.floor(Math.random() * n) : 0, px = pts[j * 2] || 0, py = pts[j * 2 + 1] || 0;
      pos[k * 3] = n ? (px + Math.random()) / S - 0.5 : 0;
      pos[k * 3 + 1] = n ? -((py + Math.random()) / S - 0.5) : 0;
      pos[k * 3 + 2] = (Math.random() - 0.5) * 0.06;
      var rgb;
      if (keepColor) { var o = (py * S + px) * 4; rgb = [d[o] / 255, d[o + 1] / 255, d[o + 2] / 255]; }
      else rgb = fireAt((py - y0) / Math.max(1, y1 - y0) + (Math.random() - 0.5) * 0.15);
      col[k * 3] = rgb[0] * 0.75; col[k * 3 + 1] = rgb[1] * 0.75; col[k * 3 + 2] = rgb[2] * 0.75;   /* addition : on tempère */
    }
    return { pos: pos, col: col };
  }
  var LABELS = [{ t: 'Le feu', txt: 'H comme humain' }].concat((window.OH_SHAPES || []).map(function (k) { return { t: k.t, txt: k.txt }; }));
  var shapes = [], cur = 0, morphing = false;
  var lblIdx = document.querySelector('.hero-shape-idx'), lblHan = document.querySelector('.hero-shape-han'), lblTxt = document.querySelector('.hero-shape-txt');
  function setLabel(i, animate) {
    if (!lblHan) return;
    var L = LABELS[i];
    function apply() { lblIdx.textContent = String(i + 1).padStart(2, '0') + ' / ' + String(LABELS.length).padStart(2, '0'); lblHan.textContent = L.t; lblTxt.textContent = L.txt; }
    if (!animate || !gsap) { apply(); return; }
    gsap.to([lblHan, lblTxt], { opacity: 0, y: -12, duration: 0.3, ease: 'power2.in', onComplete: function () {
      apply(); gsap.fromTo([lblHan, lblTxt], { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.6, ease: 'expo.out', stagger: 0.06 });
    } });
  }

  function loadShapes(done) {
    var img = new Image();
    var fontReady = Promise.resolve();
    function rest(first) {
      fontReady.catch(function () {}).then(function () {
        shapes = (first ? [first] : []).concat((window.OH_SHAPES || []).map(function (k) { return sample(k.draw, true); }));
        if (!first) LABELS.shift();
        done();
      });
    }
    img.onload = function () {
      rest(sample(function (g, S) {
        var w = S, h = S * img.height / img.width;
        g.drawImage(img, 0, (S - h) / 2, w, h);
      }, true));
    };
    img.onerror = function () { rest(null); };
    img.src = 'images/logo-h.png';
  }

  function setShape(arr, attr, cArr, cAttr, sh) { arr.set(sh.pos); cArr.set(sh.col); attr.needsUpdate = cAttr.needsUpdate = true; }
  function morphTo(next) {
    if (morphing || shapes.length < 2) return;
    morphing = true;
    setShape(aA, attA, cA, attCA, shapes[cur]); setShape(aB, attB, cB, attCB, shapes[next]);
    U.uMix.value = 0;
    cur = next;
    setLabel(cur, true);
    gsap.to(U.uMix, { value: 1, duration: 2.2, ease: 'power2.inOut', onComplete: function () { morphing = false; } });
  }
  var autoCall = null;
  function scheduleAuto() {
    if (FX.RM || !gsap) return;
    if (autoCall) autoCall.kill();
    autoCall = gsap.delayedCall(5.2, function () { if (visible) morphTo((cur + 1) % shapes.length); scheduleAuto(); });
  }

  /* ── Mise en page selon la taille de l'écran ── */
  var VH = 2 * 10 * Math.tan(22.5 * Math.PI / 180), VW = VH;
  function resize() {
    var w = host.clientWidth || window.innerWidth, h = host.clientHeight || window.innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h; camera.updateProjectionMatrix();
    VW = VH * camera.aspect;
    if (w < 860) {
      U.uScale.value = Math.min(5.4, VW * 1.0);
      U.uOffset.value.set(0, VH * 0.16);
      U.uSize.value = 2.8;
    } else {
      U.uScale.value = Math.min(6.2, VH * 0.72);
      U.uOffset.value.set(VW * 0.17, VH * 0.05);
      U.uSize.value = 3.2;
    }
    if (FX.RM) render();
  }
  window.addEventListener('resize', resize);

  /* ── Souris / doigt ── */
  var target = new THREE.Vector3(99, 99, 0);
  function toWorld(e) {
    var r = host.getBoundingClientRect();
    return new THREE.Vector3(((e.clientX - r.left) / r.width * 2 - 1) * VW / 2, -((e.clientY - r.top) / r.height * 2 - 1) * VH / 2, 0);
  }
  /* attiser : 12 passages récents le long du trajet (position + vitesse), qui retombent doucement */
  var blows = [], blowIdx = 0, lastW = null;
  for (var bI = 0; bI < 12; bI++) blows.push({ x: 99, y: 99, wx: 0, wy: 0 });
  hero.addEventListener('pointermove', function (e) {
    var w = toWorld(e);
    if (lastW) {
      var dx = w.x - lastW.x, dy = w.y - lastW.y, l = Math.hypot(dx, dy);
      if (l > 0.02) {
        var k = Math.min(0.75, l * 1.8) / l;
        blows[blowIdx] = { x: w.x, y: w.y, wx: dx * k, wy: dy * k };
        blowIdx = (blowIdx + 1) % blows.length;
      }
    }
    lastW = w;
    target.copy(w);
  });
  hero.addEventListener('pointerleave', function () { target.set(99, 99, 0); lastW = null; });
  hero.addEventListener('click', function (e) {
    if (e.target.closest('a, button')) return;
    morphTo((cur + 1) % shapes.length); scheduleAuto();
  });

  /* ── Défilement : les braises s'envolent, le texte aussi ── */
  function onScroll() {
    var r = hero.getBoundingClientRect(), p = Math.max(0, Math.min(1, -r.top / Math.max(1, r.height)));
    U.uScatter.value = Math.pow(p, 1.4);
    if (FX.RM) render();
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  if (gsap && window.ScrollTrigger && !FX.RM) {
    gsap.to('.hero-index .hero-content', { yPercent: -35, opacity: 0, ease: 'none',
      scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true } });
  }

  /* ── Boucle ── */
  var visible = true;
  new IntersectionObserver(function (en) { visible = en[0].isIntersecting; }).observe(hero);
  var clock = new THREE.Clock();
  function render() { renderer.render(scene, camera); }
  function loop() {
    requestAnimationFrame(loop);
    if (!visible || document.hidden) { clock.getDelta(); return; }
    var dt = Math.min(0.05, clock.getDelta());
    U.uTime.value += dt;
    U.uMouse.value.lerp(target, 0.12);
    var ub = U.uBlow.value;
    for (var b = 0; b < blows.length; b++) {
      var B = blows[b]; B.wx *= 0.965; B.wy *= 0.965;      /* le feu ravivé retombe en ~1,5 s */
      ub[b * 4] = B.x; ub[b * 4 + 1] = B.y; ub[b * 4 + 2] = B.wx; ub[b * 4 + 3] = B.wy;
    }
    render();
  }

  resize(); onScroll();
  loadShapes(function () {
    setShape(aA, attA, cA, attCA, shapes[0]); setShape(aB, attB, cB, attCB, shapes[0]);
    setLabel(0, false);
    if (FX.RM) { render(); return; }
    loop();
    FX.onReady(function () {
      gsap.to(U.uIntro, { value: 1, duration: 3, ease: 'power2.out' });
      scheduleAuto();
    });
  });
})();
