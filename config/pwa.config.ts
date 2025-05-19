export default {
	registerType: 'autoUpdate',
	manifest: {
        id: '/',
        start_url: '/?display=standalone',
        scope: '/',
		name: 'DeepKline',
		short_name: 'DeepKline',
		description: 'DeepKline Lite App',
		theme_color: 'rgb(2 6 23)',
        background_color:'rgb(2 6 23)',
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
	}
}
