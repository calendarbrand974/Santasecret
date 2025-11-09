// Service Worker pour les notifications push

self.addEventListener('push', (event) => {
  const data = event.data?.json() || {}
  const title = data.title || 'Secret Santa'
  const body = data.body || 'Nouvelle notification'
  const icon = data.icon || '/icon-192x192.png'
  
  const options = {
    body,
    icon,
    badge: '/icon-192x192.png',
    data: data.data || {},
  }
  
  event.waitUntil(
    self.registration.showNotification(title, options)
  )
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  
  const data = event.notification.data || {}
  const url = data.url || '/app'
  
  event.waitUntil(
    clients.openWindow(url)
  )
})

