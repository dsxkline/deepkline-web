<script setup lang="ts">
	import { _100 } from '#tailwind-config/theme/backdropBrightness'
	import { useRefreshChildScrollTop } from '~/composable/useScrollBar'

	const props = defineProps<{
		height?: string
		always?: boolean
		wrapStyle?: any
		noScroll?: boolean
	}>()

	const scrollBarRef = ref<HTMLElement | null>(null)
	const thumbRef = ref<HTMLElement | null>(null)

	const emit = defineEmits<{
		(e: 'scroll', params: { scrollLeft: number; scrollTop: number }): void
	}>()
	const scrollTop = ref(0)
	// 提供给后代组件
	const refreshChildScrollTop = useRefreshChildScrollTop()

	function scrollHandle() {
		scrollTop.value = scrollBarRef.value?.scrollTop || 0
		console.log('ScrollBar scrollTop:', scrollTop.value)
		refreshChildScrollTop(scrollTop.value)
		const scrollHeight = scrollBarRef.value?.scrollHeight || 0
		const scrollLeft = scrollBarRef.value?.scrollLeft || 0
		const containerHeight = scrollBarRef.value?.clientHeight || 0
		emit('scroll', { scrollLeft, scrollTop: scrollTop.value })
		// 计算滚动条的高度和位置

		if (thumbRef.value && scrollHeight > containerHeight) {
			const thumbHeight = Math.max((containerHeight / scrollHeight) * containerHeight, 0) // 最小高度为20px
			const thumbTop = (scrollTop.value / scrollHeight) * containerHeight
			thumbRef.value.style.height = `${thumbHeight}px`
			thumbRef.value.style.transform = `translateY(${thumbTop}px)`
		}
	}
	onMounted(() => {
		if (scrollBarRef.value && thumbRef.value) {
			nextTick(() => {
				scrollHandle() // 初始化滚动条位置
			})
		}
	})

	onBeforeUnmount(() => {
		scrollBarRef.value = null
		thumbRef.value = null
		console.log('ScrollBar component unmounted')
	})
</script>
<template>
	<div class="scroll-bar relative overflow-hidden w-full h-auto" :style="{ height: height || '100%', ...wrapStyle }">
		<div class="scroll-bar-thumb absolute top-0 right-1 rounded-full w-2 z-10 bg-[--transparent20]" ref="thumbRef" v-if="always"></div>
		<div :class="['scroll-bar-inner overflow-x-hidden', noScroll ? 'overflow-y-hidden' : 'overflow-y-auto']" ref="scrollBarRef" :style="{ height: height || '100%' }" @scroll="scrollHandle">
			<slot></slot>
		</div>
	</div>
</template>
<style lang="less" scoped>
	.scroll-bar-inner {
		position: relative;
		width: 100%;
		height: 100%;
		// 隐藏滚动条
		scrollbar-width: none; /* Firefox */
		-ms-overflow-style: none; /* IE and Edge */
		&::-webkit-scrollbar {
			display: none; /* Chrome, Safari and Opera */
		}
		// &.scroll-bar-always {
		// 	scrollbar-width: thin;
		// 	scrollbar-color: var(--transparent20) transparent;
		// 	&::-webkit-scrollbar {
		// 		width: 8px;
		// 		height: 8px;
		// 	}
		// 	&::-webkit-scrollbar-thumb {
		// 		background-color: var(--transparent20);
		// 		border-radius: 4px;
		// 	}
		// 	&::-webkit-scrollbar-track {
		// 		background: transparent;
		// 	}
		// }
	}
</style>
