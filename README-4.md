# 🐉 FinanzaLand — L'Accademia del Risparmio

> **"Ogni bambino merita di sapere come funziona il denaro. Non è un privilegio — è un diritto."**
> — Bernard Ilboudo, Fondatore

---

## 🌟 Cos'è FinanzaLand

FinanzaLand è l'unica app di educazione finanziaria per bambini che trasforma le buone abitudini in **ricchezza fisica reale**.

I bambini guadagnano **Semi di Luce** completando missioni reali (leggere, riordinare, risparmiare). I Semi si accumulano nel castello digitale e, al raggiungimento degli obiettivi, il genitore premia con **Monete d'Argento fisiche**, lingotti e investimenti reali.

**Il gioco non finisce mai.** Cresce con il bambino — e con il genitore.

---

## 📱 Demo Live

🔗 **[finanzaland.netlify.app](https://finanzaland.netlify.app)**

---

## ✨ Funzionalità Principali

### 🧒 Per i Bambini
- **Semi di Luce** — valuta virtuale guadagnata con missioni reali
- **Castelli SVG animati** — 5 livelli da Casetta a Reggia
- **Cash Flow passivo** — i castelli producono Semi ogni 8 secondi
- **10 Livelli infiniti** — da Drago Apprendista a Grande Drago del Risparmio
- **Traguardi senza fine** — ogni obiettivo apre il prossimo

### 📊 Mercato Finanziario (educativo)
- **Azioni** — 5 aziende fittizie con prezzi settimanali e dividendi mensili
- **Obbligazioni** — BTP Drago (3%), Bond Aziendale (7%), Perpetua (12%)
- **Banca del Drago** — prestiti con interessi reali, penali per ritardo
- **Impresa** — avvia un'attività con costi fissi e Break Even reale
- **Piano Infinito** — traguardi con ricompense fisiche dal genitore

### 👨 Per gli Adulti
- **Modalità Adulto** — dashboard con KPI finanziari reali
- **Sfide settimanali** — apri un ETF, calcola il patrimonio netto, crea il fondo emergenza
- **Citazioni infinite** — Warren Buffett, Kiyosaki, Bernard Ilboudo
- **Pannello Genitore** — approva missioni con PIN, vedi statistiche figlio

### 🤖 Drago AI Mentore
- Genera una lezione finanziaria **ogni giorno** basata su notizie reali
- Powered by **Claude AI (Anthropic)**
- Chat interattiva con il Drago
- Si aggiorna automaticamente — zero manutenzione

### 📚 9 Lezioni nel Tempio
1. Bisogno vs Desiderio
2. Guadagna — Non Solo Spendere
3. Cash Flow e Rendita Passiva
4. Interesse Composto
5. Il Segreto dei Due Draghi (Asset vs Passività)
6. La Regola 50-30-20
7. **Come la Banca Guadagna sui Poveri** ← esclusiva
8. **Perché i Ricchi Rimangono Ricchi** ← esclusiva
9. **Il Sistema Finanziario — Chi Vince Davvero** ← esclusiva

### 🔁 Apprendimento Permanente
- **Spaced Repetition** — ripasso automatico dopo 1, 3, 7, 14, 30 giorni
- **Inflazione simulata** — i prezzi aumentano ogni settimana
- **Quiz** con feedback immediato e Semi bonus
- **TrustScore** — valuta la velocità di completamento delle missioni

---

## 🚀 Installazione

### Opzione 1 — GitHub Pages (gratuito)
1. Fai fork di questo repository
2. Vai su Settings → Pages → Branch: main
3. Il sito è live su `tuonome.github.io/finanzaland`

### Opzione 2 — Netlify (consigliato)
1. Vai su [netlify.com](https://netlify.com)
2. "Add new site" → "Deploy manually"
3. Trascina la cartella del progetto
4. Live in 30 secondi

### Opzione 3 — Locale
```bash
git clone https://github.com/tuonome/finanzaland.git
cd finanzaland
# Apri index.html nel browser
# Oppure usa un server locale:
python3 -m http.server 8000
```

---

## ⚙️ Configurazione

### Supabase (salvataggio cloud)
```javascript
// In index.html, trova SUPABASE_CONFIG e sostituisci:
const SUPABASE_CONFIG = {
  url: 'https://TUO-PROGETTO.supabase.co',
  anonKey: 'TUA-ANON-KEY'
};
```

### Claude AI (Drago AI Mentore)
Il Drago AI usa l'API di Anthropic direttamente dal browser.
Configura la tua API key nel pannello di Claude.ai se usi gli Artifacts.

### Stripe (pagamenti Pro)
```javascript
// Cerca STRIPE_CONFIG in index.html:
const STRIPE_CONFIG = {
  publishableKey: 'pk_live_TUA_CHIAVE',
  plans: {
    mensile: { priceId: 'price_XXXX', amount: 4.99 },
    famiglia: { priceId: 'price_YYYY', amount: 7.99 }
  }
};
```

---

## 📁 Struttura File

```
finanzaland/
├── index.html          ← App principale (tutto in un file)
├── sw.js               ← Service Worker (offline + PWA)
├── manifest.json       ← PWA manifest (installazione nativa)
├── icon-192.png        ← Icona app (da aggiungere)
├── icon-512.png        ← Icona app grande (da aggiungere)
└── README.md           ← Questo file
```

---

## 🏗️ Stack Tecnologico

| Tecnologia | Uso |
|-----------|-----|
| HTML/CSS/JS vanilla | App completa — zero dipendenze |
| Supabase | Database cloud + autenticazione |
| Claude AI (Anthropic) | Drago AI Mentore giornaliero |
| Stripe | Pagamenti abbonamento Pro |
| PWA + Service Worker | Funziona offline come app nativa |
| localStorage | Salvataggio dati locale |

---

## 🎯 Roadmap

- [ ] Notifiche push reali (giornaliere + missioni)
- [ ] Profilo famiglia multi-bambino
- [ ] Integrazione ETF reale (Trading212 API)
- [ ] Versione Flutter (iOS + Android nativa)
- [ ] Backend Node.js per Stripe
- [ ] Dashboard web per genitori
- [ ] Classifica globale famiglie

---

## 👨‍💼 Autore

**Bernard Ilboudo**
Fondatore di FinanzaLand

> "La finanza non dovrebbe essere il segreto di una classe privilegiata.
>  I Semi di Luce che guadagni oggi sono la tua prima risposta al sistema."

---

## 📄 Licenza

© 2026 Bernard Ilboudo — Tutti i diritti riservati.
FinanzaLand è un progetto proprietario. Contatta l'autore per collaborazioni.

---

*FinanzaLand — Il gioco non finisce mai. La ricchezza è un percorso di vita.* 🐉
