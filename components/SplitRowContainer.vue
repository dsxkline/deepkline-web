<script setup lang="ts">
	import Split from 'split.js'
import { getFooterHeight, getHeaderHeight, getStatusBarHeight, getTitleBarHeight } from '~/composable/useCommon'
	const splitVertical = ref(null)
	const upHeight = 40
	const windowWidth = ref(window?.innerHeight)
	const updateWindowWidth = () => {
		windowWidth.value = window.innerHeight - getHeaderHeight() - getStatusBarHeight() - getHeaderHeight() - getTitleBarHeight()
		setAutoSplit()
	}
	let up = 20
	let down = 100 - up
	let split: Split.Instance
	onMounted(() => {
		window.addEventListener('resize', updateWindowWidth)
		setAutoSplit()
		split = Split(['#split-up', '#split-down'], {
			sizes: [up, down],
			minSize: [0, 600],
			// maxSize: [window.innerWidth, rightWidth],
			direction: 'vertical',
			gutterSize: 0,
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
		const containerHeight = window.innerHeight - getHeaderHeight() - getStatusBarHeight() - getFooterHeight() - getTitleBarHeight()
		up = (getHeaderHeight() / containerHeight) * 100.0
		down = 100 - up
		split && split.setSizes([up, down])
		console.log('ddddddd',up,down)
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

	onBeforeUnmount(() => {
		splitVertical.value = null
		split.destroy()
	})
</script>
<template>
	<div class="split-row-container">
		<div class="split-vertical flex-col w-full h-full *:overflow-hidden" ref="splitVertical">
			<div id="split-up" ref="splitUp">
				<slot name="up"></slot>
			</div>
			<div id="split-down" ref="splitDown">
				<slot name="down"></slot>
			</div>
		</div>
	</div>
</template>

<style lang="less" scoped>
	.split-row-container {
		width: calc(100%);
		height: calc(100%);
		.split-vertical {
			#split-up {
				width: calc(100%);
				height: var(--footer-height);
			}
			#split-down {
				width: calc(100%);
				overflow-x: hidden;
				height: calc(100% - var(--footer-height));
			}
			&:deep(.gutter) {
				background-color: transparent;
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
