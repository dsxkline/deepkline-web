import cssConfig from "./config/css.config";
import headConfig from "./config/head.config";
require('dotenv').config({ path:'.env.'+process.env.NODE_ENV })
// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
	devtools: { enabled: true },
	app: {
		head: headConfig
	},
	css: cssConfig,
  
});
