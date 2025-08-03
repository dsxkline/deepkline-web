<script lang="ts" setup>
	const props = defineProps<{
		resetSize?: (w: number, h: number) => void
	}>()
	// 在组件顶部声明 resizeObserver
	let resizeObserver: ResizeObserver | null = null
	const containerRef = ref(null)
	const width = ref<number>(0)
	const height = ref<number>(0)

	function resetSize(echart?:echarts.ECharts) {
		// 获取父级的宽度和内边距paddingLeft
		if (containerRef.value) {
			const parentElement = containerRef.value as HTMLElement
			const parentWidth = (parentElement.parentNode as HTMLElement).clientWidth
			const parentPaddingLeft = (parentElement.parentNode as HTMLElement).getBoundingClientRect().left - parentElement.getBoundingClientRect().left
			const parentHeight = (parentElement.parentNode as HTMLElement).clientHeight
			const parentPaddingTop = (parentElement.parentNode as HTMLElement).getBoundingClientRect().top - parentElement.getBoundingClientRect().top
			width.value = parentWidth - 2 * Math.abs(parentPaddingLeft)
			height.value = parentHeight - 2 * Math.abs(parentPaddingTop)
            echart && echart.resize({ width: width.value })
			if (props.resetSize) props.resetSize(width.value, height.value)
		}
	}

	onMounted(() => {
		if (containerRef.value) {
			resizeObserver = new ResizeObserver(entries => {
				for (let entry of entries) {
					resetSize()
				}
			})
			// 监听父级元素宽度变化
			const parentElement = containerRef.value as HTMLElement
			if (parentElement) {
				resizeObserver.observe(parentElement.parentNode?.parentNode as HTMLElement)
			}
		}
	})
	onDeactivated(() => {
		if (resizeObserver) {
			resizeObserver.disconnect()
		}
	})
	onBeforeUnmount(() => {
		if (resizeObserver) {
			resizeObserver.disconnect()
		}
		resizeObserver = null
		containerRef.value = null
	})
    defineExpose({
        resetSize
    })
</script>
<template>
	<div class="w-full h-full" ref="containerRef" :style="{ width: width > 0 ? width + 'px' : 'auto' }">
		<slot />
	</div>
</template>
