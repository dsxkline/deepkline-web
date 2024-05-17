import cssConfig from "./config/css.config";
import headConfig from "./config/head.config";
import postcssConfig from "./config/postcss.config";
require("dotenv").config({ path: ".env." + process.env.NODE_ENV });
// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
	devtools: { enabled: true },
	modules: ["@nuxtjs/tailwindcss", "@nuxtjs/color-mode",'@pinia/nuxt','@element-plus/nuxt'],
	tailwindcss: {
		cssPath: ["~/assets/css/tailwind.css", { injectPosition: "first" }],
		configPath: "./config/tailwind.config",
		exposeConfig: {
			level: 2
		},
		config: {},
		viewer: true
	},
	colorMode: {
		classSuffix: ""
	},
	app: {
		head: headConfig
	},
	css: cssConfig,
	postcss: postcssConfig,
	components: ["~/components", "~/components/common"],
	
});
