<script lang="ts" setup>
	import type { VNodeArrayChildren } from 'vue'
	import type { VNode } from 'vue'
	import { render } from 'vue'
	import { usePushUp, useWillDisappear } from '~/composable/usePush'
	import { useRequestAnimation } from '~/composable/useRequestAnimation'
	import { useStore } from '~/store'

	const props = defineProps<{
		modelValue?: any
		title?: string
	}>()
	const emit = defineEmits<{
		(e: 'update:modelValue', value: any): void
	}>()
	const pushUp = usePushUp()
	const container = ref<HTMLElement>()
	const slots = useSlots()
	let poperContainer: HTMLDivElement | null = null
	const animation = useRequestAnimation()

	const pushUpContainer = () => {
		const vnode = slots.default?.()
		if (vnode) {
			const newVnode = h(
				'div',
				{
					class: 'py-4'
				},
				vnode
			)
			if (useStore().isH5) pushUp(newVnode)
			else {
				// 向下弹出菜单
				// 当前组件位置
				if (container.value) {
					const { top, left, width, height } = container.value.getBoundingClientRect()
					createPopper(newVnode, left, top, width, height)
				}
			}
		}
	}

	function createPopper(vnode: VNode, x: number, y: number, w: number, h: number) {
		if (!poperContainer) {
			poperContainer = document.createElement('div')
			document.body.append(poperContainer)
		} else {
			hidePopper()
			return
		}

		render(vnode, poperContainer)
		const { width, height } = poperContainer.getBoundingClientRect()

		poperContainer.className = `!fixed z-[999999] w-max h-max bg-base overflow-hidden rounded-md mt-1 border border-[--transparent10]`
		poperContainer.style.left = x + 'px'
		poperContainer.style.top = y + h + 'px'
		poperContainer.style.minWidth = w + 'px'
		// poperContainer.style.opacity = '0'

		animation.start({
			from: 0,
			to: 1,
			duration: 300,
			onUpdate: value => {
				if (poperContainer) {
					poperContainer.style.height = height * value + 'px'
					// poperContainer.style.opacity = value.toString()
					if (x + poperContainer.offsetWidth >= window.innerWidth) {
						x = window.innerWidth - poperContainer.offsetWidth
						poperContainer.style.left = x + 'px'
					}
				}
			}
		})

		document.body.addEventListener('click', hidePopper)

		const children = (vnode?.children || []) as VNode[]
		children.forEach(item => {
			const children = (item?.children || []) as VNode[]
			if (!Array.isArray(children)) return
			children.forEach(vn => {
				if (vn.component?.props) vn.component.props['onSelect'] = onPop
			})
		})
	}
	const hidePopper = () => {
		if (poperContainer) {
			poperContainer.style.opacity = '0'
			setTimeout(() => {
				poperContainer && render(null, poperContainer)
				poperContainer?.remove()
				poperContainer = null
			}, 300)
		}
		document.body.removeEventListener('click', hidePopper)
	}

	function onPop(data: any) {
		console.log('onpop', data)
		emit('update:modelValue', data)
	}

	onMounted(() => {})

	useWillDisappear(() => {
		hidePopper()
	})

	onBeforeUnmount(() => {
		hidePopper()
		document.body.removeEventListener('click', hidePopper)
	})

	defineExpose({
		onPop
	})
</script>
<template>
	<div
		ref="container"
		v-click-sound
		class="bg-[--transparent02] px-3 py-1 min-h-12 border border-[--transparent10] hover:border-[--transparent30] rounded-md flex items-center justify-between cursor-pointer"
		@click.stop="pushUpContainer"
		@select="onPop"
	>
		<div class="flex items-center" v-if="!slots.name">
			<div v-if="title" class="text-sm py-2 pr-3 text-grey">{{ title }}</div>
			<div class="py-2">{{ modelValue }}</div>
		</div>
		<slot name="name"></slot>
		<el-icon><ArrowDown /></el-icon>
	</div>
</template>
