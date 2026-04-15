export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { topic, percorso, livello, eta, lingua } = req.body || {};
  if (!topic) return res.status(400).json({ error: 'Missing topic' });

  const KEY = process.env.ANTHROPIC_API_KEY;
  if (!KEY) return res.status(500).json({ error: 'API key not configured on Vercel' });

  const lang = lingua || 'it';
  const isKids = (eta === 'bambino' || eta === 'kids');
  const LANG_NAMES = {it:'italiano',fr:'francese',en:'inglese',es:'spagnolo',wo:'wolof'};
  const langName = LANG_NAMES[lang] || lang;

  const SYSTEM = isKids
    ? `Sei Civetta, guida di FinanzaLand. Parla in ${langName} in modo semplice per bambini. Rispondi SOLO in JSON valido.`
    : `Sei Civetta, assistente AI di FinanzaLand. Rispondi SEMPRE in ${langName}. SOLO JSON valido senza markdown. Copri tutti i continenti e culture.`;

  const PROMPT = `Genera una lezione su "${topic}" per percorso "${percorso}", livello "${livello}", età "${eta}".
Rispondi SOLO con questo JSON:
{
  "id": "${topic.toLowerCase().replace(/\s+/g,'-')}",
  "titolo": "titolo in ${langName}",
  "sottotitolo": "sottotitolo in ${langName}",
  "emoji": "emoji",
  "tempo_minuti": 7,
  "semi_reward": 100,
  "punti_chiave": ["punto 1 in ${langName}", "punto 2", "punto 3", "punto 4"],
  "esempio_pratico": "esempio concreto con numeri in ${langName}",
  "dato_reale": "statistica verificabile in ${langName}",
  "collegamento_africa": "collegamento con Africa o diaspora in ${langName}",
  "sfida_vita_reale": "missione pratica in ${langName}",
  "quiz": [
    {"domanda": "domanda in ${langName}", "opzioni": ["A","B","C","D"], "risposta_corretta": 1, "spiegazione": "spiegazione in ${langName}"},
    {"domanda": "domanda 2 in ${langName}", "opzioni": ["A","B","C","D"], "risposta_corretta": 0, "spiegazione": "spiegazione in ${langName}"}
  ]
}`;

  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {'Content-Type':'application/json','x-api-key':KEY,'anthropic-version':'2023-06-01'},
      body: JSON.stringify({model:'claude-sonnet-4-5',max_tokens:2000,system:SYSTEM,messages:[{role:'user',content:PROMPT}]})
    });
    if (!r.ok) return res.status(502).json({ error: 'Anthropic API error', status: r.status });
    const data = await r.json();
    const raw = (data.content?.[0]?.text||'').replace(/^```json\s*/i,'').replace(/^```/i,'').replace(/```\s*$/,'').trim();
    try {
      const lesson = JSON.parse(raw);
      return res.status(200).json({ success: true, lesson });
    } catch(e) {
      return res.status(500).json({ error: 'Invalid JSON from AI', raw: raw.slice(0,300) });
    }
  } catch(e) {
    return res.status(500).json({ error: e.message });
  }
}
