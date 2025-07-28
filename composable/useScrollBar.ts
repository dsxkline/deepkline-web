import { inject } from 'vue'

export function useRefreshChildScrollTop() {
	// 控制子组件将要显示回调
	let childlisteners = [] as any[]
	provide('scrollTop', (refreshFn: (scrollTop: number) => void) => {
		console.log('注册进来了吗',refreshFn)
		childlisteners.push(refreshFn)
	})
	let refreshChildScrollTop = (scrollTop: number) => {
		childlisteners.forEach(fn => fn(scrollTop))
	}

	onBeforeUnmount(() => {
		childlisteners = []
	})

	return refreshChildScrollTop
}

export const useScrollTop = (cb: (scrollTop: number) => void) => {
	const register = inject('scrollTop') as ((fn: (scrollTop: number) => void) => void) | undefined
	register && register?.(cb)
}
