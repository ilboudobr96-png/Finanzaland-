// ══════════════════════════════════════════════════════════════
// 🐉 FinanzaLand — Service Worker
// di Bernard Ilboudo
// Versione Definitiva Infinita
// ══════════════════════════════════════════════════════════════

const CACHE_NAME = 'finanzaland-v17';
const CACHE_ESSENTIAL = 'finanzaland-essential-v17';

// File da mettere in cache immediatamente
const FILES_DA_CACHARE = [
  '/',
  '/index.html',
  'https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@700;900&family=Cinzel:wght@600;700;900&family=Nunito:wght@700;800;900&display=swap',
];

// ── INSTALL: scarica e metti in cache ──
self.addEventListener('install', event => {
  console.log('🐉 FinanzaLand SW: installazione v17');
  event.waitUntil(
    caches.open(CACHE_ESSENTIAL).then(cache => {
      return cache.addAll(FILES_DA_CACHARE.map(url => new Request(url, { mode: 'no-cors' })))
        .catch(err => console.log('Cache parziale OK:', err));
    }).then(() => self.skipWaiting())
  );
});

// ── ACTIVATE: pulisce vecchie cache ──
self.addEventListener('activate', event => {
  console.log('🐉 FinanzaLand SW: attivazione v17');
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(key => key !== CACHE_NAME && key !== CACHE_ESSENTIAL)
            .map(key => {
              console.log('🗑️ Rimozione vecchia cache:', key);
              return caches.delete(key);
            })
      )
    ).then(() => self.clients.claim())
  );
});

// ── FETCH: strategia Cache First con fallback Network ──
self.addEventListener('fetch', event => {
  const { request } = event;

  // Ignora richieste non-GET e API esterne (Supabase, Anthropic, Stripe)
  if (request.method !== 'GET') return;
  if (request.url.includes('supabase.co')) return;
  if (request.url.includes('anthropic.com')) return;
  if (request.url.includes('stripe.com')) return;
  if (request.url.includes('jsdelivr.net')) return;

  event.respondWith(
    caches.match(request).then(cached => {
      if (cached) {
        // Cache hit — restituisce dalla cache
        // In background aggiorna la cache (stale-while-revalidate)
        fetch(request).then(response => {
          if (response && response.status === 200) {
            caches.open(CACHE_NAME).then(cache => cache.put(request, response));
          }
        }).catch(() => {}); // Silenzioso se offline
        return cached;
      }

      // Cache miss — prova dalla rete
      return fetch(request).then(response => {
        if (!response || response.status !== 200 || response.type === 'opaque') {
          return response;
        }
        // Salva in cache per la prossima volta
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(request, responseClone));
        return response;
      }).catch(() => {
        // Offline e non in cache — risposta di fallback
        if (request.destination === 'document') {
          return caches.match('/index.html');
        }
        return new Response('Offline — i tuoi Semi sono al sicuro 🐉', {
          status: 503,
          statusText: 'Offline',
          headers: { 'Content-Type': 'text/plain; charset=utf-8' }
        });
      });
    })
  );
});

// ── SYNC: sincronizza quando torna online ──
self.addEventListener('sync', event => {
  if (event.tag === 'sync-finanzaland') {
    console.log('🐉 FinanzaLand SW: sync in background');
    event.waitUntil(
      self.clients.matchAll().then(clients => {
        clients.forEach(client => {
          client.postMessage({ type: 'SYNC_REQUEST' });
        });
      })
    );
  }
});

// ── PUSH: notifiche (per future funzionalità) ──
self.addEventListener('push', event => {
  if (!event.data) return;
  const data = event.data.json();
  const options = {
    body: data.body || 'Il tuo regno ti aspetta!',
    icon: '/icon-192.png',
    badge: '/icon-72.png',
    vibrate: [100, 50, 100],
    data: { url: data.url || '/' },
    actions: [
      { action: 'apri', title: '🐉 Apri FinanzaLand' },
      { action: 'chiudi', title: 'Chiudi' }
    ]
  };
  event.waitUntil(
    self.registration.showNotification(data.title || '🐉 FinanzaLand', options)
  );
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  if (event.action === 'chiudi') return;
  event.waitUntil(
    self.clients.openWindow(event.notification.data.url || '/')
  );
});

// ── MESSAGE: comunicazione con l'app ──
self.addEventListener('message', event => {
  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  if (event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_NAME });
  }
});

console.log('🐉 FinanzaLand Service Worker v17 caricato — Bernard Ilboudo');
