// api/chat.js — Vercel Serverless Function
// Chat AI per Deep Sections, Approfondimento Infinito, Civetta AI

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { system, messages } = req.body || {};
  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'Missing messages' });
  }

  const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY;
  if (!ANTHROPIC_KEY) return res.status(500).json({ error: 'API key not configured' });

  const DEFAULT_SYSTEM = `Sei Civetta, l'assistente AI di FinanzaLand — la più grande enciclopedia vivente della finanza globale. La tua conoscenza copre TUTTI i 195 paesi, TUTTE le culture, dalla preistoria al 2075. Nessun limite geografico né temporale. Mai superficiale. Mai generico. Ogni risposta deve illuminare l'utente e cambiare il suo modo di vedere il mondo.`;

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
        system: system || DEFAULT_SYSTEM,
        messages: messages,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('Anthropic error:', response.status, errText);
      return res.status(502).json({ error: 'Anthropic API error', status: response.status });
    }

    const data = await response.json();
    return res.status(200).json({ content: data.content || [] });

  } catch (err) {
    console.error('Chat handler error:', err);
    return res.status(500).json({ error: err.message });
  }
}
