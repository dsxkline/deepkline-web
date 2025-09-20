import { version } from '../package.json'
const winUrlPrefx = (process.env.MODE != 'win' && process.env.MODE != 'mac') ? '' : '.'
export default {
	title: 'DeepKline Deep Vision · Smart Trading',
	htmlAttrs: {
		lang: 'zh-CN',
		class: 'dark'
	},
	meta: [
		{ charset: 'utf-8' },
		{
			name: 'viewport',
			content: 'width=device-width,initial-scale=1,minimum-scale=1,maximum-scale=1,user-scalable=no,viewport-fit=cover'
		},
		// 禁用电话号码自动识别
		{ name: 'format-detection', content: 'telephone=no' },
		// 是否启用全屏模式
		{ name: 'apple-mobile-web-app-capable', content: 'yes' },
		{ name: 'mobile-web-app-capable', content: 'yes' },
		{ name: 'apple-mobile-web-app-status-bar-style', content: 'default' }
	],
	link: [
		{
			rel: 'icon',
			href: winUrlPrefx + '/favicon.ico',
			type: 'image/x-icon'
		},
		// iphone safari 添加到主屏幕的引导图标
		{
			rel: 'icon',
			href: winUrlPrefx + '/images/pwa/apple-touch-icon.png'
		},
		// Android 启动图标
		{
			rel: 'shortcut icon',
			id: winUrlPrefx + '/images/pwa/logo.png'
		},
		// 添加到桌面的应用图标
		{
			rel: 'apple-touch-icon',
			href: winUrlPrefx + '/apple-touch-icon.png',
			type: 'image/png'
		},
		{
			rel: 'apple-touch-icon-precomposed',
			href: winUrlPrefx + '/apple-touch-icon-precomposed.png',
			type: 'image/png'
		},

		// <!-- iOS 启动画面 -->
		// <!-- iPad 竖屏 768 x 1004（标准分辨率） -->
		// <link rel="apple-touch-startup-image" sizes="768x1004" href="/splash-screen-768x1004.png" />
		// <!-- iPad 竖屏 1536x2008（Retina） -->
		// <link rel="apple-touch-startup-image" sizes="1536x2008" href="/splash-screen-1536x2008.png" />
		// <!-- iPad 横屏 1024x748（标准分辨率） -->
		// <link rel="apple-touch-startup-image" sizes="1024x748" href="/Default-Portrait-1024x748.png" />
		// <!-- iPad 横屏 2048x1496（Retina） -->
		// <link rel="apple-touch-startup-image" sizes="2048x1496" href="/splash-screen-2048x1496.png" />
		// <!-- iPhone/iPod Touch 竖屏 320x480 (标准分辨率) -->
		// <link rel="apple-touch-startup-image" href="/splash-screen-320x480.png" />
		// <!-- iPhone/iPod Touch 竖屏 640x960 (Retina) -->
		// <link rel="apple-touch-startup-image" sizes="640x960" href="/splash-screen-640x960.png" />
		// <!-- iPhone 5/iPod Touch 5 竖屏 640x1136 (Retina) -->
		// <link rel="apple-touch-startup-image" sizes="640x1136" href="/splash-screen-640x1136.png" />

		{
			rel: 'apple-touch-startup-image',
			href: winUrlPrefx + '/images/pwa/launch-iphonexsmax-1242x2688.png',
			media: '(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)'
		}
	],
	script: [
		{
			src: winUrlPrefx + '/js/dsx.kline_v_3_1_0.js?v=' + version
		},
		// {
		// 	src: winUrlPrefx + '/js/qq.hq_v_3_1_0.js?v=' + version
		// },
		// {
		// 	src: winUrlPrefx + '/kline.js?v=' + version
		// }
	]
}
