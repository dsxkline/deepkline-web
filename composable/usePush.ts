// composables/usePush.ts
import { getCurrentInstance } from 'vue'

export function usePush() {
	const instance = getCurrentInstance()
	if (!instance) throw new Error('must be used in setup')
	return (comp: any, params = {}, size = '100%') => useNuxtApp().$push.call(instance, comp, params, size)
}

export function usePushUp() {
	const instance = getCurrentInstance()
	if (!instance) throw new Error('must be used in setup')
	return (comp: any, params = {}, size = 'auto') => useNuxtApp().$pushUp.call(instance, comp, params, size)
}

export function usePop() {
	return (data?:any, index?:number|undefined) => index!=undefined?useNuxtApp().$popRoot.call(data,index):useNuxtApp().$pop.call(data)
}



export function useWillDisappear(cb: (...args:any[]) => void) {
    // const instance = getCurrentInstance()
    // if (instance) {
    //     instance.willDisappear = cb
    // }
    const register = inject('registerChildWillDisAppear') as ((fn: () => void) => void) | undefined
    register?.(cb)
}

export function useWillAppear(cb: (...args:any[]) => void) {
    // const instance = getCurrentInstance()
    // if (instance) {
    //     instance.willAppear = cb
    // }
    const register = inject('registerChildWillAppear') as ((fn: () => void) => void) | undefined
    register?.(cb)
}

export function poped(cb: (...args:any[]) => void) {
    const instance = getCurrentInstance()
    if (instance) {
        instance.poped = cb
    }
}