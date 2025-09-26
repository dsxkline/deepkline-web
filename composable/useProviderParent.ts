import type { ComponentInternalInstance } from 'vue'

export function useProvideParent() {
	// 给子组件全局注入当前顶级盒子实例，push会在当前父级下
	const instance = getCurrentInstance()
	provide('parentContainer', instance)
	// console.log('use provide',instance)
}

export function useGetProvideParent() {
	const parent: ComponentInternalInstance | any = inject('parentContainer', null)
	// 如果是弹框优先
	const currentDialog: ComponentInternalInstance | any = inject('currentDialog', null) // 也能拿到
	console.log('ComponentInternalInstance', parent, currentDialog)
	return currentDialog || parent
}
