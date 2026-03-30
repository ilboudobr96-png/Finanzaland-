export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const API_KEY = process.env.ANTHROPIC_API_KEY;
  if (!API_KEY) {
    return res.status(500).json({ error: 'ANTHROPIC_API_KEY non configurata' });
  }

  const { topic, livello, eta, lingua, percorso, lessonId } = req.body || {};
  if (!topic) return res.status(400).json({ error: 'topic richiesto' });

  const LANG = { it:'italiano', fr:'francese', en:'inglese', es:'spagnolo', wo:'wolof' };
  const lingua_nome = LANG[lingua] || 'italiano';

  const ETA_PROMPT = {
    bambino: 'Per bambini 6-12 anni: linguaggio semplice, esempi con caramelle/paghetta, frasi brevi.',
    adolescente: 'Per ragazzi 13-17 anni: esempi concreti, linguaggio diretto, dati reali.',
    adulto: 'Per adulti: linguaggio professionale, dati finanziari reali, esempi pratici.',
  };

  const LIVELLO_PROMPT = {
    base: 'Livello BASE: concetti fondamentali, zero gergo tecnico.',
    medio: 'Livello MEDIO: approfondimenti, qualche termine tecnico spiegato.',
    avanzato: 'Livello AVANZATO: tecniche professionali, formule, dati reali.',
    esperto: 'Livello ESPERTO: analisi avanzata, modelli finanziari.',
    master: 'Livello MASTER: livello universitario, teoria economica.',
  };

  const systemPrompt = `Sei il Professore Finan di FinanzaLand, gioco educativo finanziario.
${ETA_PROMPT[eta] || ETA_PROMPT.adulto}
${LIVELLO_PROMPT[livello] || LIVELLO_PROMPT.base}
Lingua: ${lingua_nome}.
Rispondi SOLO con un oggetto JSON valido, niente altro.
Includi dati reali. Aggiungi riferimenti BRVM quando rilevante.`;

  const userPrompt = `Crea una lezione su: "${topic}" nel percorso "${percorso || 'finanza'}".

JSON esatto:
{
  "id": "${lessonId || topic.toLowerCase().replace(/\s+/g,'-')}",
  "titolo": "Titolo breve",
  "sottotitolo": "Frase motivante",
  "emoji": "emoji",
  "colore": "#hexcolor",
  "livello": "${livello || 'base'}",
  "eta": "${eta || 'adulto'}",
  "tempo_minuti": 5,
  "punti_chiave": ["Punto 1", "Punto 2", "Punto 3"],
  "esempio_pratico": "Esempio concreto",
  "dato_reale": "Statistica verificabile",
  "collegamento_africa": null,
  "quiz": [
    {"domanda": "Domanda 1", "opzioni": ["A","B","C","D"], "risposta_corretta": 0, "spiegazione": "Spiegazione"},
    {"domanda": "Domanda 2", "opzioni": ["A","B","C","D"], "risposta_corretta": 1, "spiegazione": "Spiegazione"},
    {"domanda": "Domanda 3", "opzioni": ["A","B","C","D"], "risposta_corretta": 2, "spiegazione": "Spiegazione"}
  ],
  "sfida_vita_reale": "Cosa fare questa settimana",
  "semi_reward": 100,
  "disclaimer": "Solo a scopo educativo"
}`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-5',
        max_tokens: 1500,
        system: systemPrompt,
        messages: [{ role: 'user', content: userPrompt }],
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      return res.status(response.status).json({ success: false, error: data });
    }

    const text = data.content?.[0]?.text || '';
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('JSON non trovato nella risposta');

    const lesson = JSON.parse(jsonMatch[0]);
    lesson.generated_at = new Date().toISOString();

    return res.status(200).json({ success: true, lesson });

  } catch (err) {
    return res.status(500).json({ success: false, error: err.message, fallback: true });
  }
}
