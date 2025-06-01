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
		$push: (thisUid:number,comp: any, params: {}, size?: string) => void
		$pushLeft: (thisUid:number,comp: any, params: {}, size?: string) => void
		$pushUp: (thisUid:number,comp: any, params: {}, size?: string) => void
		$pushDown: (thisUid:number,comp: any, params: {}, size?: string) => void
		$pop: (data?: any) => void
		$popRoot: (data?: any, index?: number) => void
		$clickSound: () => void
		$windowEvent: WindowsEvent,
    $isMobile:globalThis.Ref<boolean>,
	}
}

interface window {
	__NUXT__: {},
	pushing: number
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