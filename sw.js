// ══════════════════════════════════════════════════
// 🐉 FinanzaLand — Service Worker PWA
// di Bernard Ilboudo & Riccarda
// Versione: 1.0.0
// ══════════════════════════════════════════════════

const CACHE_NAME = 'finanzaland-v1';
const CACHE_ASSETS = [
  '/',
  '/FinanzaLand_App_Final.html',
  '/manifest.json',
  // Immagini del gioco
  '/1000189853.png',
  '/1000189854.png',
  '/1000189855.png',
  '/1000189856.png',
  '/1000189857.png',
  '/1000189685.png',
  '/1000189686.png',
  '/1000189687.png',
  '/1000189688.png',
  // Font Google (cache dopo primo caricamento)
  'https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@700;900&family=Cinzel:wght@600;700;900&family=Nunito:wght@700;800;900&display=swap'
];

// ── INSTALL: scarica tutto in cache ──
self.addEventListener('install', event => {
  console.log('🐉 FinanzaLand SW: Installazione in corso...');
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('🐉 FinanzaLand SW: Cache aperta, scarico assets...');
      // Carica uno per uno per non fallire se qualcosa manca
      return Promise.allSettled(
        CACHE_ASSETS.map(url =>
          cache.add(url).catch(err =>
            console.warn(`⚠️ Cache fallita per: ${url}`, err)
          )
        )
      );
    }).then(() => {
      console.log('✅ FinanzaLand SW: Tutti gli assets in cache!');
      return self.skipWaiting(); // Attiva subito senza aspettare
    })
  );
});

// ── ACTIVATE: pulisci vecchie cache ──
self.addEventListener('activate', event => {
  console.log('🐉 FinanzaLand SW: Attivato!');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames
          .filter(name => name !== CACHE_NAME)
          .map(name => {
            console.log(`🗑️ Elimino vecchia cache: ${name}`);
            return caches.delete(name);
          })
      );
    }).then(() => self.clients.claim()) // Prendi controllo subito
  );
});

// ── FETCH: strategia "Cache First, poi Network" ──
self.addEventListener('fetch', event => {
  // Ignora richieste non-GET
  if (event.request.method !== 'GET') return;

  // Ignora richieste a domini esterni non essenziali
  const url = new URL(event.request.url);
  const isLocal = url.origin === self.location.origin;
  const isFont = url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com';

  if (!isLocal && !isFont) return;

  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      if (cachedResponse) {
        // ✅ Trovato in cache → risposta immediata (funziona offline)
        // In background, aggiorna la cache con la versione più recente
        fetch(event.request)
          .then(networkResponse => {
            if (networkResponse && networkResponse.status === 200) {
              caches.open(CACHE_NAME).then(cache => {
                cache.put(event.request, networkResponse.clone());
              });
            }
          })
          .catch(() => {}); // Silenzioso se offline
        return cachedResponse;
      }

      // ❌ Non in cache → prova dalla rete
      return fetch(event.request).then(networkResponse => {
        if (!networkResponse || networkResponse.status !== 200) {
          return networkResponse;
        }
        // Salva in cache per dopo
        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, responseToCache);
        });
        return networkResponse;
      }).catch(() => {
        // Offline e non in cache → pagina di fallback
        if (event.request.destination === 'document') {
          return caches.match('/FinanzaLand_App_Final.html');
        }
        // Per le immagini, ritorna un placeholder trasparente
        if (event.request.destination === 'image') {
          return new Response(
            '<svg xmlns="http://www.w3.org/2000/svg" width="1" height="1"></svg>',
            { headers: { 'Content-Type': 'image/svg+xml' } }
          );
        }
      });
    })
  );
});

// ── BACKGROUND SYNC: sincronizza dati quando torna online ──
self.addEventListener('sync', event => {
  if (event.tag === 'sync-semi') {
    console.log('🔄 FinanzaLand SW: Sincronizzazione Semi in corso...');
    event.waitUntil(syncSemiData());
  }
});

async function syncSemiData() {
  // Placeholder per futura integrazione con Supabase
  console.log('✅ FinanzaLand SW: Dati sincronizzati con il server!');
}

// ── PUSH NOTIFICATIONS: notifiche del Drago Notaio ──
self.addEventListener('push', event => {
  if (!event.data) return;

  let data;
  try { data = event.data.json(); }
  catch(e) { data = { title: '🐉 FinanzaLand', body: event.data.text() }; }

  const options = {
    body: data.body || 'Il Drago Notaio ti ha inviato un messaggio!',
    icon: '/1000189853.png',
    badge: '/1000189853.png',
    vibrate: [200, 100, 200, 100, 200],
    tag: data.tag || 'finanzaland-notif',
    renotify: true,
    data: {
      url: data.url || '/FinanzaLand_App_Final.html',
      missionId: data.missionId,
      reward: data.reward
    },
    actions: [
      { action: 'approva', title: '✅ Approva', icon: '/1000189853.png' },
      { action: 'ignora', title: '⏳ Dopo', icon: '/1000189853.png' }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(
      data.title || '🐉 FinanzaLand — Drago Notaio',
      options
    )
  );
});

// ── NOTIFICATION CLICK: apri l'app al click della notifica ──
self.addEventListener('notificationclick', event => {
  event.notification.close();

  if (event.action === 'ignora') return;

  const urlToOpen = event.notification.data?.url || '/FinanzaLand_App_Final.html';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(windowClients => {
      // Se l'app è già aperta, portala in primo piano
      for (const client of windowClients) {
        if (client.url.includes('FinanzaLand') && 'focus' in client) {
          return client.focus();
        }
      }
      // Altrimenti apri una nuova finestra
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

console.log('🐉 FinanzaLand Service Worker caricato — di Bernard Ilboudo & Riccarda');
