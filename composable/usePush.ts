// composables/usePush.ts
import { getCurrentInstance, type ComponentInternalInstance, defineExpose } from 'vue'

export function usePush() {
	let instance = getCurrentInstance()
	if (!instance) throw new Error('must be used in setup')
	return (comp: any, params = {}, size = '100%', container?: ComponentInternalInstance | null) => useNuxtApp().$push.call(instance, comp, params, size, container)
}

export function usePushUp() {
	let instance = getCurrentInstance()
	if (!instance) throw new Error('must be used in setup')
	return (comp: any, params = {}, size = 'auto') => useNuxtApp().$pushUp.call(instance, comp, params, size)
}

export function usePop() {
	return (data?: any, index?: number | undefined) => (index != undefined ? useNuxtApp().$popRoot.call(data, index) : useNuxtApp().$pop.call(data))
}

export function useWillDisappear(cb: (...args: any[]) => void) {
	const register = inject('registerChildWillDisAppear') as ((fn: () => void) => void) | undefined
	register?.(cb)
	// 强制挂一个事件上去 为了刷新自己
	let instance = getCurrentInstance()
	if (instance) (instance as any)['onWillDisAppear'] = cb
	onBeforeUnmount(() => {
		if (instance) (instance as any)['onWillDisAppear'] = null
	})
}

export function useWillAppear(cb: (...args: any[]) => void) {
	const register = inject('registerChildWillAppear') as ((fn: () => void) => void) | undefined
	register?.(cb)
	// 强制挂一个事件上去 为了刷新自己
	let instance = getCurrentInstance()
	if (instance) (instance as any)['onWillAppear'] = cb
	onBeforeUnmount(() => {
		if (instance) (instance as any)['onWillAppear'] = null
	})
}

export function poped(cb: (...args: any[]) => void) {
	const instance = getCurrentInstance()
	if (instance) {
		instance.poped = cb
	}
}

// 是否启用对子组件的事件传递，例如让子组件执行useWillAppear事件
export function useRefreshChildEvent() {
	const instance = getCurrentInstance()
	// 控制子组件将要显示回调
	let childWillAppearlisteners = [] as any[]
	provide('registerChildWillAppear', (refreshFn: () => void) => {
		// console.log('注册进来了吗',refreshFn)
		childWillAppearlisteners.push(refreshFn)
	})
	let refreshChildWillAppear = () => {
		// 刷新自己的
		;(instance as any)?.onWillAppear && (instance as any)?.onWillAppear()
		childWillAppearlisteners.forEach(fn => fn())
	}
	// 控制子组件将要隐藏回调
	let childWillDisAppearlisteners = [] as any[]
	provide('registerChildWillDisAppear', (refreshFn: () => void) => {
		childWillDisAppearlisteners.push(refreshFn)
	})
	let refreshChildWillDisAppear = () => {
		// 刷新自己的
		;(instance as any)?.onWillDisAppear && (instance as any)?.onWillDisAppear()
		childWillDisAppearlisteners.forEach(fn => fn())
	}

	useActivated()
	useDeactivated()

	onBeforeUnmount(() => {
		childWillDisAppearlisteners = []
		childWillAppearlisteners = []
	})

	return {
		refreshChildWillAppear,
		refreshChildWillDisAppear
	}
}

// 寻找定义了子组件事件传递的父组件
export function getParentRefreshComponent(instance: ComponentInternalInstance) {
	let inst = instance
	while (inst?.parent) {
		inst = inst.parent
		if (inst?.exposed?.refreshChildWillAppear) break
	}
	return inst
}

// 当页面重新激活的时候，也激活所有willAppear事件 如果定义了willAppear就不需要再重复定义useActiveted函数了
export function useActivated(cb?: (...args: any[]) => void) {
	const instance = getCurrentInstance()
	// 必须初始化后才能触发
	onActivated(() => {
		cb && cb()
		// 需要触发子组件的useWillAppear
		instance?.exposed?.refreshChildWillAppear && instance?.exposed?.refreshChildWillAppear()
	})
}

// 当页面重新冻结的时候，也激活所有willDisAppear事件 如果定义了willDisAppear就不需要再重复定义useDeactivated函数了
export function useDeactivated(cb?: (...args: any[]) => void) {
	const instance = getCurrentInstance()
	onDeactivated(() => {
		cb && cb()
		// 需要触发子组件的useWillAppear
		instance?.exposed?.refreshChildWillDisAppear && instance?.exposed?.refreshChildWillDisAppear()
	})
}
