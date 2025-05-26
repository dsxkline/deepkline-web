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
	({ request }) => ['script', 'style', 'image', 'font'].includes(request.destination),
	new CacheFirst({
		cacheName: 'static-assets',
		plugins: [
			new CacheableResponsePlugin({ statuses: [200] }),
			new ExpirationPlugin({ maxEntries: 60, maxAgeSeconds: 7 * 86400 }) // 7 days
		]
	})
)

// 由 @vite-pwa 插入的文件列表
precacheAndRoute(self.__WB_MANIFEST)

// sw.js 或 sw.ts 中：
self.addEventListener('install', event => {
	self.skipWaiting() // 立即激活新 SW
})

self.addEventListener('activate', event => {
	// event.waitUntil(
	// 	(async () => {
	// 		// 让这个 Service Worker 控制所有客户端页面
	// 		await self.clients.claim()

	// 		// // 获取所有控制中的客户端（标签页）
	// 		const allClients = await self.clients.matchAll({ type: 'window' })

	// 		// 逐个刷新页面
	// 		for (const client of allClients) {
	// 			client.navigate(client.url)
	// 		}
	// 	})()
	// )
})

// 🧼 监听 message 事件
self.addEventListener('message', async (event) => {
  const data = event.data
  if (data && data.action === 'clearAllCaches') {
    try {
      const keys = await caches.keys()
      await Promise.all(keys.map((key) => key=='html-cache' && caches.delete(key)))
      console.log('[SW] 所有缓存已清理')
      event.ports?.[0]?.postMessage({ success: true })
    } catch (err) {
      console.error('[SW] 删除缓存出错:', err)
      event.ports?.[0]?.postMessage({ success: false, error: err })
    }
  }
})
