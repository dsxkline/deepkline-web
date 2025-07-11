import { defineNuxtPlugin } from '#app'
import { defineComponent, ref, h, render, createVNode, type ComponentInstance, type ComponentInternalInstance } from 'vue'
import { usePushStore } from '@/store/push'
import Dialog from '~/components/app/Dialog.vue'
import PushView from '~/components/app/PushView.vue'
import { getParentRefreshComponent } from '~/composable/usePush'

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

let pushing = false
const pushHandle = function (this: ComponentInternalInstance | null, comp: any, params = {}, direction = 'rtl', size = '100%', container: ComponentInternalInstance | null = null) {
	if (pushing) return
	pushing = true
	// 执行上一个组件实例的willDisappear方法
	let instance = this
	if (instance) {
		const app = getParentRefreshComponent(instance)
		if (app.exposed?.refreshChildWillDisAppear) app.exposed?.refreshChildWillDisAppear()
	}
	const pushStore = usePushStore()
	pushStore.setPushState(true)

	let dynamicComponent = {
		url: null,
		component: comp?.default || comp
	}
	// 渲染节点
	const renderDom = (container && container.vnode.el && container.vnode.el.querySelector('.dialog-push-container .scroll-bar-inner')) || document.body
	console.log('renderDom', renderDom)

	// 加载 push 组件
	// 创建 push 组件实例
	// 创建 push 组件的虚拟节点
	const props = {
		to: dynamicComponent.component, // 传递给 Push 组件的动态目标组件
		url: dynamicComponent.url, // 传递 URL 参数
		params: params || [], // 传递额外的参数
		parent: instance, // 传递父组件或上下文
		direction: direction, // 传递方向
		dialog:container, // 是否身处dialog环境
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
	renderDom.appendChild(box)
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
					if (parentDrawer.classList.contains('rtl')) parentDrawer.style.transform = 'translateX(-30%)'
				} else {
					// 针对dialog处理
					if (renderDom.getAttribute('class').indexOf('scroll-bar-inner')>=0) {
						console.log('dialog-push-container.....')
					} else {
						const __nuxt = document.querySelector('#__nuxt') as HTMLElement
						if (__nuxt) __nuxt.style.transform = 'translateX(-30%)'
					}
				}
			}
		}
	})

	setTimeout(() => {
		pushing = false
	}, 400)

	return pushInstance
}

const pop = function (data: any) {
	const store = usePushStore()
	// 获得栈顶的实例
	let topPush: any = store.getTopPush()
	// 需要查找最顶部的push回传数据
	// 回传数据
	if (topPush?.props && data != undefined) topPush.props.popData = data
	// topPush.vnode = null
	// topPush.component = null
	topPush = null
	// 弹出栈顶实例
	store.pop()

	// 父层抽屉恢复
	topPush = store.getTopPush()

	if (topPush) {
		const parentDrawer = topPush.vnode.el.querySelector('.drawer-body') as HTMLElement
		if (parentDrawer && parentDrawer instanceof HTMLElement && parentDrawer.classList.contains('rtl')) {
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
function push(this: any, comp: any, params = {}, size = '100%', container: ComponentInternalInstance | null = null) {
	return pushHandle.bind(this)(comp, params, 'rtl', size, container)
}
function pushLeft(this: any, comp: any, params = {}, size = '100%', container: ComponentInternalInstance | null = null) {
	return pushHandle.bind(this)(comp, params, 'ltr', size, container)
}

// 底部弹出
function pushUp(this: any, comp: any, params = {}, size = '100%', container: ComponentInternalInstance | null = null) {
	return pushHandle.bind(this)(comp, params, 'btt', size, container)
}
function pushDown(this: any, comp: any, params = {}, size = '100%', container: ComponentInternalInstance | null = null) {
	return pushHandle.bind(this)(comp, params, 'ttb', size, container)
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

const dialogHandle = function (comp: any, params = {}, width: string = '500px', height: string = '500px', title?: string, msg?: string, showCancel?: boolean, showComfirm?: boolean) {
	let dynamicComponent = {
		url: null,
		component: comp?.default || comp
	}

	const props = {
		to: dynamicComponent.component, // 传递给 Push 组件的动态目标组件
		url: dynamicComponent.url, // 传递 URL 参数
		params: params || [], // 传递额外的参数
		height, // 传递大小
		width,
		title: title,
		msg: msg,
		showCancel,
		showComfirm,
		destroy: () => {
			pushInstance.appContext = null
			render(null, box)
			box.remove()
		}
	}
	const pushInstance = createVNode(Dialog, props)
	// 手动提供 Nuxt 上下文
	const nuxtApp = useNuxtApp() // 获取 Nuxt 上下文
	pushInstance.appContext = nuxtApp.vueApp._context
	const box = document.createElement('div')
	document.body.appendChild(box)
	// 在某个目标 DOM 元素中挂载组件
	render(pushInstance, box)
	return pushInstance
}

export default defineNuxtPlugin(({ vueApp }) => {
	const nuxtApp = useNuxtApp()
	nuxtApp.provide('push', push)
	nuxtApp.provide('pushLeft', pushLeft)
	nuxtApp.provide('pushUp', pushUp)
	nuxtApp.provide('pushDown', pushDown)
	nuxtApp.provide('popRoot', popRoot)
	nuxtApp.provide('pop', pop)
	nuxtApp.provide('dialog', dialogHandle)
	// console.log('push 注入。。。')
})
