export default {
	registerType: 'autoUpdate',
	strategies: 'injectManifest', // ⬅️ 使用自定义 SW
	srcDir: 'public',
    filename: 'sw.js',
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
	
}
