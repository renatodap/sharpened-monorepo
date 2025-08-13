const CACHE_NAME = 'feelsharper-v1.0.0';
const STATIC_CACHE = 'feelsharper-static-v1.0.0';
const DYNAMIC_CACHE = 'feelsharper-dynamic-v1.0.0';
const IMAGE_CACHE = 'feelsharper-images-v1.0.0';

// Files to cache immediately
const STATIC_FILES = [
  '/',
  '/dashboard',
  '/coach',
  '/log/workout',
  '/log/meal',
  '/today',
  '/calendar',
  '/settings',
  '/offline',
  '/manifest.json',
  '/_next/static/css/app/layout.css',
  '/_next/static/chunks/webpack.js',
  '/_next/static/chunks/main.js'
];

// API routes that should be cached
const API_CACHE_ROUTES = [
  '/api/nutrition/foods',
  '/api/workouts',
  '/api/user-profile'
];

// Install event - cache static files
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('[SW] Caching static files');
        return cache.addAll(STATIC_FILES);
      })
      .then(() => {
        console.log('[SW] Installation complete');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('[SW] Installation failed:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && 
                cacheName !== DYNAMIC_CACHE && 
                cacheName !== IMAGE_CACHE) {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('[SW] Activation complete');
        return self.clients.claim();
      })
  );
});

// Fetch event - handle requests with caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Handle different types of requests
  if (request.url.includes('/api/')) {
    event.respondWith(handleApiRequest(request));
  } else if (request.destination === 'image') {
    event.respondWith(handleImageRequest(request));
  } else if (request.url.includes('/_next/static/')) {
    event.respondWith(handleStaticAssets(request));
  } else {
    event.respondWith(handleNavigationRequest(request));
  }
});

// Handle API requests - Network first, then cache
async function handleApiRequest(request) {
  const cacheName = DYNAMIC_CACHE;
  
  try {
    const response = await fetch(request);
    
    if (response.ok) {
      const cache = await caches.open(cacheName);
      // Only cache successful responses for specific routes
      if (API_CACHE_ROUTES.some(route => request.url.includes(route))) {
        cache.put(request, response.clone());
      }
    }
    
    return response;
  } catch (error) {
    console.log('[SW] API request failed, trying cache:', request.url);
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline response for specific API calls
    if (request.url.includes('/api/')) {
      return new Response(
        JSON.stringify({ 
          error: 'Offline', 
          message: 'You are currently offline. Some features may be limited.' 
        }),
        {
          status: 503,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
    
    throw error;
  }
}

// Handle image requests - Cache first, then network
async function handleImageRequest(request) {
  const cacheName = IMAGE_CACHE;
  
  try {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    const response = await fetch(request);
    
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    
    return response;
  } catch (error) {
    console.log('[SW] Image request failed:', request.url);
    // Return a fallback image if needed
    return new Response(
      '<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg"><rect width="200" height="200" fill="#1D2127"/><text x="50%" y="50%" fill="#C7CBD1" text-anchor="middle" dy=".3em">Image Unavailable</text></svg>',
      { headers: { 'Content-Type': 'image/svg+xml' } }
    );
  }
}

// Handle static assets - Cache first
async function handleStaticAssets(request) {
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    console.log('[SW] Static asset request failed:', request.url);
    throw error;
  }
}

// Handle navigation requests - Network first, then cache, then offline page
async function handleNavigationRequest(request) {
  try {
    const response = await fetch(request);
    
    if (response.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, response.clone());
    }
    
    return response;
  } catch (error) {
    console.log('[SW] Navigation request failed, trying cache:', request.url);
    
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline page for navigation requests
    const offlineResponse = await caches.match('/offline');
    if (offlineResponse) {
      return offlineResponse;
    }
    
    // Fallback offline HTML
    return new Response(`
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Feel Sharper - Offline</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
              background: #0A0A0A;
              color: #FFFFFF;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              height: 100vh;
              margin: 0;
              text-align: center;
              padding: 20px;
            }
            h1 { color: #1F5798; margin-bottom: 20px; }
            p { color: #C7CBD1; line-height: 1.6; }
            .retry-btn {
              background: #1F5798;
              color: white;
              border: none;
              padding: 12px 24px;
              border-radius: 8px;
              margin-top: 20px;
              cursor: pointer;
              font-size: 16px;
            }
          </style>
        </head>
        <body>
          <h1>You're Offline</h1>
          <p>Feel Sharper is currently offline. Check your connection and try again.</p>
          <p>Some features may still be available from your cached data.</p>
          <button class="retry-btn" onclick="window.location.reload()">Try Again</button>
        </body>
      </html>
    `, {
      headers: { 'Content-Type': 'text/html' }
    });
  }
}

// Background sync for form submissions
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync event:', event.tag);
  
  if (event.tag === 'workout-log') {
    event.waitUntil(syncWorkoutData());
  } else if (event.tag === 'food-log') {
    event.waitUntil(syncFoodData());
  }
});

// Sync workout data when back online
async function syncWorkoutData() {
  try {
    // Get pending workout data from IndexedDB
    const pendingWorkouts = await getPendingData('workouts');
    
    for (const workout of pendingWorkouts) {
      await fetch('/api/workouts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(workout)
      });
    }
    
    await clearPendingData('workouts');
    console.log('[SW] Workout data synced successfully');
  } catch (error) {
    console.error('[SW] Failed to sync workout data:', error);
  }
}

// Sync food data when back online
async function syncFoodData() {
  try {
    const pendingMeals = await getPendingData('meals');
    
    for (const meal of pendingMeals) {
      await fetch('/api/nutrition/diary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(meal)
      });
    }
    
    await clearPendingData('meals');
    console.log('[SW] Food data synced successfully');
  } catch (error) {
    console.error('[SW] Failed to sync food data:', error);
  }
}

// Helper functions for IndexedDB operations
async function getPendingData(storeName) {
  // This would typically use IndexedDB to retrieve pending data
  // For now, return empty array
  return [];
}

async function clearPendingData(storeName) {
  // This would typically clear pending data from IndexedDB
  console.log(`[SW] Clearing pending ${storeName} data`);
}

// Push notification handling
self.addEventListener('push', (event) => {
  console.log('[SW] Push notification received');
  
  const options = {
    body: 'Time to log your workout or meal!',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    vibrate: [200, 100, 200],
    data: {
      url: '/today'
    },
    actions: [
      {
        action: 'log-workout',
        title: 'Log Workout',
        icon: '/icons/workout-action.png'
      },
      {
        action: 'log-meal',
        title: 'Log Meal',
        icon: '/icons/meal-action.png'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification('Feel Sharper', options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked:', event.action);
  
  event.notification.close();
  
  let url = '/today';
  
  if (event.action === 'log-workout') {
    url = '/log/workout';
  } else if (event.action === 'log-meal') {
    url = '/log/meal';
  }
  
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      for (const client of clientList) {
        if (client.url === url && 'focus' in client) {
          return client.focus();
        }
      }
      
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});

console.log('[SW] Service worker loaded successfully');