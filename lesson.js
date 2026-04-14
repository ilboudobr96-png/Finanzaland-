// api/lesson.js — Vercel Serverless Function
// Genera lezioni FinanzaLand via Anthropic Claude API

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { topic, percorso, livello, eta, lingua, lessonId } = req.body || {};
  if (!topic) return res.status(400).json({ error: 'Missing topic' });

  const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY;
  if (!ANTHROPIC_KEY) return res.status(500).json({ error: 'API key not configured' });

  const lang = lingua || 'it';
  const age = eta || 'adulto';
  const isKids = age === 'bambino' || age === 'kids';

  const SYSTEM = isKids
    ? `Sei Civetta, la guida di FinanzaLand. Parla in modo semplice, divertente e con esempi concreti per bambini. Rispondi SOLO in JSON valido. Lingua: ${lang}.`
    : `Sei Civetta, l'assistente AI di FinanzaLand — la più grande accademia finanziaria globale. Sei storico, economista, filosofo, educatore e futurista. Rispondi SOLO in JSON valido senza markdown. Lingua: ${lang}. Copri SEMPRE tutti i continenti, dalla preistoria al 2075. Mai limitarti a un solo paese o cultura.`;

  const USER_PROMPT = `Genera una lezione completa su "${topic}" per il percorso "${percorso}", livello "${livello}", età "${age}".

Rispondi SOLO con questo JSON (nessun testo prima o dopo):
{
  "id": "${lessonId || topic.toLowerCase().replace(/\\s+/g,'-')}",
  "titolo": "titolo della lezione",
  "sottotitolo": "sottotitolo descrittivo",
  "emoji": "emoji rappresentativa",
  "tempo_minuti": 8,
  "semi_reward": 100,
  "punti_chiave": ["punto 1", "punto 2", "punto 3", "punto 4", "punto 5"],
  "esempio_pratico": "esempio concreto con numeri reali",
  "dato_reale": "statistica o dato verificabile recente",
  "collegamento_africa": "collegamento con realtà africana o diaspora",
  "sfida_vita_reale": "missione pratica che l utente può fare questa settimana",
  "quiz": [
    {
      "domanda": "domanda del quiz",
      "opzioni": ["risposta A", "risposta B", "risposta C", "risposta D"],
      "risposta_corretta": 1,
      "spiegazione": "spiegazione della risposta corretta"
    },
    {
      "domanda": "seconda domanda",
      "opzioni": ["risposta A", "risposta B", "risposta C", "risposta D"],
      "risposta_corretta": 0,
      "spiegazione": "spiegazione"
    }
  ]
}`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-5',
        max_tokens: 2000,
        system: SYSTEM,
        messages: [{ role: 'user', content: USER_PROMPT }],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('Anthropic error:', response.status, errText);
      return res.status(502).json({ error: 'Anthropic API error', details: response.status });
    }

    const data = await response.json();
    const rawText = data.content?.[0]?.text || '';

    // Clean JSON — remove markdown fences if present
    const cleaned = rawText
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/```\s*$/i, '')
      .trim();

    let lesson;
    try {
      lesson = JSON.parse(cleaned);
    } catch (parseErr) {
      console.error('JSON parse error:', parseErr.message, '\nRaw:', cleaned.slice(0, 200));
      return res.status(500).json({ error: 'Invalid JSON from AI', raw: cleaned.slice(0, 500) });
    }

    return res.status(200).json({ success: true, lesson });

  } catch (err) {
    console.error('Handler error:', err);
    return res.status(500).json({ error: err.message });
  }
}
