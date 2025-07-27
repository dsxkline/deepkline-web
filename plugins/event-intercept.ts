import { useStore } from '~/store'
import { useUserStore } from '~/store/user'

interface WindowsEvent {
	quiescentTimeout: number
	quiescentTime: number
	checkBrowserTimer: any
	isBrowserDelay: boolean
	events: (() => void)[]
}
class WindowsEvent {
	quiescentTimeout: number
	quiescentTime: number
	checkBrowserTimer: any
	isBrowserDelay: boolean
	events: (() => void)[] = []
	isLeave: boolean
	constructor() {
		// 静止时间，行情停止刷新超过2分钟，显现时自动刷新一次
		this.quiescentTimeout = 60 * 1000
		this.quiescentTime = 0
		this.checkBrowserTimer = null
		this.isBrowserDelay = false
		this.isLeave = false
		this.windowEvents()
	}

	addEvent(fn: () => void) {
		this.events = this.events.filter(item => item !== fn)
		this.events.push(fn)
	}

	removeEvent(fn: () => void) {
		this.events = this.events.filter(item => item !== fn)
	}

	removeAllEvent() {
		this.events = []
	}

	windowEvents() {
		// blur 事件 - 当窗口失去焦点时触发
		// window.addEventListener('blur', this.blurHandler)
		// pagehide 事件 - 当页面隐藏时触发
		window.addEventListener('pagehide', this.pagehideHandler)
		// freeze 事件 - 当应用冻结时触发
		document.addEventListener('freeze', this.freezeHandler)
		// 切换网页标签栏事件
		document.addEventListener('visibilitychange', this.visibilityChangeHandler)
		// app 回到前台 focus 事件 - 当窗口获得焦点时触发
		// window.addEventListener('focus', this.focusHandler)
		//pageshow 事件 - 当页面重新显示时触发 event.persisted 表示页面是否从缓存加载
		window.addEventListener('pageshow', this.pageshowHandler)
		// resume 事件 - 当应用从后台恢复时触发
		document.addEventListener('resume', this.resumeHandler)
		// 定时器限流检测
		this.checkBrowserHeart()

		this.clearWindowEvent()
	}

	clearWindowEvent() {
		// 禁用双指放大
		document.addEventListener('dblclick', this.dblclickHandle, { passive: false })
		document.addEventListener('touchstart', this.touchstartHandle, { passive: false })
		document.addEventListener('touchmove', this.touchMoveHandle, { passive: false })
		document.addEventListener('gesturestart', this.dblclickHandle, { passive: false })

		// 禁止右键点击
		// document.addEventListener('contextmenu', function (event) {
		// 	event.preventDefault(); // 取消默认右键菜单
		// });
	}

	dblclickHandle(event: Event) {
		event.preventDefault()
	}
	touchstartHandle(event: TouchEvent) {
		// console.log('touchstart',event.target)
		// 取消拦截
		const cancelStop = (event.target as HTMLElement).closest('.cancel-stop-touch')
		if (cancelStop) return
		if (event.touches.length > 1) {
			event.preventDefault()
		}
		event.stopPropagation()
	}
	touchMoveHandle(event: TouchEvent) {
		// 取消拦截
		const cancelStop = (event.target as HTMLElement).closest('.cancel-stop-touch')
		if (cancelStop) return
		event.stopPropagation()
	}

	// 浏览器限流检测，一般是标签被隐藏或浏览器回到后台，或熄屏后
	checkBrowserHeart() {
		let lastTime = Date.now()
		this.checkBrowserTimer = setInterval(() => {
			const now = Date.now()
			const delta = now - lastTime

			if (delta > 1500) {
				// 超过预期时间间隔，可能被限流
				console.log(`限流检测：延迟了 ${delta - 1000} 毫秒`, new Date())
				if (!this.isBrowserDelay) {
					this.isBrowserDelay = true
					this.leaveForeground()
				}
			}
			// else {
			// 	// 当浏览器限流后恢复到正常定时器频率
			// 	if (this.isBrowserDelay) {
			// 		this.resumeForeground()
			// 	}
			// 	this.isBrowserDelay = false
			// }

			lastTime = now
		}, 1000)
	}

	clearCheckBrowserHeart() {
		if (this.checkBrowserTimer) clearInterval(this.checkBrowserTimer)
	}

	leaveForeground() {
		useStore().isLeave = this.isLeave
		if (this.isLeave) return
		console.log('leaveForeground', new Date())
		// 离开前台
		// 窗口失去焦点时的处理
		this.quiescentTime = new Date().getTime()
		this.isLeave = true
	}
	// 恢复前台
	resumeForeground() {
		this.isLeave = false
		useStore().isLeave = this.isLeave
		// 恢复前台
		const t = new Date().getTime() - this.quiescentTime
		console.log('resumeForeground', t, this.isBrowserDelay, this.quiescentTimeout, new Date())
		if (t > this.quiescentTimeout && this.isBrowserDelay) {
			// 刷新k线自动刷新时间
			this.quiescentTime = new Date().getTime()
			// 超过2分钟，刷新K线图
			// 回调
			this.events.forEach(fn => fn())
		}
		this.isBrowserDelay = false
	}

	// 处理程序
	blurHandler = () => {
		console.log('blurHandler')
		this.leaveForeground()
	}

	pagehideHandler = () => {
		console.log('pagehideHandler')
		this.leaveForeground()
	}

	freezeHandler = () => {
		console.log('freezeHandler')
		this.leaveForeground()
	}

	visibilityChangeHandler = () => {
		console.log('visibilityChangeHandler', document.visibilityState, new Date())
		if (document.visibilityState === 'hidden') {
			// 页面不可见时执行的操作
			this.leaveForeground()
		} else {
			// 页面可见时执行的操作
			this.resumeForeground()
		}
	}

	focusHandler = () => {
		console.log('focusHandler')
		this.resumeForeground()
	}

	pageshowHandler = () => {
		console.log('pageshowHandler')
		this.resumeForeground()
	}
	resumeHandler = () => {
		console.log('resumeHandler')
		this.resumeForeground()
	}

	destroy() {
		this.removeAllEvent()
		this.clearCheckBrowserHeart()
		document.removeEventListener('visibilitychange', this.visibilityChangeHandler)
		// 移除后台事件监听
		window.removeEventListener('blur', this.blurHandler)
		window.removeEventListener('pagehide', this.pagehideHandler)
		document.removeEventListener('freeze', this.freezeHandler)
		// 移除恢复前台事件
		document.removeEventListener('resume', this.resumeHandler)
		window.removeEventListener('focus', this.focusHandler)
		window.removeEventListener('pageshow', this.pageshowHandler)
		document.removeEventListener('dblclick', this.dblclickHandle)
		document.removeEventListener('touchstart', this.touchstartHandle)
		document.removeEventListener('touchmove', this.touchMoveHandle)
		document.removeEventListener('gesturestart', this.dblclickHandle)
	}
}
const soundHandle = (audio: HTMLAudioElement) => () => {
	// 播放音效
	audio.currentTime = 0
	audio.play().catch(() => {})
}
// function clickSoundHandle(audio: HTMLAudioElement) {
// 	return (event: MouseEvent) => {
// 		const path = event.composedPath?.() || [] // 获取事件传播路径
// 		for (const el of path) {
// 			if (!(el instanceof HTMLElement)) continue
// 			// 判断原生 onclick 或 Vue 绑定过的 click 事件
// 			if (
// 				typeof el.onclick === 'function' || // 原生 DOM
// 				el.getAttributeNames().some(attr => attr.startsWith('@click') || attr === 'v-on:click' || attr == 'click-sound') // Vue 模板
// 			) {
// 				// 播放音效
// 				soundHandle(audio)
// 				break
// 			}
// 		}
// 	}
// }

function storageHandle(this: BroadcastChannel, ev: MessageEvent) {
	useUserStore().logout()
}

function beforeunload() {
	// 页面离开或者刷新的时候注销组件释放内存等
	console.log('beforeunload')
	useNuxtApp().$windowEvent.destroy()
	useStore().unload = true
	useNuxtApp().$ws.destroy()
	useNuxtApp().$wsb.destroy()
	useNuxtApp().$dkws.destroy()
	window.removeEventListener('beforeunload', beforeunload)
	console.log('beforeunload success')
}

export default defineNuxtPlugin(({ vueApp }) => {
	const nuxtApp = useNuxtApp()
	if (process.client) {
		// 注入浏览器激活事件
		nuxtApp.provide('windowEvent', new WindowsEvent())
		const audio = new Audio('/sounds/click.mov')
		nuxtApp.provide('clickSound', soundHandle(audio))

		window.addEventListener('beforeunload', beforeunload)
		const channel = new BroadcastChannel('logout')
		channel.onmessage = storageHandle
	}
})
