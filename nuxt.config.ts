require('dotenv').config({ path: '.env.' + process.env.NODE_ENV })
import componentsConfig from './config/components.config'
import cssConfig from './config/css.config'
import headConfig from './config/head.config'
import modulesConfig from './config/modules.config'
import pluginsConfig from './config/plugins.config'
import postcssConfig from './config/postcss.config'
import pwaConfig from './config/pwa.config'
import tailwindNuxtConfig from './config/tailwind.nuxt.config'
const config = require('./config/config').default
// https://nuxt.com/docs/api/configuration/nuxt-config

const pwa = pwaConfig as any
pwa.manifest = false;

// console.log('pwa',pwa,modulesConfig)

export default defineNuxtConfig({
	devServer: {
		port: 3010,
		host: '0.0.0.0'
	},
	
	typescript: {
		shim: true
	},
	runtimeConfig: {
		public: config
	},
	devtools: { enabled: true },
	modules: modulesConfig,
	tailwindcss: tailwindNuxtConfig,
	app: {
		head: headConfig
	},
	css: cssConfig,
	postcss: postcssConfig,
	components: componentsConfig,
	plugins: pluginsConfig,
	vite: {
		resolve: {
			alias:
				process.env.NODE_ENV === 'development'
					? {
							vue: 'vue/dist/vue.esm-bundler.js'
					  }
					: {}
		}
	},
	googleFonts: {
		families: {
			'Roboto+Mono': true
		},
		display: 'swap'
	},
	pwa:pwa
})
