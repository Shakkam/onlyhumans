/* ═══════════════════════════════════════════════════
   ONLY HUMANS · contenu modifiable
   Ajouter un concert = ajouter une ligne dans SHOWS : il passe tout seul
   de « à venir » à « déjà joués » le lendemain de la date.
   ═══════════════════════════════════════════════════ */
window.OH = {
  members: [
    { name: 'Camille', role: 'Chant & guitare rythmique', txt: 'Le riff qui tient la baraque, et une voix pour la faire trembler.', wave: 'rhythm' },
    { name: 'Stéphane', role: 'Guitare solo', txt: 'Les solos qui décollent au moment où la salle s’y attend le moins.', wave: 'lead' },
    { name: 'Dominique', role: 'Chant', txt: 'Une voix qui porte jusqu’au fond du bar.', wave: 'voice' },
    { name: 'Ingrid', role: 'Chant', txt: 'Du grain, de la puissance, en duo comme en solo.', wave: 'voice2' },
    { name: 'Caroline', role: 'Claviers', txt: 'Les nappes, les pianos, toutes les couleurs du son.', wave: 'keys' },
    { name: 'Romain', role: 'Batterie', txt: 'Le cœur qui bat. Fort.', wave: 'drums' },
    { name: 'Cathy', role: 'Basse', txt: 'Le grave qui fait bouger les pieds.', wave: 'bass' }
  ],

  /* date au format AAAA-MM-JJ ; month: true = seul le mois est sûr */
  shows: [
    { date: '2026-11-13', city: 'Pessac', venue: 'Jusqu’à la Lune — 26 av. de l’Orient', time: '' },
    { date: '2026-06-20', city: 'Beautiran', venue: 'Concert', image: '' },
    { date: '2026-05-31', city: '', venue: 'La fête des Abeilles', image: '' },
    { date: '2026-05-01', month: true, city: 'Pessac', venue: 'Jusqu’à la Lune', image: '' },
    { date: '2025-12-07', city: '', venue: 'Concert de Noël', image: '' },
    { date: '2025-11-14', city: 'Pessac', venue: 'Jusqu’à la Lune', image: '' },
    { date: '2025-09-18', city: '', venue: 'Soirée privée', image: '' },
    { date: '2025-05-22', city: 'Pessac', venue: 'Jusqu’à la Lune', image: '' },
    { date: '2025-01-01', month: true, city: 'Pessac', venue: 'Jusqu’à la Lune', image: '' },
    { date: '2024-05-30', city: '', venue: 'Soirée privée', image: '' },
    { date: '2024-04-11', city: 'Pessac', venue: 'Jusqu’à la Lune', image: '' },
    { date: '2023-11-23', city: 'Pessac', venue: 'Jusqu’à la Lune · 1re partie : 2-LIMITED', image: 'images/affiche-jusqu-a-la-lune-2023-11-23.jpg' },
    { date: '2023-11-16', city: '', venue: 'Soirée privée', image: 'images/photos/live-01.jpg' }
  ],

  tracks: [
    { title: 'Human', artist: 'Rag’n’Bone Man', src: 'music/human.mp3', note: 'Live' },
    { title: 'Uprising', artist: 'Muse', src: 'music/uprising.mp3', note: 'Live' },
    { title: 'Zombie', artist: 'The Cranberries', src: 'music/zombie.mp3', note: 'Live' },
    { title: 'U-Turn (Lili)', artist: 'Aaron', src: 'music/u-turn.mp3', note: 'Live' }
  ],

  social: {
    instagram: 'https://www.instagram.com/onlyhumansband/',
    facebook: 'https://www.facebook.com/profile.php?id=61552664810133'
  }
};
