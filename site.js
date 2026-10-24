/* ═══════════════════════════════════════════════════
   ONLY HUMANS · comportements du site (sans effets)
   Menu mobile · concerts · compte à rebours · visionneuse · formulaire
   ═══════════════════════════════════════════════════ */
(function () {
  'use strict';
  var OH = window.OH || { shows: [] };
  var MONTHS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
  var MON3 = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];
  var DAYS = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];

  function esc(s) { return String(s || '').replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function parse(d) { var p = d.split('-'); return new Date(+p[0], +p[1] - 1, +p[2]); }
  function fmt(s) {
    var d = parse(s.date);
    return s.month ? MONTHS[d.getMonth()] + ' ' + d.getFullYear() : d.getDate() + ' ' + MONTHS[d.getMonth()] + ' ' + d.getFullYear();
  }

  /* ── Menu mobile ── */
  var burger = document.querySelector('.nav-burger'), mob = document.getElementById('mobile-nav');
  if (burger && mob) {
    burger.addEventListener('click', function () {
      var open = mob.hidden;
      mob.hidden = !open;
      burger.setAttribute('aria-expanded', String(open));
    });
    mob.addEventListener('click', function (e) { if (e.target.closest('a')) { mob.hidden = true; burger.setAttribute('aria-expanded', 'false'); } });
  }

  /* ── Concerts : à venir / déjà joués, d'après la date ── */
  var today = new Date(); today.setHours(0, 0, 0, 0);
  var upcoming = OH.shows.filter(function (s) { return parse(s.date) >= today; }).sort(function (a, b) { return parse(a.date) - parse(b.date); });
  var past = OH.shows.filter(function (s) { return parse(s.date) < today; }).sort(function (a, b) { return parse(b.date) - parse(a.date); });
  window.OH.upcoming = upcoming; window.OH.past = past;

  function nextShowHTML(s) {
    var d = parse(s.date);
    return '<div class="next-show-date"><b class="fire-text">' + d.getDate() + '</b><small>' + MON3[d.getMonth()] + ' ' + d.getFullYear() + '</small></div>' +
      '<div><p class="eyebrow">Prochain concert · ' + DAYS[d.getDay()] + '</p>' +
      '<p class="next-show-place">' + esc(s.venue.split(' — ')[0]) + '</p>' +
      '<p class="next-show-meta">' + esc([s.city, s.venue.split(' — ')[1], s.time].filter(Boolean).join(' · ')) + '</p></div>' +
      '<div class="countdown" data-date="' + s.date + '" aria-label="Compte à rebours">' +
      '<div><b data-u="d">--</b><span>jours</span></div><div><b data-u="h">--</b><span>heures</span></div>' +
      '<div><b data-u="m">--</b><span>min</span></div><div><b data-u="s">--</b><span>sec</span></div></div>';
  }
  document.querySelectorAll('[data-next-show]').forEach(function (box) {
    if (!upcoming.length) { box.innerHTML = '<div><p class="eyebrow">Sur scène</p><p class="next-show-place">Prochaines dates bientôt annoncées</p></div>'; return; }
    box.innerHTML = nextShowHTML(upcoming[0]);
  });
  /* compte à rebours jusqu'à 20 h 30 le jour J (heure du concert si elle est connue) */
  document.querySelectorAll('.countdown').forEach(function (c) {
    var s = upcoming[0], d = parse(c.getAttribute('data-date')), m = /(\d{1,2})\s*h\s*(\d{2})?/.exec(s.time || '');
    d.setHours(m ? +m[1] : 20, m && m[2] ? +m[2] : 30, 0, 0);
    var cells = {}; c.querySelectorAll('[data-u]').forEach(function (b) { cells[b.getAttribute('data-u')] = b; });
    function tick() {
      var ms = Math.max(0, d - Date.now()), t = Math.floor(ms / 1000);
      cells.d.textContent = String(Math.floor(t / 86400));
      cells.h.textContent = String(Math.floor(t % 86400 / 3600)).padStart(2, '0');
      cells.m.textContent = String(Math.floor(t % 3600 / 60)).padStart(2, '0');
      cells.s.textContent = String(t % 60).padStart(2, '0');
    }
    tick(); setInterval(tick, 1000);
  });

  var list = document.getElementById('past-shows');
  if (list) {
    list.innerHTML = past.map(function (s) {
      var img = s.image
        ? '<figure class="gallery-item fx-view"><img src="' + esc(s.image) + '" alt="' + esc(s.venue) + '" loading="lazy"></figure>'
        : '<div class="show-card-noimg" aria-hidden="true"><b class="fire-text">' + (s.month ? MON3[parse(s.date).getMonth()] : parse(s.date).getDate()) + '</b><small>' + (s.month ? '' : MON3[parse(s.date).getMonth()] + ' ') + parse(s.date).getFullYear() + '</small></div>';
      return '<article class="show-card">' + img + '<div class="show-card-body"><p class="show-card-date">' + fmt(s) + '</p>' +
        '<h3 class="show-card-place">' + esc(s.city || s.venue) + '</h3>' +
        (s.city ? '<p class="show-card-venue">' + esc(s.venue) + '</p>' : '') + '</div></article>';
    }).join('');
    var count = document.getElementById('past-count');
    if (count) count.textContent = String(past.length).padStart(2, '0');
  }
  var more = document.getElementById('upcoming-more');
  if (more && upcoming.length > 1) {
    more.innerHTML = '<p class="eyebrow" style="margin:2.5rem 0 1rem">Aussi à venir</p>' + upcoming.slice(1).map(function (s) {
      return '<p class="next-show-meta"><b style="color:var(--c-bone)">' + fmt(s) + '</b> — ' + esc([s.city, s.venue].filter(Boolean).join(' · ')) + '</p>';
    }).join('');
  }

  /* ── Visionneuse photo ── */
  var items = Array.prototype.slice.call(document.querySelectorAll('[data-lightbox] .gallery-item img'));
  if (items.length) {
    var lb = document.createElement('div');
    lb.className = 'lightbox'; lb.hidden = true; lb.setAttribute('role', 'dialog'); lb.setAttribute('aria-label', 'Photo');
    lb.innerHTML = '<img alt=""><button class="lb-close" aria-label="Fermer">✕</button><button class="lb-prev" aria-label="Photo précédente">‹</button><button class="lb-next" aria-label="Photo suivante">›</button>';
    document.body.appendChild(lb);
    var big = lb.querySelector('img'), idx = 0;
    function show(i) { idx = (i + items.length) % items.length; big.src = items[idx].src; big.alt = items[idx].alt; }
    function close() { lb.hidden = true; if (window.FX && FX.lenis) FX.lenis.start(); }
    items.forEach(function (im, i) {
      im.parentNode.setAttribute('tabindex', '0');
      im.parentNode.addEventListener('click', function () { show(i); lb.hidden = false; if (window.FX && FX.lenis) FX.lenis.stop(); lb.querySelector('.lb-close').focus(); });
      im.parentNode.addEventListener('keydown', function (e) { if (e.key === 'Enter') im.parentNode.click(); });
    });
    lb.querySelector('.lb-close').addEventListener('click', close);
    lb.querySelector('.lb-prev').addEventListener('click', function () { show(idx - 1); });
    lb.querySelector('.lb-next').addEventListener('click', function () { show(idx + 1); });
    lb.addEventListener('click', function (e) { if (e.target === lb) close(); });
    document.addEventListener('keydown', function (e) {
      if (lb.hidden) return;
      if (e.key === 'Escape') close(); if (e.key === 'ArrowLeft') show(idx - 1); if (e.key === 'ArrowRight') show(idx + 1);
    });
  }

  /* ── Formulaire de contact (fonction /api/contact sur Vercel) ── */
  var form = document.getElementById('contact-form');
  if (form) {
    var status = form.querySelector('.form-status'), btn = form.querySelector('button[type="submit"]');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      btn.disabled = true; status.className = 'form-status'; status.textContent = 'Envoi…';
      var data = { name: form.name.value, email: form.email.value, message: form.message.value };
      fetch('/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
        .then(function (r) { if (!r.ok) throw new Error(r.status); form.reset(); status.className = 'form-status ok'; status.textContent = 'Message envoyé. On vous répond vite !'; })
        .catch(function () { status.className = 'form-status err'; status.textContent = 'L’envoi a échoué. Écrivez-nous sur Instagram ou Facebook.'; })
        .then(function () { btn.disabled = false; });
    });
  }

  var y = document.getElementById('year'); if (y) y.textContent = new Date().getFullYear();
})();
