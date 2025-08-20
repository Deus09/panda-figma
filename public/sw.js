// Moviloi Service Worker
// Film ve TV takip uygulaması için push notification desteği

const CACHE_NAME = 'moviloi-v1';
const urlsToCache = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json'
];

// Service Worker install event
self.addEventListener('install', function(event) {
  console.log('🚀 Moviloi Service Worker: Install event');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log('🗄️ Moviloi Service Worker: Cache opened');
        return cache.addAll(urlsToCache);
      })
  );
});

// Service Worker activate event
self.addEventListener('activate', function(event) {
  console.log('✅ Moviloi Service Worker: Activate event');
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (cacheName !== CACHE_NAME) {
            console.log('🗑️ Moviloi Service Worker: Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Service Worker fetch event
self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        // Cache hit - return response
        if (response) {
          return response;
        }
        return fetch(event.request);
      }
    )
  );
});

// Push notification event
self.addEventListener('push', function(event) {
  console.log('📱 Moviloi Service Worker: Push event received');
  
  if (event.data) {
    try {
      const data = event.data.json();
      console.log('📱 Moviloi Service Worker: Push data:', data);
      
      const options = {
        body: data.body || 'Yeni bir bildirim aldınız',
        icon: '/favicon.png',
        badge: '/favicon.png',
        tag: data.tag || 'moviloi-notification',
        data: data.data || {},
        actions: data.actions || [
          {
            action: 'open',
            title: 'Aç'
          },
          {
            action: 'close',
            title: 'Kapat'
          }
        ]
      };
      
      event.waitUntil(
        self.registration.showNotification(data.title || 'Moviloi', options)
      );
    } catch (error) {
      console.error('❌ Moviloi Service Worker: Push data parse error:', error);
    }
  }
});

// Notification click event
self.addEventListener('notificationclick', function(event) {
  console.log('🔔 Moviloi Service Worker: Notification click');
  
  event.notification.close();
  
  if (event.action === 'close') {
    return;
  }
  
  // Open app
  event.waitUntil(
    clients.openWindow('/')
  );
});

console.log('🚀 Moviloi Service Worker loaded successfully!');
