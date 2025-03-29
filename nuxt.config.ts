import colorModeConfig from "./config/color.mode.config";
import componentsConfig from "./config/components.config";
import cssConfig from "./config/css.config";
import headConfig from "./config/head.config";
import modulesConfig from "./config/modules.config";
import pluginsConfig from "./config/plugins.config";
import postcssConfig from "./config/postcss.config";
import tailwindNuxtConfig from "./config/tailwind.nuxt.config";
import config from "./config/config";
require("dotenv").config({ path: ".env." + process.env.NODE_ENV });
// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
	devServer: {
		port: 3010,
		host: "0.0.0.0"
	},
	runtimeConfig: config,
	devtools: { enabled: true },
	modules: modulesConfig,
	tailwindcss: tailwindNuxtConfig,
	colorMode: colorModeConfig,
	app: {
		head: headConfig
	},
	css: cssConfig,
	postcss: postcssConfig,
	components: componentsConfig,
	plugins: pluginsConfig,
});
