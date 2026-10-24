/* ═══════════════════════════════════════════════════
   ONLY HUMANS · silhouettes d'instruments pour le hero en particules
   Chaque fonction dessine dans un carré S×S (repère u = S/100) ;
   les couleurs posées ici sont celles que prennent les particules.
   ═══════════════════════════════════════════════════ */
(function () {
  'use strict';
  var PI = Math.PI;
  function cut(g, fn) { g.save(); g.globalCompositeOperation = 'destination-out'; g.fillStyle = '#000'; g.strokeStyle = '#000'; fn(); g.restore(); }
  function smoothPath(g, pts) {   /* courbe lisse passant par le milieu de chaque segment */
    var n = pts.length, m = function (i) { var p = pts[i % n], q = pts[(i + 1) % n]; return [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2]; };
    var s0 = m(n - 1);
    g.beginPath(); g.moveTo(s0[0], s0[1]);
    for (var i = 0; i < n; i++) { var c = pts[i], e = m(i); g.quadraticCurveTo(c[0], c[1], e[0], e[1]); }
    g.closePath();
  }
  function fireV(g, y0, y1) {
    var gr = g.createLinearGradient(0, y0, 0, y1);
    gr.addColorStop(0, '#ffd200'); gr.addColorStop(0.5, '#f7931e'); gr.addColorStop(1, '#e3261f');
    return gr;
  }

  /* Gibson Les Paul : simple pan coupé, table sunburst, tête « livre ouvert » */
  function lesPaul(g, S) {
    var u = S / 100;
    g.save(); g.translate(S * 0.5, S * 0.5); g.rotate(-0.6); g.scale(u * 0.84, u * 0.84); g.translate(0, 15);   /* centré sur toute la longueur */
    var sb = g.createRadialGradient(-2, 16, 2, 0, 12, 22);
    sb.addColorStop(0, '#ffd84a'); sb.addColorStop(0.55, '#f0801e'); sb.addColorStop(1, '#a3160c');
    g.fillStyle = sb;
    g.beginPath();
    g.moveTo(-3.5, -7);
    g.bezierCurveTo(-11, -9, -15, -1, -13, 5);       /* épaule gauche (côté basses) */
    g.bezierCurveTo(-20, 10, -21, 26, -12, 32);      /* bas du corps */
    g.bezierCurveTo(-5, 36, 5, 36, 12, 32);
    g.bezierCurveTo(21, 26, 20, 10, 12, 5);
    g.bezierCurveTo(14, 1, 13, -4, 10, -5);          /* pointe du pan coupé */
    g.bezierCurveTo(8, -1, 5, -2, 3.5, -7);          /* le creux */
    g.closePath(); g.fill();
    g.fillStyle = '#e9b465';
    g.fillRect(-2.6, -50, 5.2, 45);                  /* manche */
    g.beginPath();                                   /* tête */
    g.moveTo(-3.2, -49); g.lineTo(-5.4, -61); g.quadraticCurveTo(-2.5, -63, 0, -60.5); g.quadraticCurveTo(2.5, -63, 5.4, -61); g.lineTo(3.2, -49); g.closePath(); g.fill();
    cut(g, function () {
      g.fillRect(-6.5, 6, 13, 4); g.fillRect(-6.5, 16, 13, 4);            /* deux humbuckers */
      g.fillRect(-5, 24, 10, 1.4);                                      /* chevalet */
      [[9, 22], [12, 26], [8, 28], [11, 31]].forEach(function (k) { g.beginPath(); g.arc(k[0], k[1], 1.3, 0, PI * 2); g.fill(); });   /* potards */
      for (var f = -46; f < -8; f += 4.2) g.fillRect(-2.6, f, 5.2, 0.5);  /* frettes */
    });
    g.restore();
  }

  /* La 7 cordes rouge, contour relevé point par point sur la photo du groupe
     (1 unité ≈ 10 px de la photo, origine au talon du manche) : cornes pointues avec leur cran,
     flancs creusés, évasement, bas en trois pointes, tête en voile, liane incrustée */
  var G7_OUTLINE = [[-3.3, 0.5], [-5.5, -2], [-8.5, -4.5], [-10.5, -7.5], [-11.7, -9.8], [-12.4, -10.2], [-13.5, -6], [-15, -1.5],
    [-15.6, 0], [-13, 4], [-11, 10], [-11.3, 16], [-14.5, 22], [-17, 28], [-17.7, 34], [-16.6, 39.6], [-9.5, 42], [-0.5, 45.6],
    [8.5, 42], [15.6, 40], [17, 33], [16.5, 26], [13, 18], [10.5, 11], [10.5, 6], [12.5, 1], [14, -2], [15.2, -4.8], [12, -2.5],
    [8.5, 1], [5.5, 2.5], [3.4, 2]];
  var G7_HEAD = [[-3.2, -45.5], [-3.3, -47.5], [2.3, -59.8], [5.4, -61], [4.6, -58], [4, -48], [3.4, -45.5]];
  function polyPath(g, pts, smooth) {
    if (!smooth) { g.beginPath(); g.moveTo(pts[0][0], pts[0][1]); for (var i = 1; i < pts.length; i++) g.lineTo(pts[i][0], pts[i][1]); g.closePath(); return; }
    smoothPath(g, pts);
  }
  function red7(g, S) {
    var u = S / 100;
    g.save(); g.translate(S * 0.5, S * 0.5); g.rotate(-0.22); g.scale(u * 0.86, u * 0.86); g.translate(0, 8.5);   /* centré sur toute la longueur */
    var red = g.createLinearGradient(-18, -10, 18, 44);
    red.addColorStop(0, '#ff4f7a'); red.addColorStop(0.5, '#ec1846'); red.addColorStop(1, '#a50c2e');
    g.fillStyle = red;
    polyPath(g, G7_OUTLINE, false); g.fill();          /* angles vifs : c'est sa signature */
    g.fillStyle = '#b8283c';
    g.fillRect(-3.3, -45.5, 6.6, 47);                 /* manche (7 cordes) */
    polyPath(g, G7_HEAD, false); g.fill();            /* tête en voile */
    g.fillStyle = '#ffd7a8';                          /* les 7 mécaniques : 3 à gauche, 4 à droite */
    [[-1.2, -55.5], [-2.4, -52.5], [-3.5, -49.5]].forEach(function (k) { g.fillRect(k[0] - 2.4, k[1], 2.4, 1.1); });
    [[4.7, -57.5], [4.4, -54.5], [4.2, -51.5], [4, -48.5]].forEach(function (k) { g.fillRect(k[0], k[1], 2.4, 1.1); });
    g.strokeStyle = '#ffe2b0'; g.lineWidth = 0.9; g.lineCap = 'round';   /* la liane incrustée */
    g.beginPath();
    for (var y = -43; y <= -1; y += 1) { var x = Math.sin(y * 0.32) * 1.8; if (y === -43) g.moveTo(x, y); else g.lineTo(x, y); }
    g.stroke();
    cut(g, function () {
      g.fillRect(-6, 6.5, 11, 5); g.fillRect(-6, 15.5, 11, 4.5);         /* deux humbuckers */
      g.fillRect(-5.3, 22, 9.6, 3.5);                                   /* chevalet fixe */
      [[8.2, 20.5], [12.5, 29.5]].forEach(function (k) { g.beginPath(); g.arc(k[0], k[1], 1.2, 0, PI * 2); g.fill(); });
      g.fillRect(10.5, 24, 1.1, 2.4);                                   /* sélecteur */
      g.lineWidth = 0.28;
      for (var s2 = 0; s2 < 7; s2++) { var x2 = -2.7 + s2 * 0.9; g.beginPath(); g.moveTo(x2, -45); g.lineTo(x2 * 1.5, 23); g.stroke(); }   /* 7 cordes */
      for (var f = -42; f < 1; f += 3.4) g.fillRect(-3.3, f, 6.6, 0.4);
    });
    g.restore();
  }

  /* Basse headless 5 cordes (type Marcus Miller), contour relevé point par point sur la photo du groupe
     (1 unité ≈ 6 px de la photo, origine au talon du manche) : corne en croissant fin côté graves,
     petite corne côté aigus, ventre bas et rebondi, mécaniques sous le chevalet */
  var BASS_OUTLINE = [[-2.5, 0.8], [-6.7, -4.2], [-10.8, -10.8], [-10.8, -16.2], [-9.7, -17.4], [-11.6, -18.2], [-14.5, -14],
    [-15.8, -7.5], [-14.6, -1.7], [-14.5, 4], [-17.5, 12], [-19.5, 22.5], [-17.5, 33], [-12, 39], [-7.5, 41], [4, 40.5],
    [15.8, 37.5], [18.8, 25.8], [15.8, 15.8], [10.8, 7.5], [12.5, 3], [15.5, 0.8], [14.2, -2.2], [11.5, -0.5], [9.2, 1.7], [3.3, 5.8]];
  function headlessBass(g, S) {
    var u = S / 100;
    g.save(); g.translate(S * 0.5, S * 0.5); g.rotate(-0.22); g.scale(u * 0.78, u * 0.78); g.translate(0, 18.5);   /* centré sur toute la longueur */
    var wood = g.createLinearGradient(-18, -18, 18, 40);
    wood.addColorStop(0, '#f26a2e'); wood.addColorStop(0.6, '#dc4a1e'); wood.addColorStop(1, '#b02c14');
    g.fillStyle = wood;
    smoothPath(g, BASS_OUTLINE); g.fill();
    g.fillStyle = '#c0582c';
    g.fillRect(-3.2, -76, 6.4, 78);                   /* très long manche */
    g.fillStyle = '#f2a33a';
    g.fillRect(-4, -79.5, 8, 4);                      /* pièce de tête (sans tête) */
    for (var t = 0; t < 5; t++) g.fillRect(-4.4 + t * 2.1, 32, 1.5, 10);   /* 5 mécaniques sous le chevalet */
    cut(g, function () {
      g.fillRect(-7, 14.7, 14, 4); g.fillRect(-7, 21.5, 14, 4);        /* deux micros */
      [[11.2, 19.2], [13.3, 23], [14.2, 26.7], [11.7, 33.3]].forEach(function (k) { g.beginPath(); g.arc(k[0], k[1], 1.3, 0, PI * 2); g.fill(); });   /* potards */
      g.lineWidth = 0.4;
      for (var s2 = 0; s2 < 5; s2++) { var x = -2.3 + s2 * 1.15; g.beginPath(); g.moveTo(x, -75); g.lineTo(x * 1.6, 31); g.stroke(); }   /* 5 cordes */
      for (var f = -72; f < 0; f += 5) g.fillRect(-3.2, f, 6.4, 0.5);
    });
    g.restore();
  }

  /* Batterie : grosse caisse, deux toms, caisse claire, tom basse, charleston, crash, ride */
  function drums(g, S) {
    var u = S / 100;
    g.save(); g.scale(u, u); g.lineCap = 'round';
    g.fillStyle = fireV(g, 15, 85); g.strokeStyle = g.fillStyle;
    g.lineWidth = 1.4;
    [[18, 37, 18, 86], [86, 28, 86, 86], [69, 34, 74, 86]].forEach(function (l) { g.beginPath(); g.moveTo(l[0], l[1]); g.lineTo(l[2], l[3]); g.stroke(); });   /* pieds */
    g.beginPath(); g.ellipse(18, 36, 12, 2.4, -0.05, 0, PI * 2); g.fill();          /* charleston */
    g.beginPath(); g.ellipse(18, 39, 12, 2.2, -0.05, 0, PI * 2); g.fill();
    g.beginPath(); g.ellipse(84, 26, 14, 2.6, 0.15, 0, PI * 2); g.fill();           /* crash */
    g.beginPath(); g.ellipse(70, 33, 12, 2.2, -0.12, 0, PI * 2); g.fill();          /* ride */
    g.beginPath(); g.arc(50, 64, 19, 0, PI * 2); g.fill();                          /* grosse caisse */
    g.beginPath(); g.ellipse(40, 41, 8, 6.5, -0.2, 0, PI * 2); g.fill();            /* toms */
    g.beginPath(); g.ellipse(60, 41, 8, 6.5, 0.2, 0, PI * 2); g.fill();
    g.fillRect(19, 54, 18, 8); g.beginPath(); g.ellipse(28, 54, 9, 2.6, 0, 0, PI * 2); g.fill();   /* caisse claire */
    g.fillRect(72, 56, 16, 20); g.beginPath(); g.ellipse(80, 56, 8, 2.4, 0, 0, PI * 2); g.fill();  /* tom basse */
    cut(g, function () {
      g.lineWidth = 1.2;
      g.beginPath(); g.arc(50, 64, 15.5, 0, PI * 2); g.stroke();                   /* cercle de la peau */
      g.beginPath(); g.arc(50, 64, 5, 0, PI * 2); g.fill();                        /* l'évent */
      g.beginPath(); g.ellipse(40, 41, 5.5, 4, -0.2, 0, PI * 2); g.stroke();
      g.beginPath(); g.ellipse(60, 41, 5.5, 4, 0.2, 0, PI * 2); g.stroke();
      g.fillRect(19, 57.5, 18, 0.8); g.fillRect(72, 63, 16, 0.8);
    });
    g.restore();
  }

  /* Micro dynamique : grille ronde, corps effilé, câble */
  function micro(g, S) {
    var u = S / 100;
    g.save(); g.translate(S * 0.5, S * 0.5); g.rotate(0.5); g.scale(u, u);
    g.fillStyle = fireV(g, -42, 40); g.strokeStyle = g.fillStyle;
    g.beginPath(); g.arc(0, -26, 15, 0, PI * 2); g.fill();                         /* grille */
    g.beginPath();                                                                  /* corps */
    g.moveTo(-10, -14); g.lineTo(-5.5, 30); g.quadraticCurveTo(0, 33, 5.5, 30); g.lineTo(10, -14); g.closePath(); g.fill();
    g.lineWidth = 2.4; g.lineCap = 'round';
    g.beginPath(); g.moveTo(0, 31); g.bezierCurveTo(0, 44, 18, 40, 22, 50); g.stroke();   /* câble */
    cut(g, function () {
      g.lineWidth = 0.9;
      for (var k = -38; k < -12; k += 3.4) { g.beginPath(); g.moveTo(-15, k); g.lineTo(15, k); g.stroke(); }   /* maillage */
      for (var j = -12; j <= 12; j += 3.4) { g.beginPath(); g.moveTo(j, -42); g.lineTo(j, -10); g.stroke(); }
      g.fillRect(-11, -13.5, 22, 1.6);                                              /* bague */
    });
    g.restore();
  }

  /* Piano numérique type Clavinova : meuble, pupitre, clavier, montants et pédalier */
  function clavinova(g, S) {
    var u = S / 100;
    g.save(); g.scale(u, u);
    g.fillStyle = fireV(g, 22, 84);
    g.fillRect(34, 22, 32, 9);                       /* pupitre */
    g.fillRect(6, 31, 88, 9);                        /* couvercle / meuble */
    g.fillStyle = '#fff2d2';
    g.fillRect(8, 40, 84, 12);                       /* clavier */
    g.fillStyle = fireV(g, 22, 84);
    g.fillRect(6, 52, 88, 5);                        /* façade */
    g.fillRect(9, 57, 6, 26); g.fillRect(85, 57, 6, 26);   /* montants */
    g.fillRect(15, 63, 70, 3);                       /* traverse */
    g.fillRect(40, 78, 20, 4);                       /* pédalier */
    cut(g, function () {
      var n = 28, w = 84 / n;
      for (var k = 1; k < n; k++) g.fillRect(8 + k * w - 0.25, 40, 0.5, 12);       /* séparations des touches blanches */
      var pat = [1, 1, 0, 1, 1, 1, 0];
      for (var b = 0; b < n - 1; b++) if (pat[b % 7]) g.fillRect(8 + (b + 1) * w - w * 0.3, 40, w * 0.6, 7);   /* touches noires en creux */
      g.fillRect(43, 76, 2, 2); g.fillRect(49, 76, 2, 2); g.fillRect(55, 76, 2, 2);
    });
    g.restore();
  }

  window.OH_SHAPES = [
    { t: 'Gibson Les Paul', txt: 'Le gras, le sustain', draw: lesPaul },
    { t: 'La 7 cordes', txt: 'Rouge vif, une corde de plus pour cogner', draw: red7 },
    { t: 'Basse headless', txt: '5 cordes, le groove sans tête', draw: headlessBass },
    { t: 'La batterie', txt: 'Le cœur qui bat', draw: drums },
    { t: 'Le micro', txt: 'Quatre voix, un seul feu', draw: micro },
    { t: 'Le clavier', txt: 'Toutes les couleurs du son', draw: clavinova }
  ];
})();
