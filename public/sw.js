
// Service Worker for Push Notifications
const CACHE_NAME = 'food-delivery-notifications-v1';

self.addEventListener('push', function(event) {
  console.log('Push message received:', event);
  
  let notificationData = {};
  
  if (event.data) {
    try {
      notificationData = event.data.json();
    } catch (e) {
      notificationData = { title: 'New Notification', body: event.data.text() };
    }
  }

  const title = notificationData.title || 'Food Delivery Update';
  const options = {
    body: notificationData.body || 'You have a new update',
    icon: '/icon-192x192.png',
    badge: '/badge-72x72.png',
    data: notificationData.data || {},
    tag: notificationData.tag || 'default',
    requireInteraction: true,
    actions: [
      {
        action: 'view',
        title: 'View Details',
        icon: '/icon-192x192.png'
      },
      {
        action: 'dismiss',
        title: 'Dismiss',
        icon: '/icon-192x192.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

self.addEventListener('notificationclick', function(event) {
  console.log('Notification clicked:', event);
  
  event.notification.close();

  if (event.action === 'view') {
    const orderId = event.notification.data?.orderId;
    const url = orderId ? `/orders/${orderId}` : '/';
    
    event.waitUntil(
      clients.openWindow(url)
    );
  } else if (event.action === 'dismiss') {
    // Just close the notification
    return;
  } else {
    // Default action - open the app
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

self.addEventListener('install', function(event) {
  console.log('Service Worker installing');
  self.skipWaiting();
});

self.addEventListener('activate', function(event) {
  console.log('Service Worker activating');
  event.waitUntil(self.clients.claim());
});
