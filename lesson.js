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

  // Lingua — CRITICO: tutto il contenuto DEVE essere in questa lingua
  const LANG_MAP = {
    it: { nome: 'ITALIANO',  disclaimer: 'Solo a scopo educativo — non è un consiglio finanziario' },
    fr: { nome: 'FRANÇAIS',  disclaimer: 'À des fins éducatives uniquement — pas un conseil financier' },
    en: { nome: 'ENGLISH',   disclaimer: 'For educational purposes only — not financial advice' },
    es: { nome: 'ESPAÑOL',   disclaimer: 'Solo con fines educativos — no es consejo financiero' },
    wo: { nome: 'WOLOF',     disclaimer: 'Ci koolug jàng rekk — du xam-xam bu xaalis' },
  };
  const lang = LANG_MAP[lingua] || LANG_MAP.it;

  const ETA_PROMPT = {
    bambino:     lingua === 'fr' ? 'Pour enfants 6-12 ans: langage simple, exemples concrets.'
               : lingua === 'en' ? 'For children 6-12: simple language, concrete examples.'
               : lingua === 'es' ? 'Para niños 6-12 años: lenguaje simple, ejemplos concretos.'
               : 'Per bambini 6-12 anni: linguaggio semplice, esempi con caramelle e paghetta.',
    adolescente: lingua === 'fr' ? 'Pour ados 13-17 ans: exemples pratiques, données réelles.'
               : lingua === 'en' ? 'For teens 13-17: practical examples, real data.'
               : lingua === 'es' ? 'Para jóvenes 13-17: ejemplos prácticos, datos reales.'
               : 'Per ragazzi 13-17 anni: esempi concreti, dati reali.',
    adulto:      lingua === 'fr' ? 'Pour adultes: langage professionnel, données financières réelles.'
               : lingua === 'en' ? 'For adults: professional language, real financial data.'
               : lingua === 'es' ? 'Para adultos: lenguaje profesional, datos financieros reales.'
               : 'Per adulti: linguaggio professionale, dati finanziari reali.',
  };

  const LIVELLO_MAP = {
    base:     lingua === 'fr' ? 'Niveau DÉBUTANT: concepts fondamentaux, zéro jargon.'
            : lingua === 'en' ? 'Level BEGINNER: fundamental concepts, no jargon.'
            : lingua === 'es' ? 'Nivel PRINCIPIANTE: conceptos fundamentales, sin jerga.'
            : 'Livello BASE: concetti fondamentali, zero gergo.',
    medio:    lingua === 'fr' ? 'Niveau INTERMÉDIAIRE: approfondissements, quelques termes techniques expliqués.'
            : lingua === 'en' ? 'Level INTERMEDIATE: deeper concepts, some technical terms explained.'
            : lingua === 'es' ? 'Nivel INTERMEDIO: conceptos avanzados, términos técnicos explicados.'
            : 'Livello MEDIO: approfondimenti, termini tecnici spiegati.',
    avanzato: lingua === 'fr' ? 'Niveau AVANCÉ: techniques professionnelles, formules, données de marché.'
            : lingua === 'en' ? 'Level ADVANCED: professional techniques, formulas, market data.'
            : lingua === 'es' ? 'Nivel AVANZADO: técnicas profesionales, fórmulas, datos de mercado.'
            : 'Livello AVANZATO: tecniche professionali, formule, dati di mercato.',
    esperto:  lingua === 'fr' ? 'Niveau EXPERT: analyse avancée, modèles financiers.'
            : lingua === 'en' ? 'Level EXPERT: advanced analysis, financial models.'
            : lingua === 'es' ? 'Nivel EXPERTO: análisis avanzado, modelos financieros.'
            : 'Livello ESPERTO: analisi avanzata, modelli finanziari.',
    master:   lingua === 'fr' ? 'Niveau MASTER: niveau universitaire, théorie économique.'
            : lingua === 'en' ? 'Level MASTER: university level, economic theory.'
            : lingua === 'es' ? 'Nivel MASTER: nivel universitario, teoría económica.'
            : 'Livello MASTER: livello universitario, teoria economica.',
  };

  // Sistema prompt MOLTO esplicito sulla lingua
  const systemPrompt = `You are Professor Finan of FinanzaLand, a global educational finance game.

⚠️ CRITICAL LANGUAGE RULE: You MUST write ALL content EXCLUSIVELY in ${lang.nome}. 
Every single word of your response must be in ${lang.nome}.
Do NOT mix languages. Do NOT use Italian if the language is not Italian.
The topic name may be in Italian — translate it and explain it in ${lang.nome}.

${ETA_PROMPT[eta] || ETA_PROMPT.adulto}
${LIVELLO_MAP[livello] || LIVELLO_MAP.base}

Include real financial data. Reference African markets (BRVM, M-Pesa) when relevant.
Respond ONLY with a valid JSON object, nothing else.`;

  const userPrompt = `Create a complete lesson about: "${topic}" in the category "${percorso || 'personal finance'}".
IMPORTANT: Write EVERYTHING in ${lang.nome}. Translate the topic name if needed.

Respond with this exact JSON structure (all text in ${lang.nome}):
{
  "id": "${lessonId || topic.toLowerCase().replace(/\\s+/g,'-')}",
  "titolo": "Short catchy title in ${lang.nome}",
  "sottotitolo": "Motivating subtitle in ${lang.nome}",
  "emoji": "relevant emoji",
  "colore": "#hexcolor",
  "livello": "${livello || 'base'}",
  "eta": "${eta || 'adulto'}",
  "tempo_minuti": 5,
  "punti_chiave": [
    "Key point 1 in ${lang.nome} with real data",
    "Key point 2 in ${lang.nome} with practical example",
    "Key point 3 in ${lang.nome} with life application"
  ],
  "esempio_pratico": "Concrete 2-3 sentence story in ${lang.nome}",
  "dato_reale": "Verified statistic in ${lang.nome}",
  "collegamento_africa": "African market connection in ${lang.nome} or null",
  "quiz": [
    {
      "domanda": "Question 1 in ${lang.nome}",
      "opzioni": ["Option A in ${lang.nome}", "Option B", "Option C", "Option D"],
      "risposta_corretta": 0,
      "spiegazione": "Explanation in ${lang.nome}"
    },
    {
      "domanda": "Question 2 in ${lang.nome}",
      "opzioni": ["Option A", "Option B", "Option C", "Option D"],
      "risposta_corretta": 1,
      "spiegazione": "Explanation in ${lang.nome}"
    },
    {
      "domanda": "Question 3 in ${lang.nome}",
      "opzioni": ["Option A", "Option B", "Option C", "Option D"],
      "risposta_corretta": 2,
      "spiegazione": "Explanation in ${lang.nome}"
    }
  ],
  "sfida_vita_reale": "Weekly real-life challenge in ${lang.nome}",
  "semi_reward": 100,
  "disclaimer": "${lang.disclaimer}"
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
        max_tokens: 2000,
        system: systemPrompt,
        messages: [{ role: 'user', content: userPrompt }],
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('API error:', response.status, JSON.stringify(data));
      return res.status(response.status).json({ success: false, error: data });
    }

    const text = data.content?.[0]?.text || '';
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('No JSON in response:', text.substring(0, 200));
      throw new Error('JSON non trovato');
    }

    const lesson = JSON.parse(jsonMatch[0]);
    lesson.generated_at = new Date().toISOString();
    lesson.lingua = lingua;

    return res.status(200).json({ success: true, lesson });

  } catch (err) {
    console.error('Lesson error:', err.message);
    return res.status(500).json({ success: false, error: err.message, fallback: true });
  }
}
