# Only Humans — site du groupe

Site statique (HTML/CSS/JS, sans build) : Accueil, Groupe, Musique, Concerts, Médias, Contact.
Effets : GSAP + ScrollTrigger, Lenis, Three.js (hero en particules de feu), chargés depuis des CDN.

## Lancer en local

```
python -m http.server 8137
```
puis ouvrir http://127.0.0.1:8137

## Modifier le contenu

- **Concerts, membres, morceaux** : `data.js`. Un concert passe tout seul de « à venir » à « déjà joués » le lendemain de sa date.
- **Formes du hero** (instruments) : `instruments.js`.
- **Photos** : `images/photos/` — uniquement le groupe, jamais le public.

## Formulaire de contact (Vercel)

La fonction `api/contact.js` envoie les messages via [Resend](https://resend.com).
Variables d'environnement à définir sur Vercel :

- `RESEND_API_KEY` (obligatoire)
- `CONTACT_EMAIL` (adresse de réception, facultative)
- `CONTACT_FROM` (expéditeur vérifié sur Resend, facultatif)
