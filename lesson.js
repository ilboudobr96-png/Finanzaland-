export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { topic, percorso, livello, eta, lingua, lessonId } = req.body;

  const LINGUA_MAP = {
    it: 'italiano',
    fr: 'francese',
    en: 'inglese',
    es: 'spagnolo',
    wo: 'wolof'
  };
  const langName = LINGUA_MAP[lingua] || 'italiano';
  const isChild = eta === 'bambino' || eta === 'kids';

  const systemPrompt = `Sei Civetta AI di FinanzaLand, assistente di educazione finanziaria.
Genera lezioni coinvolgenti ${isChild ? 'per bambini 6-16 anni' : 'per adulti'} in ${langName}.
Rispondi SOLO con un oggetto JSON valido, senza testo aggiuntivo, senza markdown.`;

  const userPrompt = `Genera una lezione completa su "${topic}" (percorso: ${percorso}, livello ${livello}).

Restituisci SOLO questo JSON (nessun testo prima o dopo):
{
  "id": "${lessonId || topic.toLowerCase().replace(/\s+/g, '-')}",
  "titolo": "Titolo coinvolgente della lezione",
  "sottotitolo": "Sottotitolo breve",
  "emoji": "📊",
  "colore": "#FFD700",
  "livello": ${livello},
  "tempo_minuti": 5,
  "punti_chiave": [
    "Primo concetto chiave spiegato semplicemente",
    "Secondo concetto chiave con esempio",
    "Terzo concetto applicabile nella vita reale"
  ],
  "esempio_pratico": "Scenario concreto che illustra il concetto principale",
  "dato_reale": "Statistica o dato reale interessante sul tema",
  "collegamento_africa": "Come questo argomento si applica al contesto africano / BRVM / UEMOA (o null se non applicabile)",
  "sfida_vita_reale": "Una sfida pratica che il bambino/adulto può fare oggi",
  "semi_reward": ${isChild ? 30 : 50},
  "quiz": [
    {
      "domanda": "Domanda di verifica della comprensione",
      "opzioni": ["Opzione corretta", "Opzione sbagliata 1", "Opzione sbagliata 2", "Opzione sbagliata 3"],
      "risposta_corretta": 0,
      "spiegazione": "Spiegazione del perché questa risposta è corretta"
    },
    {
      "domanda": "Seconda domanda applicativa",
      "opzioni": ["Risposta A", "Risposta B corretta", "Risposta C", "Risposta D"],
      "risposta_corretta": 1,
      "spiegazione": "Spiegazione della seconda risposta"
    }
  ]
}`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1500,
        system: systemPrompt,
        messages: [{ role: 'user', content: userPrompt }]
      })
    });

    const data = await response.json();
    const raw = data?.content?.[0]?.text || '';

    // Parse JSON from response
    let lesson;
    try {
      // Strip any markdown fences if present
      const cleaned = raw.replace(/```json|```/g, '').trim();
      lesson = JSON.parse(cleaned);
    } catch (parseErr) {
      // Extract JSON from text if needed
      const jsonMatch = raw.match(/\{[\s\S]+\}/);
      if (jsonMatch) {
        lesson = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Invalid JSON from AI');
      }
    }

    return res.status(200).json({ success: true, lesson });

  } catch (error) {
    console.error('Lesson API error:', error.message);
    // Return a fallback lesson so the app doesn't break
    return res.status(200).json({
      success: true,
      lesson: {
        id: lessonId || topic.toLowerCase().replace(/\s+/g, '-'),
        titolo: topic,
        sottotitolo: 'Lezione generata da FinanzaLand',
        emoji: '📚',
        colore: '#FFD700',
        livello: livello || 1,
        tempo_minuti: 5,
        punti_chiave: [
          `${topic} è un concetto fondamentale della finanza personale.`,
          'Capire questo argomento ti aiuta a prendere decisioni migliori.',
          'Applicalo nella tua vita quotidiana per costruire ricchezza nel tempo.'
        ],
        esempio_pratico: `Immagina di applicare ${topic} nella tua vita: ogni piccola decisione finanziaria conta.`,
        dato_reale: 'Il 70% delle famiglie che pianifica le proprie finanze raggiunge i propri obiettivi.',
        collegamento_africa: 'In Africa, il risparmio collettivo (tontine) applica questi principi da secoli.',
        sfida_vita_reale: `Oggi, applica un principio di ${topic} a una decisione finanziaria reale.`,
        semi_reward: 30,
        quiz: [
          {
            domanda: `Qual è il principio base di ${topic}?`,
            opzioni: ['Spendere tutto subito', 'Pianificare e risparmiare', 'Evitare il denaro', 'Non pensarci'],
            risposta_corretta: 1,
            spiegazione: 'Pianificare e risparmiare è sempre il punto di partenza.'
          }
        ]
      }
    });
  }
}
