require('dotenv').config({ path: '.env.' + process.env.NODE_ENV })
import type { NuxtConfig } from 'nuxt/config'
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
const winPack = process.env.MODE == 'win'||process.env.MODE == 'mac'
console.log('是否PC打包', winPack)
const pwa = pwaConfig as any
pwa.manifest = false

// console.log('pwa',pwa,modulesConfig)

const defaultConfig: NuxtConfig = {
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
	devtools: { enabled: false },
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
	pwa: pwa,
	experimental:{
		appManifest:process.env.NODE_ENV != 'development'
	}
}

const winPackConfig: NuxtConfig = {
	ssr: false,
	nitro: {
		preset: 'static',
		runtimeConfig: {
			app: {
				baseURL: './'
			}
		}
	},
	router: {
		options: {
			hashMode: true
		}
	}
}

Object.assign(defaultConfig, winPack ? winPackConfig : {})

export default defineNuxtConfig(defaultConfig)
