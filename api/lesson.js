export default async function handler(req, res) {
  // Sempre JSON — mai HTML
  res.setHeader('Content-Type', 'application/json');

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { topic, percorso, livello, eta, lingua } = req.body || {};
  const langMap = { it: 'italiano', fr: 'francese', en: 'inglese', es: 'spagnolo', wo: 'wolof' };
  const langName = langMap[lingua] || 'italiano';
  const isChild = eta === 'bambino' || eta === 'kids';

  const prompt = `Genera una lezione di educazione finanziaria su "${topic}" (percorso:${percorso}, livello:${livello}) per ${isChild ? 'bambini 6-16 anni' : 'adulti'} in ${langName}.
Rispondi SOLO con JSON valido, zero markdown, zero testo fuori dal JSON:
{"id":"${(topic || '').toLowerCase().replace(/\s+/g, '-')}","titolo":"...","sottotitolo":"...","emoji":"📊","colore":"#FFD700","livello":${livello || 1},"tempo_minuti":5,"punti_chiave":["punto 1","punto 2","punto 3"],"esempio_pratico":"...","dato_reale":"...","collegamento_africa":"...","sfida_vita_reale":"...","semi_reward":${isChild ? 30 : 50},"quiz":[{"domanda":"...","opzioni":["A","B","C","D"],"risposta_corretta":0,"spiegazione":"..."},{"domanda":"...","opzioni":["A","B","C","D"],"risposta_corretta":1,"spiegazione":"..."}]}`;

  // ─── Fallback lesson (usata in caso di errore API) ────────────────────────
  const t = topic || 'Finanza';
  const fallbackLesson = {
    id: t.toLowerCase().replace(/\s+/g, '-'),
    titolo: t,
    sottotitolo: 'Educazione finanziaria con FinanzaLand',
    emoji: '📚',
    colore: '#FFD700',
    livello: livello || 1,
    tempo_minuti: 5,
    punti_chiave: [
      t + ' è fondamentale per la tua libertà finanziaria.',
      'Applicarlo ogni giorno costruisce ricchezza nel tempo.',
      'Piccole decisioni oggi = grandi risultati domani.'
    ],
    esempio_pratico: 'Risparmiando il 10% ogni mese per 10 anni crei una base solida.',
    dato_reale: 'Chi pianifica le finanze raggiunge gli obiettivi nel 70% dei casi.',
    collegamento_africa: 'In Africa il risparmio collettivo (tontine/njangi) usa questi principi da secoli.',
    sfida_vita_reale: 'Oggi applica un principio di ' + t + ' a una decisione finanziaria concreta.',
    semi_reward: isChild ? 30 : 50,
    quiz: [{
      domanda: 'Qual è il principio base di ' + t + '?',
      opzioni: ['Spendere tutto subito', 'Pianificare e risparmiare', 'Evitare di investire', 'Non pensarci'],
      risposta_corretta: 1,
      spiegazione: 'Pianificare e risparmiare è sempre il punto di partenza per la libertà finanziaria.'
    }]
  };

  // ─── Chiamata API Anthropic ───────────────────────────────────────────────
  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',   // ✅ FIX: modello aggiornato (era claude-sonnet-4-20250514)
        max_tokens: 1500,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    // Se l'API risponde con errore HTTP → fallback (evita che Vercel ritorni HTML)
    if (!r.ok) {
      console.error('Anthropic API HTTP error:', r.status, r.statusText);
      return res.status(200).json({ success: true, lesson: fallbackLesson });
    }

    const d = await r.json();

    // Estrai testo e pulisci eventuali markdown fence
    const raw = (d?.content?.[0]?.text || '').replace(/```json|```/g, '').trim();

    // Doppia protezione: cerca il blocco JSON anche se c'è testo attorno
    const jsonStr = raw.match(/\{[\s\S]+\}/)?.[0] || raw;

    if (!jsonStr) {
      console.error('Lesson API: risposta vuota da Claude');
      return res.status(200).json({ success: true, lesson: fallbackLesson });
    }

    const lesson = JSON.parse(jsonStr);
    return res.status(200).json({ success: true, lesson });

  } catch (e) {
    console.error('Lesson API error:', e.message);
    return res.status(200).json({ success: true, lesson: fallbackLesson });
  }
}
