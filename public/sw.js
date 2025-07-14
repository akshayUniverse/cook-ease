const CACHE_NAME = 'cookease-v1';
const OFFLINE_CACHE_NAME = 'cookease-offline-v1';

// Define what to cache
const STATIC_ASSETS = [
  '/',
  '/home',
  '/search',
  '/library',
  '/profile',
  '/auth',
  '/offline',
  '/manifest.json',
  '/favicon.ico',
  '/_next/static/css/app.css',
  '/_next/static/chunks/polyfills.js',
  '/_next/static/chunks/webpack.js',
  '/_next/static/chunks/framework.js',
  '/_next/static/chunks/main.js',
  '/_next/static/chunks/pages/_app.js',
  '/_next/static/chunks/pages/_error.js',
  '/_next/static/chunks/pages/index.js',
  '/_next/static/chunks/pages/home.js',
  '/_next/static/chunks/pages/search.js',
  '/_next/static/chunks/pages/library/index.js',
  '/_next/static/chunks/pages/profile/index.js',
  '/_next/static/chunks/pages/auth.js'
];

// API endpoints to cache
const API_CACHE_PATTERNS = [
  '/api/recipes',
  '/api/recipes/saved',
  '/api/users'
];

// Install event - cache static assets
self.addEventListener('install', event => {
  console.log('Service Worker installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('Static assets cached successfully');
        return self.skipWaiting();
      })
      .catch(error => {
        console.error('Failed to cache static assets:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  console.log('Service Worker activating...');
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== CACHE_NAME && cacheName !== OFFLINE_CACHE_NAME) {
              console.log('Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('Service Worker activated');
        return self.clients.claim();
      })
  );
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  
  // Handle API requests
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(handleApiRequest(event.request));
    return;
  }
  
  // Handle navigation requests
  if (event.request.mode === 'navigate') {
    event.respondWith(handleNavigationRequest(event.request));
    return;
  }
  
  // Handle static assets
  if (event.request.destination === 'script' || 
      event.request.destination === 'style' ||
      event.request.destination === 'image' ||
      event.request.url.includes('_next/static')) {
    event.respondWith(handleStaticAsset(event.request));
    return;
  }
  
  // Default: try network first, then cache
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Clone the response for caching
        const responseClone = response.clone();
        
        // Cache successful responses
        if (response.status === 200) {
          caches.open(CACHE_NAME)
            .then(cache => {
              cache.put(event.request, responseClone);
            });
        }
        
        return response;
      })
      .catch(() => {
        // Fallback to cache
        return caches.match(event.request);
      })
  );
});

// Handle API requests with network-first strategy
async function handleApiRequest(request) {
  const url = new URL(request.url);
  
  try {
    // Try network first
    const response = await fetch(request);
    
    // Cache successful GET requests
    if (request.method === 'GET' && response.status === 200) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    
    return response;
  } catch (error) {
    console.log('Network failed for API request, trying cache:', url.pathname);
    
    // For offline, try to serve from cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // If no cache available, return offline response
    if (url.pathname.startsWith('/api/recipes')) {
      return new Response(JSON.stringify({
        recipes: [],
        message: 'You are offline. Please check your internet connection.',
        offline: true
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    throw error;
  }
}

// Handle navigation requests with cache-first for offline pages
async function handleNavigationRequest(request) {
  try {
    // Try network first
    const response = await fetch(request);
    
    // Cache the response
    const cache = await caches.open(CACHE_NAME);
    cache.put(request, response.clone());
    
    return response;
  } catch (error) {
    console.log('Network failed for navigation, trying cache');
    
    // Try to serve from cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Fallback to offline page
    const offlineResponse = await caches.match('/offline');
    if (offlineResponse) {
      return offlineResponse;
    }
    
    // Final fallback - basic offline response
    return new Response(
      `<!DOCTYPE html>
      <html>
        <head>
          <title>CookEase - Offline</title>
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
            .offline-container { max-width: 400px; margin: 0 auto; }
            .offline-icon { font-size: 64px; margin-bottom: 20px; }
            .offline-title { color: #333; margin-bottom: 10px; }
            .offline-message { color: #666; margin-bottom: 20px; }
            .retry-button { 
              background: #ea6100; 
              color: white; 
              padding: 10px 20px; 
              border: none; 
              border-radius: 5px; 
              cursor: pointer; 
            }
          </style>
        </head>
        <body>
          <div class="offline-container">
            <div class="offline-icon">📱</div>
            <h1 class="offline-title">You're Offline</h1>
            <p class="offline-message">Please check your internet connection and try again.</p>
            <button class="retry-button" onclick="window.location.reload()">Retry</button>
          </div>
        </body>
      </html>`,
      {
        headers: { 'Content-Type': 'text/html' }
      }
    );
  }
}

// Handle static assets with cache-first strategy
async function handleStaticAsset(request) {
  // Try cache first for static assets
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }
  
  // If not in cache, fetch from network and cache
  try {
    const response = await fetch(request);
    const cache = await caches.open(CACHE_NAME);
    cache.put(request, response.clone());
    return response;
  } catch (error) {
    console.log('Failed to fetch static asset:', request.url);
    throw error;
  }
}

// Background sync for offline actions
self.addEventListener('sync', event => {
  console.log('Background sync event:', event.tag);
  
  if (event.tag === 'save-recipe') {
    event.waitUntil(syncSavedRecipes());
  }
  
  if (event.tag === 'add-recipe') {
    event.waitUntil(syncAddedRecipes());
  }
});

// Sync saved recipes when back online
async function syncSavedRecipes() {
  try {
    const cache = await caches.open(OFFLINE_CACHE_NAME);
    const requests = await cache.keys();
    
    for (const request of requests) {
      if (request.url.includes('/api/recipes/') && request.method === 'POST') {
        try {
          await fetch(request);
          await cache.delete(request);
          console.log('Synced saved recipe:', request.url);
        } catch (error) {
          console.log('Failed to sync saved recipe:', error);
        }
      }
    }
  } catch (error) {
    console.log('Background sync failed:', error);
  }
}

// Sync added recipes when back online
async function syncAddedRecipes() {
  try {
    const cache = await caches.open(OFFLINE_CACHE_NAME);
    const requests = await cache.keys();
    
    for (const request of requests) {
      if (request.url.includes('/api/recipes') && request.method === 'POST') {
        try {
          await fetch(request);
          await cache.delete(request);
          console.log('Synced added recipe:', request.url);
        } catch (error) {
          console.log('Failed to sync added recipe:', error);
        }
      }
    }
  } catch (error) {
    console.log('Background sync failed:', error);
  }
}

// Push notification handler
self.addEventListener('push', event => {
  console.log('Push notification received:', event);
  
  if (event.data) {
    const data = event.data.json();
    
    const options = {
      body: data.body || 'New recipe available!',
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-72x72.png',
      tag: data.tag || 'recipe-notification',
      data: data.data || {},
      actions: [
        {
          action: 'view',
          title: 'View Recipe',
          icon: '/icons/view-action.png'
        },
        {
          action: 'save',
          title: 'Save for Later',
          icon: '/icons/save-action.png'
        }
      ],
      vibrate: [200, 100, 200],
      requireInteraction: true
    };
    
    event.waitUntil(
      self.registration.showNotification(data.title || 'CookEase', options)
    );
  }
});

// Handle notification clicks
self.addEventListener('notificationclick', event => {
  console.log('Notification clicked:', event);
  
  event.notification.close();
  
  if (event.action === 'view') {
    event.waitUntil(
      clients.openWindow(event.notification.data.url || '/search')
    );
  } else if (event.action === 'save') {
    // Handle save action
    event.waitUntil(
      clients.openWindow('/library')
    );
  } else {
    // Default action
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Handle messages from the main thread
self.addEventListener('message', event => {
  console.log('Service Worker received message:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CACHE_RECIPE') {
    event.waitUntil(cacheRecipe(event.data.recipe));
  }
});

// Cache a specific recipe for offline access
async function cacheRecipe(recipe) {
  try {
    const cache = await caches.open(OFFLINE_CACHE_NAME);
    const recipeUrl = `/api/recipes/${recipe.id}`;
    const response = new Response(JSON.stringify(recipe), {
      headers: { 'Content-Type': 'application/json' }
    });
    await cache.put(recipeUrl, response);
    console.log('Recipe cached for offline access:', recipe.title);
  } catch (error) {
    console.log('Failed to cache recipe:', error);
  }
} 