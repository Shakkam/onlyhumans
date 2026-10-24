// Fonction Vercel : envoie le message du formulaire de contact par e-mail via Resend.
// Variables à définir sur Vercel : RESEND_API_KEY (obligatoire), CONTACT_EMAIL et CONTACT_FROM (facultatives).
// L'adresse de réception reste côté serveur : elle n'apparaît jamais dans le site.
const CONTACT_TO = process.env.CONTACT_EMAIL || 'camille.schoell@gmail.com';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { name, email, message } = req.body || {};
  if (!name || !email || !message) return res.status(400).json({ error: 'Missing fields' });
  if (!process.env.RESEND_API_KEY) return res.status(503).json({ error: 'Email service is not configured' });

  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: `Only Humans <${process.env.CONTACT_FROM || 'onboarding@resend.dev'}>`,
        to: CONTACT_TO,
        reply_to: email,
        subject: `[Only Humans] Message de ${name}`,
        text: `Nom : ${name}\nEmail : ${email}\n\n${message}`,
      }),
    });
    if (!r.ok) throw new Error(await r.text());
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Send failed' });
  }
}
