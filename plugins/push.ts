import { defineNuxtPlugin } from '#app'
import { defineComponent, ref, h, render, createVNode, type ComponentInstance, type ComponentInternalInstance } from 'vue'
import { usePushStore } from '@/store/push'
import Push from '~/components/app/Push.vue'
import PushView from '~/components/app/PushView.vue'

function findRoute(path: string, routes: any) {
	try {
		// console.log(routes);
		for (const route of routes) {
			const regex = new RegExp(`^${route.path.replace(/:\w+/g, '(\\w+)')}$`)
			const match = path.match(regex)
			if (match || route.name === path) {
				const keys = (route.path.match(/:\w+/g) || []).map((key: string) => key.substring(1))
				const params: Record<string, string> = {}
				keys.forEach((key: string, index: number) => {
					params[key] = match ? match[index + 1] : ''
				})
				return {
					route,
					params
				}
			}
		}
	} catch (e) {
		console.log(e)
	}

	return {}
}

function getAppComponent(instance: ComponentInternalInstance) {
	let inst = instance
	while (inst?.parent) {
		inst = inst.parent
		if (inst?.type.__name == 'app') break
	}
	return inst
}

let pushing = false
const pushHandle = function (this: ComponentInternalInstance | null, comp: any, params = {}, direction = 'rtl', size = '100%') {
	if (pushing) return
	pushing = true
	// 执行目标willDisappear方法
	let instance = this
	if (instance) {
		const app = getAppComponent(instance)
		if (app.exposed?.refreshChildWillDisAppear) app.exposed?.refreshChildWillDisAppear()
	}
	const pushStore = usePushStore()
	pushStore.setPushState(true)

	let dynamicComponent = {
		url: null,
		component: comp?.default || comp
	}
	// if (typeof comp === "string") {
	//     // 加载路由对应的组件
	//     const routes = this.$router.options.routes;
	//     const { route, params: pas = {} } = findRoute(comp, routes);
	//     if (!route) return;
	//     if (route) dynamicComponent.component = route.component;
	//     params = Object.assign(params, pas);
	// }

	// const instance = getCurrentInstance(); // 获取当前 Vue 组件实例

	// 加载 push 组件
	// 创建 push 组件实例
	// 创建 push 组件的虚拟节点
	const props = {
		to: dynamicComponent.component, // 传递给 Push 组件的动态目标组件
		url: dynamicComponent.url, // 传递 URL 参数
		params: params || [], // 传递额外的参数
		parent: instance, // 传递父组件或上下文
		direction: direction, // 传递方向
		size: size, // 传递大小
		destroy: () => {
			pushInstance.appContext = null
			render(null, box)
			box.remove()
		}
	}
	const pushInstance = createVNode(PushView, props)
	// 手动提供 Nuxt 上下文
	const nuxtApp = useNuxtApp() // 获取 Nuxt 上下文
	pushInstance.appContext = nuxtApp.vueApp._context
	const box = document.createElement('div')
	document.body.appendChild(box)
	// 在某个目标 DOM 元素中挂载组件
	render(pushInstance, box)
	// 查找上一层，实现轻微退出动画
	nextTick(() => {
		box.id = 'push-' + pushInstance.component?.uid
		box.classList.add('push-' + direction)
		if (direction == 'rtl') {
			// 上一个drawer
			console.log('parentDrawer instance', instance)
			if (instance?.vnode.el) {
				const parentDrawer = instance.vnode.el.closest('.drawer-container .drawer-body') as HTMLElement
				console.log('parentDrawer', parentDrawer)
				if (parentDrawer) {
					parentDrawer.style.transform = 'translateX(-30%)'
				} else {
					const __nuxt = document.querySelector('#__nuxt') as HTMLElement
					if (__nuxt) __nuxt.style.transform = 'translateX(-30%)'
				}
			}
		}
	})

	setTimeout(() => {
		pushing = false
	}, 400)

	return pushInstance
}

const pop = function (data:any) {
	const store = usePushStore()
	// 获得栈顶的实例
	let topPush: any = store.getTopPush()
	// 需要查找最顶部的push回传数据
	// 回传数据
	if (topPush?.props && data) topPush.props.popData = data
	// topPush.vnode = null
	// topPush.component = null
	topPush = null
	// 弹出栈顶实例
	store.pop()

	// 父层抽屉恢复
	topPush = store.getTopPush()

	if (topPush) {
		const parentDrawer = topPush.vnode.el.querySelector('.drawer-body') as HTMLElement
		if (parentDrawer && parentDrawer instanceof HTMLElement) {
			parentDrawer.style.transform = 'translateX(0)'
		}
	} else {
		// 顶层
		const nuxt = document.querySelector('#__nuxt')
		if (nuxt && nuxt instanceof HTMLElement) {
			nuxt.style.transform = ''
		}
	}
}

// 右侧弹出
function push(this: any, comp: any, params = {}, size = '100%') {
	return pushHandle.bind(this)(comp, params, 'rtl', size)
}
function pushLeft(this: any, comp: any, params = {}, size = '100%') {
	return pushHandle.bind(this)(comp, params, 'ltr', size)
}

// 底部弹出
function pushUp(this: any, comp: any, params = {}, size = '100%') {
	return pushHandle.bind(this)(comp, params, 'btt', size)
}
function pushDown(this: any, comp: any, params = {}, size = '100%') {
	return pushHandle.bind(this)(comp, params, 'ttb', size)
}

// 返回根视图
const popRoot = function (data: any, index = 0) {
	const pushComopnents = usePushStore().pushComopnents
	const length = pushComopnents.length
	// console.log("popRoot >>>", pushComopnents, index);
	if (length <= 1) return pop(data)
	// index 传负数表示从后往前，index = -1 表示返回倒数第二个，index = -2表示返回倒数第三个，因为倒数第一个是自己也就是index=0
	if (index < 0) {
		for (let i = length - 1; i >= length + index; i--) pop(data)
		return
	}
	for (let i = length - 1; i >= index; i--) pop(data)
}

export default defineNuxtPlugin(({ vueApp }) => {
	const nuxtApp = useNuxtApp()
	nuxtApp.provide('push', push)
	nuxtApp.provide('pushLeft', pushLeft)
	nuxtApp.provide('pushUp', pushUp)
	nuxtApp.provide('pushDown', pushDown)
	nuxtApp.provide('popRoot', popRoot)
	nuxtApp.provide('pop', pop)
	// console.log('push 注入。。。')
})
