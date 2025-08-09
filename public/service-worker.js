// Service Worker pour DGI Access PWA
const CACHE_NAME = 'dgi-access-v1.0.0';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/logo-dgi.png',
  '/IMGaccueil.png',
  '/shield.svg'
];

// Cache dynamique pour les ressources
const DYNAMIC_CACHE = 'dgi-dynamic-v1.0.0';
const MAX_DYNAMIC_CACHE_SIZE = 50;

// Installation du Service Worker
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installation...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] Mise en cache des ressources initiales');
        return cache.addAll(urlsToCache);
      })
      .then(() => self.skipWaiting())
  );
});

// Activation du Service Worker
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activation...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== DYNAMIC_CACHE) {
            console.log('[Service Worker] Suppression ancien cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Gestion des requêtes avec stratégie Cache First pour les assets statiques
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignorer les requêtes non-GET
  if (request.method !== 'GET') {
    return;
  }

  // Stratégie pour les ressources statiques (images, CSS, JS)
  if (request.destination === 'image' || 
      request.destination === 'style' || 
      request.destination === 'script' ||
      request.destination === 'font') {
    event.respondWith(cacheFirst(request));
    return;
  }

  // Stratégie Network First pour les API et données dynamiques
  if (url.pathname.startsWith('/api/') || request.headers.get('accept')?.includes('application/json')) {
    event.respondWith(networkFirst(request));
    return;
  }

  // Stratégie Cache First avec fallback pour le reste
  event.respondWith(
    caches.match(request)
      .then((response) => {
        if (response) {
          return response;
        }
        return fetch(request).then((response) => {
          // Ne pas mettre en cache les réponses non-OK
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          // Cloner la réponse pour la mettre en cache
          const responseToCache = response.clone();
          
          caches.open(DYNAMIC_CACHE)
            .then((cache) => {
              cache.put(request, responseToCache);
              limitCacheSize(DYNAMIC_CACHE, MAX_DYNAMIC_CACHE_SIZE);
            });

          return response;
        });
      })
      .catch(() => {
        // Page de fallback hors-ligne
        if (request.destination === 'document') {
          return caches.match('/offline.html');
        }
      })
  );
});

// Stratégie Cache First
async function cacheFirst(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);
  
  if (cached) {
    return cached;
  }

  try {
    const response = await fetch(request);
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    console.error('[Service Worker] Erreur fetch:', error);
    return new Response('Ressource non disponible hors-ligne', { status: 503 });
  }
}

// Stratégie Network First
async function networkFirst(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    const cached = await caches.match(request);
    if (cached) {
      return cached;
    }
    return new Response(JSON.stringify({ 
      error: 'Données non disponibles hors-ligne' 
    }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Limiter la taille du cache dynamique
async function limitCacheSize(cacheName, maxSize) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  if (keys.length > maxSize) {
    await cache.delete(keys[0]);
    limitCacheSize(cacheName, maxSize);
  }
}

// Gestion des messages du client
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    caches.keys().then((cacheNames) => {
      cacheNames.forEach((cacheName) => {
        caches.delete(cacheName);
      });
    });
    event.ports[0].postMessage({ type: 'CACHE_CLEARED' });
  }
});

// Synchronisation en arrière-plan
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-visitors') {
    event.waitUntil(syncVisitorData());
  }
});

async function syncVisitorData() {
  try {
    // Récupérer les données en attente de synchronisation depuis IndexedDB
    const pendingData = await getPendingData();
    
    if (pendingData && pendingData.length > 0) {
      // Envoyer les données au serveur
      const response = await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pendingData)
      });
      
      if (response.ok) {
        // Nettoyer les données synchronisées
        await clearPendingData();
        
        // Notifier le client
        const clients = await self.clients.matchAll();
        clients.forEach(client => {
          client.postMessage({
            type: 'SYNC_COMPLETE',
            message: 'Données synchronisées avec succès'
          });
        });
      }
    }
  } catch (error) {
    console.error('[Service Worker] Erreur de synchronisation:', error);
  }
}

// Fonctions utilitaires pour IndexedDB (simplifiées)
async function getPendingData() {
  // Implementation simplifiée - à adapter selon vos besoins
  return [];
}

async function clearPendingData() {
  // Implementation simplifiée - à adapter selon vos besoins
  return true;
}

// Gestion des notifications push
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'Nouvelle notification DGI Access',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Voir',
        icon: '/icons/checkmark.png'
      },
      {
        action: 'close',
        title: 'Fermer',
        icon: '/icons/xmark.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('DGI Access', options)
  );
});

// Gestion des clics sur notifications
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/admin/dashboard')
    );
  }
});
