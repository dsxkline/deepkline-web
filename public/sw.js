import { precacheAndRoute } from 'workbox-precaching'
import { registerRoute } from 'workbox-routing'
import { StaleWhileRevalidate, CacheFirst } from 'workbox-strategies'
import { CacheableResponsePlugin } from 'workbox-cacheable-response'
import { ExpirationPlugin } from 'workbox-expiration'


// runtime caching: cache homepage
registerRoute(
  ({ request }) => request.mode === 'navigate',
  new StaleWhileRevalidate({
    cacheName: 'html-cache',
    networkTimeoutSeconds: 30,
    plugins: [
      new CacheableResponsePlugin({ statuses: [200] }),
      new ExpirationPlugin({ maxEntries: 1, maxAgeSeconds: 86400 }) // 1 day
    ]
  })
)

// runtime caching: cache static assets
registerRoute(
 ({ request }) =>
    ['script', 'style', 'image', 'font'].includes(request.destination),
  new CacheFirst({
    cacheName: 'static-assets',
    plugins: [
      new CacheableResponsePlugin({ statuses: [200] }),
      new ExpirationPlugin({ maxEntries: 60, maxAgeSeconds: 7 * 86400 }) // 7 days
    ]
  })
)

// 由 @vite-pwa 插入的文件列表
precacheAndRoute(self.__WB_MANIFEST);
// self.addEventListener('install', function (e) {
//   self.skipWaiting()
// })

// self.addEventListener('activate', function (e) {
//   self.registration.unregister()
//     .then(function () {
//       return self.clients.matchAll()
//     })
//     .then(function (clients) {
//       clients.forEach(client => client.navigate(client.url))
//     })
// })