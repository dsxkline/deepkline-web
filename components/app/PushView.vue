<script setup lang="ts">
	import { usePushStore } from '~/store/push'
	import type { DrawerProps } from 'element-plus'
	import { getCurrentInstance, render, type ComponentInternalInstance } from 'vue'
	import { useRequestAnimation } from '~/composable/useRequestAnimation'
	import { getParentRefreshComponent, useRefreshChildEvent } from '~/composable/usePush'
import { useStore } from '~/store'
	// import SymbolSearch from '../symbol/SymbolSearch.vue';
	const instance = getCurrentInstance()
	const props = defineProps<{
		visible?: boolean
		direction?: DrawerProps['direction']
		size?: string
		dialog?: ComponentInternalInstance | null
		url?: string
		to?: any
		params?: any
		popData?: any
		parent: any
		destroy?: () => void
	}>()
	const drawerSize = ref(props.size)
	const drawerContainer = ref<HTMLElement | null>(null)
	const drawerBody = ref<HTMLElement | null>(null)
	const drawerComponent = ref<ComponentInternalInstance | null>(null)
	const drawBg = ref<HTMLElement | null>(null)
	const parentContainer = ref<HTMLElement | null>(null)
	const show = ref(true)
	const showComponent = ref(false)
	const bttFull = ref(false)
	// 是否vnode
	const vnodeContainer = ref()
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
			if (old && !val) {
				// 处理返回逻辑
				onReturnBackHandle()
				setTimeout(() => {
					props.destroy && props.destroy()
				}, 500)
			}
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

	function onReturnBackHandle() {
		// 获取上一级
		let parent = props.parent
		if (parent) {
			const app = getParentRefreshComponent(parent)
			if (app.exposed?.refreshChildWillAppear) app.exposed?.refreshChildWillAppear()
			while (parent) {
				// pop的时候返回执行自定义poped方法
				// console.log("parent///test", parent, this.popData);
				if (parent?.exposed?.onPop && props.popData != undefined) {
					const result = parent?.exposed.onPop(props.popData)
					// 默认不拦截
					if (result) break
				}
				parent = parent.parent
			}
		}
	}

	onBeforeUnmount(() => {
		drawerContainer.value = null
		vnodeContainer.value = null
		drawerBody.value = null
		drawBg.value = null
		showComponent.value = false
		show.value = false
	})

	onUnmounted(() => {
		usePushStore().setPushState(false)
		console.log('push onUnmounted')
	})

	const setDrawerBodyStyle = (visible: boolean) => {
		// 处理auto
		if (drawerBody.value) {
			let h = Math.min(drawerBody.value.getBoundingClientRect().height || 0, window.innerHeight)
			// let size = props.size == 'auto' ? h : props.size || '100%'
			if (props.direction == 'rtl' || props.direction == 'ltr') {
				drawerBody.value.style.height = 'var(--body-height)'
				if(!useStore().isH5) drawerBody.value.style.height = '100%'
			} else {
				// console.log('props.size', props.size)
				if (props.size) {
					if (props.size.indexOf('%') > 0) {
						h = (window.innerHeight * parseFloat(props.size)) / 100
					} else if (props.size == 'auto') {
					} else if (props.size?.indexOf('px')) {
						// px 等
						h = window.innerHeight * parseFloat(props.size)
					} else if (props.size?.indexOf('vh')) {
						// vh 等
						h = (window.innerHeight * parseFloat(props.size)) / 100
					}
				}
				drawerBody.value.style.height = h + 'px'
			}

			// if (props.dialog) {
			// 	drawerBody.value.style.maxHeight = props.dialog.props.height as string
			// }

			drawerBody.value.style.transform = visible
				? props.direction == 'btt'
					? 'translateY(calc(var(--body-height) - 100%))'
					: 'translateX(0)'
				: props.direction == 'btt'
				? 'translateY(var(--body-height))'
				: 'translateX(var(--body-width))'

			if (h >= window.innerHeight) bttFull.value = true
			else bttFull.value = false
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
	watch(
		() => vnodeContainer.value,
		async () => {
			await nextTick()
			// 组件已经渲染完成，可以访问 DOM 或 exposed 方法
			setDrawerBodyStyle(true)
		}
	)

	onMounted(() => {
		// console.log('push mounted...', props.size, instance, drawer.value)
		usePushStore().push(instance)
		if (isVNodeLike(props.to) && vnodeContainer.value) {
			render(h('div', props.params, props.to), vnodeContainer.value)
		}
		parentContainer.value = instance?.vnode.el?.parentNode
		if (props.direction == 'rtl' || props.direction == 'ltr') nextTick(() => setDrawerBodyStyle(true))
		new Promise(resolve => {
			setTimeout(() => {
				showComponent.value = true
				resolve(true)
			}, 30)
		})
	})

	// 如果是在dialog环境，把dialog实例传下去
	// 给子组件全局注入当前dialog实例
	props.dialog && provide('currentDialog', props.dialog)
	console.log('props.dialog', props.dialog)

	defineExpose({
		...useRefreshChildEvent()
	})
</script>

<template>
	<div class="drawer-container absolute top-0 left-0 w-full h-full" ref="drawerContainer">
		<div
			ref="drawerBody"
			:class="['drawer-body bg-base w-full h-full max-h-[--body-height] relative z-10', direction, bttFull ? 'btt-full' : '']"
			v-swipe-down="direction == 'btt' && size != '100%' ? swipeDown : null"
		>
			<template v-if="direction == 'btt' && !bttFull">
				<div @click="hide"><DrawLine /></div>
			</template>
			<component :is="asyncComp" :push="direction" @close="close" v-bind="params" ref="drawerComponent" v-if="!isVNodeLike(to)" />
			<!-- <WebView :url="url" v-if="!to && url"></WebView> -->
			<!-- 直接渲染vnode -->
			<div ref="vnodeContainer" v-else></div>
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
			padding-bottom: var(--safe-bottom);
		}
		.btt-full {
			border-radius: 0;
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
