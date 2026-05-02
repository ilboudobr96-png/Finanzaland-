export default async function handler(req, res) {
 // Solo POST
 if (req.method !== 'POST') {
 return res.status(405).json({ error: 'Method not allowed' });
 }
 
 const apiKey = process.env.ANTHROPIC_API_KEY;
 if (!apiKey) {
 return res.status(500).json({ error: 'ANTHROPIC_API_KEY non configurata' });
 }
 
 const { system, messages } = req.body;
 
 try {
 const response = await fetch('https://api.anthropic.com/v1/messages', {
 method: 'POST',
 headers: {
 'Content-Type': 'application/json',
 'x-api-key': apiKey,
 'anthropic-version': '2023-06-01',
 },
 body: JSON.stringify({
 model: 'claude-sonnet-4-20250514',
 max_tokens: 1024,
 system: (system || '') + '\n\nIMPORTANTE: Rispondi SOLO con JSON puro, senza backtick, senza ```json, senza nessun testo aggiuntivo prima o dopo. Solo il JSON grezzo.',
 messages: messages || [],
 }),
 });
 
 const data = await response.json();
 
 if (!response.ok) {
 return res.status(response.status).json({ error: data });
 }
 
 return res.status(200).json(data);
 } catch (err) {
 console.error('Errore API Anthropic:', err);
 return res.status(500).json({ error: 'Errore interno del server' });
 }
}
