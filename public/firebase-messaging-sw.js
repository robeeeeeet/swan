/**
 * Firebase Cloud Messaging Service Worker
 * Handles background push notifications for Swan PWA
 */

// Import Firebase scripts (using compat version for Service Worker)
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// Firebase configuration (same as client-side)
// Note: These are public keys, safe to include in client-side code
const firebaseConfig = {
  apiKey: "AIzaSyBHOM9pbzvPayxCiwRQxNV5XzNDwoSU0Gs",
  authDomain: "swan-e2171.firebaseapp.com",
  projectId: "swan-e2171",
  storageBucket: "swan-e2171.firebasestorage.app",
  messagingSenderId: "273571944472",
  appId: "1:273571944472:web:3a8526f47dd82217c30b6d"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Get Firebase Messaging instance
const messaging = firebase.messaging();

/**
 * Handle background messages
 * This is called when:
 * - The app is in the background
 * - The app is closed
 * - The notification is a data-only message
 */
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message:', payload);

  // Extract notification data
  const notificationTitle = payload.notification?.title || payload.data?.title || 'Swan';
  const notificationOptions = {
    body: payload.notification?.body || payload.data?.body || '',
    icon: payload.notification?.icon || '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    tag: payload.data?.type || 'swan-notification',
    data: {
      url: payload.data?.url || payload.fcmOptions?.link || '/dashboard',
      type: payload.data?.type || 'general',
      timestamp: payload.data?.timestamp || Date.now().toString(),
    },
    // Notification behavior
    vibrate: [100, 50, 100],
    requireInteraction: false,
    silent: false,
  };

  // Show notification
  return self.registration.showNotification(notificationTitle, notificationOptions);
});

/**
 * Handle notification click
 */
self.addEventListener('notificationclick', (event) => {
  console.log('[firebase-messaging-sw.js] Notification clicked:', event);

  // Close the notification
  event.notification.close();

  // Get the URL to open
  const urlToOpen = event.notification.data?.url || '/dashboard';

  // Handle the click - open or focus the app
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // Check if there's already a window open
      for (const client of windowClients) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          // Navigate to the URL and focus the window
          client.navigate(urlToOpen);
          return client.focus();
        }
      }

      // If no window is open, open a new one
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

/**
 * Handle notification close
 */
self.addEventListener('notificationclose', (event) => {
  console.log('[firebase-messaging-sw.js] Notification closed:', event);

  // Optional: Track notification dismissal
  // You could send analytics here
});

/**
 * Handle push event (fallback for non-FCM push messages)
 */
self.addEventListener('push', (event) => {
  console.log('[firebase-messaging-sw.js] Push event received:', event);

  // If the push event has data that wasn't handled by onBackgroundMessage
  if (event.data) {
    try {
      const data = event.data.json();

      // Only show notification if it wasn't handled by FCM
      if (!data.notification && data.data) {
        const title = data.data.title || 'Swan';
        const options = {
          body: data.data.body || '',
          icon: '/icons/icon-192x192.png',
          badge: '/icons/icon-72x72.png',
          data: {
            url: data.data.url || '/dashboard',
            type: data.data.type || 'general',
          },
        };

        event.waitUntil(
          self.registration.showNotification(title, options)
        );
      }
    } catch (error) {
      console.error('[firebase-messaging-sw.js] Error parsing push data:', error);
    }
  }
});

console.log('[firebase-messaging-sw.js] Service Worker loaded');
