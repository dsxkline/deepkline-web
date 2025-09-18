import type OKXWebSocket from '~/fetch/okx/okx.websocket'
import 'vue'
import type DKWebSocket from '~/fetch/dk/dk.websocket'
export enum ApiSource {
	OKX,
	BINANCE,
	DSX
}

interface ApiResult<T = any> {
	data: T
	code: number
	msg: string
}


interface WsResult<T = any> {
	payload: T
	event: string
}

declare module '#app' {
	interface NuxtApp {
		$ws: OKXWebSocket
		$wsb: OKXWebSocket
		$dkws: DKWebSocket
		$push: (comp: any, params: {}, size?: string, container?: ComponentInternalInstance | null) => ComponentInternalInstance
		$pushLeft: (comp: any, params: {}, size?: string, container?: ComponentInternalInstance | null) => ComponentInternalInstance
		$pushUp: (comp: any, params: {}, size?: string, container?: ComponentInternalInstance | null) => ComponentInternalInstance
		$pushDown: (comp: any, params: {}, size?: string, container?: ComponentInternalInstance | null) => ComponentInternalInstance
		$pop: (data?: any) => ComponentInternalInstance
		$popRoot: (data?: any, index?: number) => ComponentInternalInstance
		$dialog: (comp: any, params: {}, width?: string, height?: string, title?: string, msg?: string, showCancel?: boolean, showComfirm?: boolean) => ComponentInternalInstance
		$clickSound: () => void
		$windowEvent: WindowsEvent
		$isMobile: globalThis.Ref<boolean>
	}
}

interface window {
	__NUXT__: {}
}
declare module 'vue' {
	interface ComponentInternalInstance {
		willDisappear: ((...args: any[]) => void) | null
		willAppear: ((...args: any[]) => void) | null
		poped: ((...args: any[]) => void) | null
	}
}

export interface PwaInjection {
	/**
	 * @deprecated use `isPWAInstalled` instead
	 */
	isInstalled: boolean
	/**
	 * From version v0.3.5+.
	 */
	isPWAInstalled: Ref<boolean>
	showInstallPrompt: Ref<boolean>
	cancelInstall: () => void
	install: () => Promise<void>
	swActivated: Ref<boolean>
	registrationError: Ref<boolean>
	offlineReady: Ref<boolean>
	needRefresh: Ref<boolean>
	updateServiceWorker: (reloadPage?: boolean | undefined) => Promise<void>
	cancelPrompt: () => Promise<void>
	getSWRegistration: () => ServiceWorkerRegistration | undefined
}

declare module '#app' {
	interface NuxtApp {
		$pwa: UnwrapNestedRefs<PwaInjection>
	}
}

export interface MenuListModel {
		id: number
		code?: string
		name?: string
		subName?: string // 子菜单名称
		icon?: any
		desc?: string
		descIcon?: any // 描述图标
		more?: any
		hide?: boolean
		badge?: number
		callback?: () => void // 点击回调
	}