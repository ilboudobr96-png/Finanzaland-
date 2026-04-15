export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { system, messages } = req.body || {};
  if (!messages?.length) return res.status(400).json({ error: 'Missing messages' });

  const KEY = process.env.ANTHROPIC_API_KEY;
  if (!KEY) return res.status(500).json({ error: 'API key not configured' });

  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {'Content-Type':'application/json','x-api-key':KEY,'anthropic-version':'2023-06-01'},
      body: JSON.stringify({
        model: 'claude-sonnet-4-5', max_tokens: 2000,
        system: system || 'Sei Civetta AI di FinanzaLand. Rispondi nella lingua dell utente. Solo scopo educativo.',
        messages
      })
    });
    if (!r.ok) return res.status(502).json({ error: 'Anthropic error', status: r.status });
    const data = await r.json();
    return res.status(200).json({ content: data.content || [] });
  } catch(e) {
    return res.status(500).json({ error: e.message });
  }
}
