import colorModeConfig from "./config/color.mode.config";
import componentsConfig from "./config/components.config";
import cssConfig from "./config/css.config";
import headConfig from "./config/head.config";
import modulesConfig from "./config/modules.config";
import pluginsConfig from "./config/plugins.config";
import postcssConfig from "./config/postcss.config";
import tailwindNuxtConfig from "./config/tailwind.nuxt.config";
import { resolve } from "path";
require("dotenv").config({ path: ".env." + process.env.NODE_ENV });
// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
	devServer: {
		port: 3010,
		host: "0.0.0.0"
	},
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
	hooks: {
		"pages:extend": (pages) => {
			// qiankun微前端需要的追加自定义的路由
			pages.push({
				path: "/wikitrade",
				file: resolve(__dirname, "components/QianKunContent.vue"),
				children: [
					{
						path: "/:slug(.*)*", // 一定要加上这段兜底，不然qiankun匹配不到子应用的路由
						file: resolve(__dirname, "components/QianKunContent.vue")
					}
				]
			});
		}
	}
});
