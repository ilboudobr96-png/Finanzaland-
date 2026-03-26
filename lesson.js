// FinanzaLand - API Generazione Lezioni con Claude AI
// Genera lezioni infinite automaticamente - nessuna codifica manuale

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({error:'Method not allowed'});

  const {
    topic,       // es. "interesse composto"
    livello,     // base | medio | avanzato | esperto | master
    eta,         // bambino | adolescente | adulto
    lingua,      // it | fr | en | es
    percorso,    // risparmio | investimenti | mercati | ecc.
    lessonId,    // ID unico per cache
  } = req.body || {};

  if (!topic) return res.status(400).json({error:'topic richiesto'});

  const LANG = {
    it: 'italiano',
    fr: 'francese',
    en: 'inglese',
    es: 'spagnolo',
  };
  const lingua_nome = LANG[lingua] || 'italiano';

  const ETA_PROMPT = {
    bambino:     'Per bambini 6-12 anni: linguaggio semplice, esempi con caramelle/giocattoli/paghetta, frasi brevi, metafore concrete.',
    adolescente: 'Per ragazzi 13-17 anni: esempi concreti con smartphone/streaming/sport, linguaggio diretto, dati reali.',
    adulto:      'Per adulti: linguaggio professionale, dati finanziari reali, esempi pratici dalla vita quotidiana.',
  };

  const LIVELLO_PROMPT = {
    base:     'Livello BASE: concetti fondamentali, zero gergo tecnico, massima accessibilita.',
    medio:    'Livello MEDIO: approfondimenti, qualche termine tecnico spiegato, esempi numerici semplici.',
    avanzato: 'Livello AVANZATO: tecniche professionali, formule, dati di mercato reali.',
    esperto:  'Livello ESPERTO: analisi avanzata, modelli finanziari, confronto internazionale.',
    master:   'Livello MASTER: livello universitario, teoria economica, ricerca applicata.',
  };

  const systemPrompt = `Sei il Professore Finan di FinanzaLand, un gioco educativo finanziario globale.
Generi lezioni educative sulla finanza personale.
${ETA_PROMPT[eta] || ETA_PROMPT.adulto}
${LIVELLO_PROMPT[livello] || LIVELLO_PROMPT.base}
Lingua: ${lingua_nome}.
IMPORTANTE: Rispondi SOLO con un oggetto JSON valido, niente altro.
Includi sempre dati reali e verificabili.
Aggiungi riferimenti ai mercati africani (BRVM, M-Pesa) quando rilevante.
Disclaimer sempre presente: "Solo a scopo educativo".`;

  const userPrompt = `Crea una lezione completa su: "${topic}" nel percorso "${percorso || 'finanza personale'}".

Rispondi con questo JSON esatto:
{
  "id": "${lessonId || topic.toLowerCase().replace(/\s+/g,'-')}",
  "titolo": "Titolo breve e accattivante",
  "sottotitolo": "Frase motivante",
  "emoji": "emoji rilevante",
  "colore": "#hexcolor",
  "livello": "${livello || 'base'}",
  "eta": "${eta || 'adulto'}",
  "tempo_minuti": numero_tra_3_e_15,
  "punti_chiave": [
    "Punto 1 — spiegazione concisa con dato reale",
    "Punto 2 — spiegazione concisa con esempio pratico",
    "Punto 3 — spiegazione concisa con applicazione vita reale",
    "Punto 4 — se necessario"
  ],
  "esempio_pratico": "Storia o scenario concreto di 2-3 frasi che illustra il concetto",
  "dato_reale": "Statistica o dato verificabile su questo argomento",
  "collegamento_africa": "Come si applica questo concetto nei mercati africani (se rilevante, altrimenti null)",
  "quiz": [
    {
      "domanda": "Domanda chiara sul concetto principale",
      "opzioni": ["opzione A", "opzione B", "opzione C", "opzione D"],
      "risposta_corretta": 0,
      "spiegazione": "Perche questa risposta e corretta — spiega il concetto"
    },
    {
      "domanda": "Seconda domanda su applicazione pratica",
      "opzioni": ["opzione A", "opzione B", "opzione C", "opzione D"],
      "risposta_corretta": 1,
      "spiegazione": "Spiegazione dettagliata"
    },
    {
      "domanda": "Terza domanda piu difficile",
      "opzioni": ["opzione A", "opzione B", "opzione C", "opzione D"],
      "risposta_corretta": 2,
      "spiegazione": "Spiegazione con dato reale"
    }
  ],
  "sfida_vita_reale": "Cosa fare questa settimana nella vita reale per applicare questo concetto",
  "semi_reward": numero_tra_50_e_300,
  "disclaimer": "Solo a scopo educativo — non e un consiglio finanziario"
}`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 1500,
        system: systemPrompt,
        messages: [{ role: 'user', content: userPrompt }],
      }),
    });

    const data = await response.json();
    const text = data.content?.[0]?.text || '';

    // Estrai JSON pulito
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('JSON non trovato nella risposta');

    const lesson = JSON.parse(jsonMatch[0]);
    lesson.generated_at = new Date().toISOString();
    lesson.generated_by = 'claude-sonnet';

    return res.status(200).json({ success: true, lesson });

  } catch (err) {
    console.error('Lesson generation error:', err);
    return res.status(500).json({
      success: false,
      error: 'Generazione lezione fallita',
      fallback: true,
    });
  }
}
