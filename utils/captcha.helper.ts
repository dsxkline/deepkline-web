export interface ICaptchaResult {
	ret: number
	// //验证成功的票据
	ticket: string
	// 本次验证的随机串，后续票据校验时需传递该参数。
	randstr: string
	actionDuration?: number
	verifyDuration?: number
	appid: string
	bizState?: string
	sid?: string
	errorCode?: string
	errMessage?: string
}

export enum ICaptchaUserLanguages {
	zhcn = 'zh-cn',
	zhhk = 'zh-hk',
	zhtw = 'zh-tw',
	en = 'en',
	ar = 'ar',
	my = 'my',
	fr = 'fr',
	de = 'de',
	he = 'he',
	hi = 'hi',
	id = 'id',
	it = 'it',
	ja = 'ja',
	ko = 'ko',
	lo = 'lo',
	ms = 'ms',
	pl = 'pl',
	pt = 'pt',
	ru = 'ru',
	es = 'es',
	th = 'th',
	tr = 'tr',
	vi = 'vi',
	fil = 'fil',
	ur = 'ur'
}

export interface ICaptchaOptions {
	// 自定义透传参数，业务可用该字段传递少量数据，该字段的内容会被带入 callback 回调的对象中。
	bizState: any
	// 开启自适应深夜模式或强制深夜模式。（VTT 空间语义验证暂不支持该功能）
	// 开启自适应深夜模式: {"enableDarkMode": true}
	// 强制深夜模式: {"enableDarkMode": 'force'}
	enableDarkMode: boolean | string
	// 示例 {"width": 140, "height": 140}
	// 仅支持移动端原生 webview 调用时传入，用来设置验证码 loading 加载弹窗的大小（注意，并非验证码弹窗大小）。
	sdkOpts: Object
	// 验证码加载完成的回调，回调参数为验证码实际的宽高（单位：px）：
	// {"sdkView": {
	// "width": number,
	// "height": number
	// }}
	// 该参数仅为查看验证码宽高使用，请勿使用此参数直接设定宽高。
	ready: (sdkView: { width: number; height: number }) => void
	// 隐藏帮助按钮或自定义帮助按钮链接。（VTT 空间语义验证暂不支持自定义链接）
	// 隐藏帮助按钮: {"needFeedBack": false }
	// 自定义帮助链接: {"needFeedBack": 'url地址' }
	needFeedBack: boolean | string
	// 是否在验证码加载过程中显示loading框。不指定该参数时，默认显示loading框。
	// 显示 loading 框: {"loading": true}
	// 不显示 loading 框: {"loading": false} （展示方式为嵌入式时不支持配置）
	loading: boolean
	// 指定验证码提示文案的语言，优先级高于控制台配置。（VTT 空间语义、文字点选验证暂不支持语言配置）
	// 支持传入值同 navigator.language 用户首选语言，大小写不敏感。
	// 详情参见 ICaptchaUserLanguages
	userLanguage: ICaptchaUserLanguages
	// 定义验证码展示方式。
	// popup（默认）弹出式，以浮层形式居中弹出展示验证码。
	// embed 嵌入式，以嵌入指定容器元素中的方式展示验证码。
	type: string
	// CaptchaAppId 加密校验串，可选参数。详情见
	aidEncrypted: string
	// duration 渲染耗时 + sid 回调函数
	showFn: () => void
}

export declare class TencentCaptcha {
	constructor(captchaAppId: string, callback: (res: ICaptchaResult) => void, options: Object)
	show: () => void
}

export function createTicket(appid: string) {
	return 'trerror_1001_' + appid + '_' + Math.floor(new Date().getTime() / 1000)
}

export function createCaptcha(appId: string, callback: (res: ICaptchaResult) => void) {
	return new TencentCaptcha(appId, callback, {})
}
