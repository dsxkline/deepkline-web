<script setup lang="ts">
	const props = defineProps<{
		height?: string
		always?: boolean
		wrapStyle?: any
	}>()

	const scrollBarRef = ref<HTMLElement | null>(null)
	const thumbRef = ref<HTMLElement | null>(null)

	const emit = defineEmits<{
		(e: 'scroll', params: { scrollLeft: number; scrollTop: number }): void
	}>()

	function scrollHandle() {
		const scrollTop = scrollBarRef.value?.scrollTop || 0
		const scrollHeight = scrollBarRef.value?.scrollHeight || 0
		const scrollLeft = scrollBarRef.value?.scrollLeft || 0
		const containerHeight = scrollBarRef.value?.clientHeight || 0
		emit('scroll', { scrollLeft, scrollTop })
		// 计算滚动条的高度和位置

		if (thumbRef.value) {
			const thumbHeight = Math.max((containerHeight / scrollHeight) * containerHeight, 20) // 最小高度为20px
			const thumbTop = (scrollTop / scrollHeight) * containerHeight
			thumbRef.value.style.height = `${thumbHeight}px`
			thumbRef.value.style.transform = `translateY(${thumbTop}px)`
		}
	}
	onMounted(() => {
		if (scrollBarRef.value && thumbRef.value) {
			scrollHandle() // 初始化滚动条位置
		}
	})

	onBeforeUnmount(() => {
		scrollBarRef.value = null
		thumbRef.value = null
        console.log('ScrollBar component unmounted')
	})
</script>
<template>
	<div class="scroll-bar relative overflow-hidden w-full h-auto" :style="{ height: props.height || '100%', ...wrapStyle }">
		<div class="scroll-bar-thumb absolute top-0 right-1 h-3 rounded-full w-2 z-10 bg-[--transparent20]" ref="thumbRef" v-if="props.always"></div>
		<div class="scroll-bar-inner" ref="scrollBarRef" :style="{ height: props.height || '100%', ...wrapStyle }" @scroll="scrollHandle">
			<slot></slot>
		</div>
	</div>
</template>
<style lang="less" scoped>
	.scroll-bar-inner {
		position: relative;
		overflow: auto;
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
