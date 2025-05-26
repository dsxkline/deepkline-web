import { version } from '../package.json'
export default {
	title: 'DeepKline is the most silky cryptocurrency trading system.',
	htmlAttrs: {
		lang: 'zh-CN',
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
		{ name: 'apple-mobile-web-app-status-bar-style', content: 'default' },
	],
	link: [
		{
			rel: 'manifest',
			href: '/api/manifest.webmanifest'
		},
        // iphone safari 添加到主屏幕的引导图标
		{
			rel: 'icon',
			href: '/images/pwa/icon.png'
		},
        // Android 启动图标
        {
			rel: 'shortcut icon',
			id: '/images/pwa/logo.png'
		},
        // 添加到桌面的应用图标
		{
			rel: 'apple-touch-icon',
			href: '/apple-touch-icon.png',
            type: 'image/png'
		},
        {
			rel: 'apple-touch-icon-precomposed',
			href: '/apple-touch-icon-precomposed.png',
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
        
	],
	script: [
		{
			src: '/js/dsx.kline_v_3_1_0.js?v=' + version
		},
		{
			src: '/js/qq.hq_v_3_1_0.js?v=' + version
		},
		{
			src: '/kline.js?v=' + version
		}
	]
}
