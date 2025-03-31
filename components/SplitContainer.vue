<script setup lang="ts">
	import Split from 'split.js'
	import { useStore } from '~/store'
	const splitHorizontal = ref(null)
	const splitLeft = ref(null)
	const splitRight = ref(null)
	const leftWidth = 360
	const windowWidth = ref(window?.innerWidth)
	const updateWindowWidth = () => {
		windowWidth.value = window.innerWidth
		setAutoSplit()
		split && split.setSizes([left, right])
	}
	let left = 20
	let right = 100 - left
	let split: Split.Instance
	onMounted(() => {
		window.addEventListener('resize', updateWindowWidth)
		setAutoSplit()
		split = Split(['#split-left', '#split-right'], {
			sizes: [left, right],
			minSize: [leftWidth, 0],
			// maxSize: [leftWidth,0],
			direction: 'horizontal',
			gutterSize: 1,
			onDragStart: () => {
				console.log('onDragStart')
			},
			onDrag: () => {
				console.log('onDrag')
			},
			onDragEnd: () => {
				console.log('onDragEnd')
			}
		})
	})
	onUnmounted(() => {
		window.removeEventListener('resize', updateWindowWidth)
	})
	function setAutoSplit() {
		left = ((leftWidth + 0.5) / (windowWidth.value - 40)) * 100.0
		right = 100 - left
	}
	function addAnimation(dom: HTMLElement | null) {
		if (dom) {
			dom.style.transition = '0.2s'
		}
	}
	function removeAnimation(dom: HTMLElement | null) {
		setTimeout(() => {
			if (dom) {
				dom.style.transition = 'none'
			}
		}, 200)
	}
	function hideRight(val: boolean) {
		setAutoSplit()
		addAnimation(splitRight.value)
		addAnimation(splitLeft.value)
		if (val) split.setSizes([100, 0])
		else {
			split.setSizes([left, right])
		}
		removeAnimation(splitRight.value)
		removeAnimation(splitLeft.value)
	}
	function hideLeft(val: boolean) {
		setAutoSplit()
		addAnimation(splitRight.value)
		addAnimation(splitLeft.value)
		if (val) split.setSizes([0, 100])
		else split.setSizes([left, right])
		removeAnimation(splitRight.value)
		removeAnimation(splitLeft.value)
	}

	watch(
		() => useStore().hideSplitRight,
		val => {
			hideRight(val)
		}
	)
	watch(
		() => useStore().hideSplitLeft,
		val => {
			hideLeft(val)
		}
	)
</script>
<template>
	<div class="split-container w-full h-full">
		<div class="split-horizontal flex w-full h-full *:overflow-hidden" ref="splitHorizontal">
			<div id="split-left" ref="splitLeft">
				<slot name="left"></slot>
			</div>
			<div id="split-right" ref="splitRight">
				<slot name="right"></slot>
			</div>
		</div>
	</div>
</template>

<style lang="less" scoped>
	.split-container {
		height: calc(100vh - var(--header-height) - var(--status-bar-height));
		.split-horizontal {
			#split-left {
				width: calc(360px - 0.5px);
			}
			#split-right {
				width: calc(100vw - 360px - 40px - 0.5px);
				overflow-x: hidden;
			}
			&:deep(.gutter) {
				background-color: var(--border-color);
				background-repeat: no-repeat;
				background-position: 50%;
				&:hover {
					cursor: col-resize;
				}
				.gutter-horizontal {
					background-image: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAeCAYAAADkftS9AAAAIklEQVQoU2M4c+bMfxAGAgYYmwGrIIiDjrELjpo5aiZeMwF+yNnOs5KSvgAAAABJRU5ErkJggg==');
					cursor: col-resize;
				}
			}
		}
	}
</style>
