<script setup lang="ts">
	import { usePushStore } from '~/store/push'
	import type { DrawerProps } from 'element-plus'
	import { getCurrentInstance, render, type ComponentInternalInstance } from 'vue'
	// import SymbolSearch from '../symbol/SymbolSearch.vue';
	const instance = getCurrentInstance()
	const props = defineProps<{
		visible?: boolean
		direction?: DrawerProps['direction']
		size?: string
		asyncComponent?: Component
		url?: string
		to?: any
		params?: any
		popData?: any
		parent: ComponentInternalInstance
	}>()
	const drawerSize = ref(props.size)
	const drawerContainer = ref<HTMLElement | null>(null)
	const container = ref<HTMLElement | null>(null)
	const show = ref(true)
	// 异步加载组件
	const asyncComp = defineAsyncComponent(() => {
		return new Promise((resolve, reject) => {
			if (props.to) {
				resolve(props.to)
			} else {
				reject(new Error('No async component provided'))
			}
		})
	})

	const hide = () => {
		visibleDrawer.value = false
	}
    const beforeClose = () => {
        
        // 手动卸载el-drawer组件
        if (drawerContainer.value) {
            const elDrawer = drawerContainer.value.querySelector('.el-drawer')
            console.log('drawer beforeClose', elDrawer)
            if (elDrawer) {
                // render(null, elDrawer as HTMLElement) // 卸载组件
                const __vnode = (elDrawer as any).__vnode
                console.log('drawer beforeClose', __vnode)
                if (__vnode) {
                    // 调用组件的卸载方法
                    __vnode.el = null
                    __vnode.component = null
                    __vnode.appContext = null // 清除组件的上下文
                    __vnode.ctx = null // 清除组件的上下文
                    __vnode.children = null
                    __vnode.props = null
                    __vnode.ref = null
                    __vnode.provides = null // 清除组件的依赖注入
                }
                const __vueParentComponent = (elDrawer as any).__vueParentComponent
                if (__vueParentComponent) {
                    render(null, __vueParentComponent) // 卸载组件
                    // 清除父组件的引用
                    __vueParentComponent.el = null
                    __vueParentComponent.component = null
                    __vueParentComponent.appContext = null // 清除组件的上下文
                    __vueParentComponent.ctx = null // 清除组件的上下文
                    __vueParentComponent.parent = null // 清除父组件的引用
                    __vueParentComponent.vnode = null // 清除组件的虚拟节点
                    __vueParentComponent.props = null // 清除组件的props引用
                    __vueParentComponent.provides = null // 清除组件的依赖注入
                    __vueParentComponent.update = null // 清除组件的更新方法
                    __vueParentComponent.subTree = null // 清除组件的子树
                }
                console.log('drawer beforeClose', __vueParentComponent)
            }
        }
    }
	const close = () => {
		hide()
	}
	const closed = () => {
		//console.log('drawer 调用 closed', drawerContainer.value)
		nextTick(() => {
			show.value = false
		})
	}

	// 是否显示
	const visibleDrawer = computed({
		get: () => {
			const vs = usePushStore().getPushComponent(instance) >= 0 ? true : false
			//console.log('visibleDrawer', vs)
			return vs
		},
		set: val => {
			const vs = usePushStore().getPushComponent(instance) >= 0 ? true : false
			//console.log('visibleDrawer set', val, vs)
			if (!val && vs) usePushStore().pop()
			// 关闭drawer后，开始卸载当前组件
			if (container.value) {
				render(null, container.value as HTMLElement)
			}
		}
	})

	let contentHeight = 0
	const swipeDown = (distance: number, time: number, end: boolean) => {
		if (!drawerContainer.value) return
		// 跟着滑下来
		const content = drawerContainer.value.querySelector('.el-drawer.btt') as HTMLElement
		if (content) {
			if (!contentHeight && content.clientHeight > 0) contentHeight = content.clientHeight
			content.style.transition = 'unset'
			content.style.height = contentHeight - distance + 'px'
			// 下拉关闭
			drawerSize.value = content.style.height
			if (end) {
				content.style.transition = 'all var(--el-transition-duration)'
				if ((distance > contentHeight / 2 && time > 0) || (distance > 70 && time < 200 && time > 0)) {
					// 关闭
					hide()
				} else {
					// 恢复原始高度
					content.style.height = props.size || ''
					drawerSize.value = props.size
				}
			}
		}
	}

	onUnmounted(() => {
		// 获取组件的父级
		if (props.parent) {
			let parent: ComponentInternalInstance | null = props.parent
			while (parent) {
				// pop的时候返回执行自定义poped方法
				// console.log("parent///test", parent, this.popData);
				if (parent?.poped) {
					parent?.poped(props.popData)
					break
				}
				parent = parent.parent
			}
			parent = props.parent
			const app = getAppComponent(parent)
			if (app.exposed?.refreshChildWillAppear) app.exposed?.refreshChildWillAppear()
		}
        // (props.parent as any).ctx = null;
        (instance as any).props = null; // 清除组件的props引用

		childWillAppearlisteners.value = []
		childWillDisAppearlisteners.value = []

        
		// 调用组件卸载方法
		if (container.value) {
			document.body.removeChild(container.value) // 从 DOM 中移除组件
		}
		container.value = null
		drawerContainer.value = null

		// instance?.vnode.el?.remove() // 从 DOM 中移除组件的根元素
		if (instance) {
			;(instance as any).vnode = null
			;(instance as any).component = null
            ;(instance as any).appContext = null // 清除组件的上下文
		}

		console.log('push onUnmounted', instance)

		setTimeout(() => {
			usePushStore().setPushState(false)
		}, 100)
	})

	onMounted(() => {
		// console.log('push mounted...', props.size, instance, drawer.value)
		usePushStore().push(instance)
		container.value = instance?.vnode.el?.parentNode
		// console.log('container', container.value)
	})

	function getInstance() {
		return drawerContainer.value
	}

	function getAppComponent(instance: ComponentInternalInstance) {
		let inst = instance
		while (inst?.parent) {
			inst = inst.parent
			if (inst?.type.__name == 'app') break
			// console.log('parent.....',inst)
		}
		return inst
	}

	// 控制子组件将要显示回调
	const childWillAppearlisteners = ref<(() => void)[]>([])
	provide('registerChildWillAppear', (refreshFn: () => void) => {
		// console.log('注册进来了吗',refreshFn)
		childWillAppearlisteners.value.push(refreshFn)
	})
	const refreshChildWillAppear = () => {
		childWillAppearlisteners.value.forEach(fn => fn())
	}
	// 控制子组件将要隐藏回调
	const childWillDisAppearlisteners = ref<(() => void)[]>([])
	provide('registerChildWillDisAppear', (refreshFn: () => void) => {
		childWillDisAppearlisteners.value.push(refreshFn)
	})
	const refreshChildWillDisAppear = () => {
		childWillDisAppearlisteners.value.forEach(fn => fn())
	}

	defineExpose({
		refreshChildWillAppear,
		refreshChildWillDisAppear,
		getInstance
	})
</script>

<template>
	<div class="drawer-container" ref="drawerContainer">
		<el-drawer
			v-model="visibleDrawer"
			:direction="direction"
			:modal="true"
			:size="drawerSize"
			@closed="closed"
            @close="beforeClose"
			:class="{ pushup: direction == 'btt' && size != '100%' }"
			:with-header="false"
			:destroy-on-close="true"
			v-if="show"
		>
			<template #default>
				<div class="drawer_body w-full h-full flex flex-col relative" v-swipe-down="direction == 'btt' && size != '100%' ? swipeDown : null" v-if="show">
					<template v-if="direction == 'btt' && size != '100%'">
						<div @click="hide"><DrawLine /></div>
					</template>
					<component :is="asyncComp" :push="true" @close="close" v-bind="props.params" v-if="show"/>
					<!-- <WebView :url="url" v-if="!to && url"></WebView> -->
				</div>
			</template>
		</el-drawer>
	</div>
</template>
