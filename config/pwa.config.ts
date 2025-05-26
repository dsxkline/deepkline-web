export default {
	registerType: 'autoUpdate',
	manifest: {
		id: '/',
		start_url: '/?display=standalone',
		scope: '/',
		name: 'DeepKline',
		short_name: 'DeepKline',
		description: 'DeepKline Lite App',
		theme_color: '#1e0b2c',
		background_color: '#1e0b2c',
		display: 'standalone',
		display_override: ['window-controls-overlay'],
		prefer_related_applications: false,
		favicon: false,
		launch_handler: {
			client_mode: 'focus-existing'
		},
		permissions: ['unlimitedStorage'],
		icons: [
			{
				src: '/images/pwa/logo192.png',
				sizes: '192x192',
				type: 'image/png'
			},
			{
				src: '/images/pwa/logo512.png',
				sizes: '512x512',
				type: 'image/png'
			}
		]
	},
	workbox: {
		offline: false,
		runtimeCaching: [
			{
				urlPattern: '.*', // 匹配所有 URL
				handler: 'StaleWhileRevalidate',
				method: 'GET',
				options: {
					cacheName: 'all-cache',
					expiration: {
						//   maxEntries: 200, // 最多缓存 200 个条目
						maxAgeSeconds: 60 * 60 * 24 * 7 // 缓存 7 天
					},
					networkTimeoutSeconds: 30,
					cacheableResponse: {
						statuses: [0, 200] // 只缓存这些响应码的资源
					}
				}
			}
		]
	},
	meta: {
		theme_color: '#1e0b2c', // 确保 meta 标签也设置
		appleMobileWebAppCapable: true,
		appleMobileWebAppStatusBarStyle: 'default',
		mobileAppIOS: true,
		appleStatusBarStyle: 'black-translucent',
		appleIcon: '/images/pwa/apple-touch-icon.png' // 指定 iOS icon
	}
}
