import type OKXWebSocket from '~/fetch/okx/okx.websocket'
import 'vue'
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

declare module '#app' {
	interface NuxtApp {
		$ws: OKXWebSocket
		$wsb: OKXWebSocket
		$push: (comp: any, params: {}, size: string) => void
		$pushLeft: (comp: any, params: {}, size: string) => void
		$pushUp: (comp: any, params: {}, size: string) => void
		$pushDown: (comp: any, params: {}, size: string) => void
		$clickSound: () => void
		$windowEvent: WindowsEvent
	}
}

interface window {
	__NUXT__: {}
}
declare module 'vue' {
	interface ComponentInternalInstance {
		willDisappear: ((...args:any[]) => void) | null,
    willAppear: ((...args:any[]) => void) | null,
    poped: ((...args:any[]) => void) | null,
	}
}
