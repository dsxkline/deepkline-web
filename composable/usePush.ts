// composables/usePush.ts
import { getCurrentInstance } from 'vue'

export function usePush() {
	const instance = getCurrentInstance()
	if (!instance) throw new Error('must be used in setup')
	return (comp: any, params = {}, size = '100%') => useNuxtApp().$push.call(instance, comp, params, size)
}

export function useWillDisappear(cb: (...args:any[]) => void) {
    const instance = getCurrentInstance()
    if (instance) {
        instance.willDisappear = cb
    }
}

export function useWillAppear(cb: (...args:any[]) => void) {
    const instance = getCurrentInstance()
    if (instance) {
        instance.willAppear = cb
    }
}

export function poped(cb: (...args:any[]) => void) {
    const instance = getCurrentInstance()
    if (instance) {
        instance.poped = cb
    }
}