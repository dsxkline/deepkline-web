import type { NuxtI18nOptions } from '@nuxtjs/i18n'

export const i18nConfig: NuxtI18nOptions = {
	// 默认语言
	defaultLocale: ((process.client ? navigator.language : null) || 'en') as any,
	// 可用语言
	locales: [
		{ code: 'en', iso: 'en-US', file: 'TXT_en.json', name: 'English' },
		{ code: 'zh-CN', iso: 'zh-CN', file: 'TXT_zh-CN.json', name: '简体中文' },
		{ code: 'zh-TW', iso: 'zh-TW', file: 'TXT_zh-TW.json', name: '繁體中文' }
	],
	langDir: 'locales',
	strategy: 'no_prefix' // /terms (zh), /en/terms, /zh-TW/terms
	// detectBrowserLanguage: {
	// 	useCookie: true,
	// 	cookieKey: 'lang',
	// 	redirectOn: 'root',
	//     alwaysRedirect: false // 手动切换路由
	// }
}
