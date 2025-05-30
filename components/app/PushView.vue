<script setup lang="ts">
	import { usePushStore } from '~/store/push'
	import type { DrawerProps } from 'element-plus'
	import { getCurrentInstance, render, type ComponentInternalInstance } from 'vue'
	import { transform } from 'typescript'
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
	const drawerBody = ref<HTMLElement | null>(null)
	const drawerComponent = ref<ComponentInternalInstance | null>(null)
	const drawBg = ref<HTMLElement | null>(null)
	const parentContainer = ref<HTMLElement | null>(null)
	const show = ref(true)
	const showComponent = ref(false)
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
		if (!visibleLocal.value) return
		useNuxtApp().$pop()
	}

	const close = () => {
		hide()
	}

	const visibleLocal = computed(() => {
		return usePushStore().getPushComponent(instance) >= 0
	})

	watch(
		() => visibleLocal.value,
		(val, old) => {
			if (!val && old) setDrawerBodyStyle(val)
			setTimeout(() => {
				// 开始卸载当前组件
				if (parentContainer.value && !val && old) {
					render(null, parentContainer.value as HTMLElement)
				}
			}, 500)
		}
	)

	let contentHeight = 0
	const swipeDown = (distance: number, time: number, end: boolean) => {
		if (!drawerBody.value) return
		// 跟着滑下来
		const content = drawerBody.value as HTMLElement
		if (content) {
			if (!contentHeight && content.clientHeight > 0) contentHeight = content.clientHeight
			const h = drawerBody.value.getBoundingClientRect().height
			if (distance < 0) distance = 0 // 下拉距离不能小于0
			// 不能高于默认高度
			if (props.size && props.size?.indexOf('%') > 0) {
				const maxHeight = (parseFloat(props.size) / 100) * window.innerHeight
				contentHeight = Math.min(h, maxHeight)
			}

			content.style.transition = 'unset'
			content.style.transform = 'translateY(calc(var(--body-height) - ' + (contentHeight - distance) + 'px))'
			// 下拉关闭
			//drawerSize.value = content.style.height
			if (end) {
				content.style.transition = 'all 0.5s var(--translate-animation-liner)'
				if ((distance > contentHeight / 3 && time > 0) || (distance > 70 && time < 200 && time > 0)) {
					// 关闭
					hide()
				} else {
					// 恢复原始高度
					//content.style.height = props.size || ''
					setDrawerBodyStyle(true)
					//drawerSize.value = props.size
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
		;(instance as any).props = null // 清除组件的props引用

		childWillAppearlisteners.value = []
		childWillDisAppearlisteners.value = []

		// 调用组件卸载方法
		if (parentContainer.value) {
			document.body.removeChild(parentContainer.value) // 从 DOM 中移除组件
		}
		parentContainer.value = null
		drawerContainer.value = null

		console.log('push onUnmounted', instance)

		setTimeout(() => {
			usePushStore().setPushState(false)
			show.value = false
			showComponent.value = false
		}, 100)
	})

	const setDrawerBodyStyle = (visible: boolean) => {
		// 处理auto
		if (drawerBody.value) {
			const h = drawerBody.value.getBoundingClientRect().height
			let size = props.size == 'auto' ? h + 'px' : props.size || '100%'
			drawerBody.value.style.transform = visible
				? props.direction == 'btt'
					? 'translateY(calc(var(--body-height) - ' + size + '))'
					: 'translateX(0)'
				: props.direction == 'btt'
				? 'translateY(var(--body-height))'
				: 'translateX(var(--body-width))'
			if (props.direction == 'rtl' || props.direction == 'ltr') {
				drawerBody.value.style.height = "var(--body-height)"
			}
		}
		if (drawBg.value) {
			drawBg.value.style.opacity = visible ? (props.direction == 'btt' ? '0.3' : '0') : '0'
		}
	}

	watch(
		() => drawerComponent.value,
		async () => {
			await nextTick()
			// 组件已经渲染完成，可以访问 DOM 或 exposed 方法
			setDrawerBodyStyle(true)
		}
	)

	onMounted(() => {
		// console.log('push mounted...', props.size, instance, drawer.value)
		usePushStore().push(instance)
		parentContainer.value = instance?.vnode.el?.parentNode
		if (props.direction == 'rtl' || props.direction == 'ltr') nextTick(() => setDrawerBodyStyle(true))
		new Promise(resolve => {
			setTimeout(() => {
				showComponent.value = true
			resolve(true)
			}, 30);
		})
	})

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
		refreshChildWillDisAppear
	})
</script>

<template>
	<div class="drawer-container fixed top-0 left-0 w-full h-full" ref="drawerContainer" v-if="show">
		<div ref="drawerBody" :class="['drawer-body bg-base w-full relative z-10', direction]" v-swipe-down="direction == 'btt' && size != '100%' ? swipeDown : null" v-if="show">
			<template v-if="direction == 'btt' && size != '100%'">
				<div @click="hide"><DrawLine /></div>
			</template>
			<component :is="asyncComp" :push="true" @close="close" v-bind="props.params" v-if="showComponent" ref="drawerComponent" />
			<!-- <WebView :url="url" v-if="!to && url"></WebView> -->
		</div>
		<div class="drawer-bg absolute top-0 left-0 w-full h-full z-0" @click="hide" ref="drawBg"></div>
	</div>
</template>

<style scoped lang="less">
	.light .drawer-container {
		.drawer-body {
			&::before {
				background-image: unset;
			}
		}
	}
	.drawer-container {
		z-index: 1000;
		.btt {
			transform: translateY(var(--body-height));
			border-radius: 16px 16px 0 0;
		}
		.rtl {
			transform: translateX(var(--body-width));
		}
		.ltr {
			transform: translateX(-var(--body-width));
		}
		.ttb {
			transform: translateY(-var(--body-height));
		}
		.drawer-body {
			transition: all 0.5s var(--translate-animation-liner);
			overflow: hidden;
			&::before {
				background-image: var(--bg-linear-180);
				// filter: blur(60px);
				position: absolute;
				top: 0;
				left: 0;
				width: 100%;
				height: 100%;
				content: '';
				z-index: -1;
				opacity: 0.15;
			}
		}
		.drawer-bg {
			transition: all 0.5s var(--translate-animation-liner);
			background: rgb(0 0 0);
			opacity: 0;
			z-index: -1;
		}
	}
</style>
