// api/market.js — FinanzaLand Market Proxy
// Risolve il problema CORS di Yahoo Finance chiamando l'API server-side
// Deploy su Vercel: metti questo file in /api/market.js

export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const symbols = (req.query.symbols || '').trim();
  if (!symbols) {
    return res.status(400).json({ error: 'symbols parameter required' });
  }

  const url = `https://query2.finance.yahoo.com/v8/finance/quote?symbols=${encodeURIComponent(symbols)}&fields=regularMarketPrice,regularMarketChangePercent,regularMarketVolume,shortName,currency`;

  try {
    const r = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; FinanzaLand/1.0)',
        'Accept': 'application/json',
      }
    });

    if (!r.ok) {
      console.error('Yahoo Finance error:', r.status);
      return res.status(200).json({ quoteResponse: { result: [], error: null } });
    }

    const data = await r.json();
    return res.status(200).json(data);

  } catch (e) {
    console.error('Market proxy error:', e.message);
    // Risponde con struttura vuota — il frontend usa il fallback locale
    return res.status(200).json({ quoteResponse: { result: [], error: null } });
  }
}
