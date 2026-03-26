export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const API_KEY = process.env.ANTHROPIC_API_KEY;
  if (!API_KEY) {
    return res.status(500).json({ 
      error: 'ANTHROPIC_API_KEY non configurata',
      hint: 'Vai su Vercel Dashboard > Settings > Environment Variables e aggiungi ANTHROPIC_API_KEY'
    });
  }

  try {
    const { messages, system, max_tokens } = req.body;

    // Validazione input
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'messages obbligatorio' });
    }

    const body = {
      model: 'claude-sonnet-4-5',
      max_tokens: max_tokens || 800,
      messages,
    };
    if (system) body.system = system;

    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type':      'application/json',
        'x-api-key':         API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify(body),
    });

    const data = await r.json();

    // Log errori API per debug
    if (!r.ok) {
      console.error('Anthropic API error:', r.status, JSON.stringify(data));
    }

    return res.status(r.status).json(data);

  } catch (err) {
    console.error('Handler error:', err.message);
    return res.status(500).json({ error: 'Errore server: ' + err.message });
  }
}
