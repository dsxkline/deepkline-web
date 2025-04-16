<script setup lang="ts">
	import Split from 'split.js'
	import { useStore } from '~/store'
	const props = defineProps({
		left:{
			type:Number,
			default:360
		},
		right:{
			type:Number,
			default:0
		},
	})
	const splitHorizontal = ref(null)
	const splitLeft = ref(null)
	const splitRight = ref(null)
	const leftWidth = props.left
	const rightWidth = props.right
	const windowWidth = ref(window?.innerWidth)
	const splitContainer = ref()
	const updateWindowWidth = () => {
		windowWidth.value = splitContainer.value.clientWidth;
		setAutoSplit()
		split && split.setSizes([left, right])
	}
	let left = 20
	let right = 100 - left
	let split: Split.Instance
	onMounted(() => {
		window.addEventListener('resize', updateWindowWidth)
		updateWindowWidth()
		split = Split([splitContainer.value.querySelector('#split-left'), splitContainer.value.querySelector('#split-right')], {
			sizes: [left, right],
			minSize: [leftWidth, rightWidth],
			// maxSize: [leftWidth,0],
			direction: 'horizontal',
			gutterSize: 2,
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
		if(leftWidth>0){
			left = ((leftWidth) / (windowWidth.value-2)) * 100.0
			right = 100 - left
		}
		if(rightWidth>0){
			right = ((rightWidth) / (windowWidth.value-2)) * 100.0
			left = 100 - right
		}
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
	<div class="split-container w-full h-full" ref="splitContainer">
		<div class="split-horizontal flex w-full h-full *:overflow-hidden" ref="splitHorizontal">
			<div id="split-left" ref="splitLeft" :style="[leftWidth>0?'width:calc('+leftWidth+'px)':'',rightWidth>0?'width:calc(100% - '+rightWidth+'px - 2px)':'']">
				<slot name="left"></slot>
			</div>
			<div id="split-right" ref="splitRight" :style="[rightWidth>0?'width:calc('+rightWidth+'px)':'',leftWidth>0?'width:calc(100% - '+leftWidth+'px - 2px)':'']">
				<slot name="right"></slot>
			</div>
		</div>
	</div>
</template>

<style lang="less" scoped>
	.split-container {
		height: calc(100%);
		width:100%;
		.split-horizontal {
			#split-left {
				width: calc(360px);
			}
			#split-right {
				width: calc(100% - 360px - 2px);
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
