import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
	appId: 'com.deepkline.web.app',
	appName: 'DeepKline',
	webDir: 'dist',
	plugins: {
		SplashScreen: {
			launchAutoHide: true
		},
		SafeArea: {
			enabled: true,
		}
	}
}

export default config
