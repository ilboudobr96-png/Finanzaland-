# 🌍 FinanzaLand — API Python

Funzioni finanziarie di FinanzaLand deployate su Vercel come API serverless.

## Funzioni disponibili

| Funzione | Descrizione |
|---|---|
| `calcola_interesse_composto` | Calcola interesse composto |
| `calcola_budget` | Calcola risparmio o deficit |

## Endpoint API

**Base URL:** `https://tuo-progetto.vercel.app/api/calcola`

### GET — Test rapido
```
GET /api/calcola
```
Risposta:
```json
{
  "interesse_composto": "1628.89",
  "budget": "Risparmio: 500"
}
```

### POST — Interesse composto
```json
{
  "action": "interesse",
  "capitale": 1000,
  "tasso": 5,
  "anni": 10
}
```

### POST — Budget
```json
{
  "action": "budget",
  "entrate": 2000,
  "spese": 1500
}
```

## Deploy su Vercel

```bash
npm install -g vercel
vercel login
vercel --prod
```

## Struttura progetto

```
finanzaland/
├── api/
│   └── calcola.py   ← Funzioni Python + handler
├── vercel.json      ← Configurazione Vercel
└── README.md
```
