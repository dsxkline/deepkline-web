<script setup lang="ts">
	import Split from 'split.js'
	import { useStore } from '~/store'
	// 当前vue实例
	const instance = getCurrentInstance()
	const props = defineProps({
		left: {
			type: Number,
			default: 360
		},
		right: {
			type: Number,
			default: 0
		},
		pushLeft: {
			type: Boolean,
			default: false
		}
	})
	const splitHorizontal = ref(null)
	const splitLeft = ref()
	const splitRight = ref()
	let leftWidth = props.left
	let rightWidth = props.right
	const windowWidth = ref(window?.innerWidth)
	const splitContainer = ref()
	const hideSplitRight = ref(false)
	const hideSplitLeft = ref(false)
	const updateWindowWidth = (animation: boolean = true) => {
		windowWidth.value = splitContainer.value.clientWidth
		setAutoSplit()
		split && split.setSizes([left, right])
		split && hideSplit(animation)
	}
	let left = 20
	let right = 100 - left
	let split: Split.Instance
	onMounted(() => {
		// useStore().addSplitScreen(instance)
		// window.addEventListener('resize', updateWindowWidth)
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
				if (split.getSizes()[0] > 0) {
					hideSplitLeft.value = false
				}
			},
			onDragEnd: () => {
				console.log('onDragEnd')
			}
		})

		// 监听元素宽高变化
		const resizeObserver = new ResizeObserver(entries => {
			for (const entry of entries) {
				if (entry.target === splitContainer.value) {
					updateWindowWidth(false)
				}
			}
		})
		resizeObserver.observe(splitContainer.value)
		// 监听元素销毁
		onBeforeUnmount(() => {
			resizeObserver.unobserve(splitContainer.value)
		})
	})
	onUnmounted(() => {
		// window.removeEventListener('resize', updateWindowWidth)
	})
	function setAutoSplit() {
		if (leftWidth > 0) {
			left = (leftWidth / (windowWidth.value - 2)) * 100.0
			right = 100 - left
		}
		if (rightWidth > 0) {
			right = (rightWidth / (windowWidth.value - 2)) * 100.0
			left = 100 - right
		}
	}
	function addAnimation(dom?: HTMLElement) {
		if (dom) {
			dom.style.transition = '0.2s'
		}
	}
	function removeAnimation(dom?: HTMLElement) {
		setTimeout(() => {
			if (dom) {
				dom.style.transition = 'none'
			}
		}, 200)
	}

	function hideSplit(animation: boolean = true) {
		setAutoSplit()
		if (animation) {
			addAnimation(splitRight.value)
			addAnimation(splitLeft.value)
		}

		if (hideSplitLeft.value || hideSplitRight.value) {
			leftWidth = 0
			rightWidth = 0
			if (hideSplitLeft.value) {
				split.setSizes([0, 100])
				if(splitLeft.value) {
					splitLeft.value.style.width = '0'
				}
				if(splitRight.value) {
					splitRight.value.style.width = '100%'
				}
			} else if (hideSplitRight.value) {
				split.setSizes([100, 0])
				if(splitLeft.value) {
					splitLeft.value.style.width = '100%'
				}
				if(splitRight.value) {
					splitRight.value.style.width = '0'
				}
			}
		} else {
			leftWidth = props.left
			rightWidth = props.right
			setAutoSplit()
			split.setSizes([left, right])
		}
		removeAnimation(splitRight.value)
		removeAnimation(splitLeft.value)
	}

	watch(
		() => hideSplitRight.value,
		val => {
			hideSplit()
		}
	)
	watch(
		() => hideSplitLeft.value,
		val => {
			
			hideSplit()
		}
	)

	function toggleLeft(val?:boolean|undefined) {
		if(val!=undefined) {
			hideSplitLeft.value = val
			hideSplit()
		} else {
			hideSplitLeft.value = !hideSplitLeft.value
		}
		useStore().updateSplitScreen()
	}
	function toggleRight(val?:boolean|undefined) {
		if(val!=undefined) {
			hideSplitRight.value = val
			hideSplit()
		}else{
			hideSplitRight.value = !hideSplitRight.value
		}
		useStore().updateSplitScreen()
	}

	defineExpose({
		toggleLeft,
		toggleRight,
		hideSplitLeft,
		hideSplitRight,
	})
</script>
<template>
	<div class="split-container w-full h-full" ref="splitContainer">
		<div class="split-horizontal flex w-full h-full *:overflow-hidden" ref="splitHorizontal">
			<div
				class="relative"
				id="split-left"
				ref="splitLeft"
				:style="[hideSplitLeft ? 'width:0' : leftWidth > 0 ? 'width:calc(' + leftWidth + 'px)' : '', rightWidth > 0 ? 'width:calc(100% - ' + rightWidth + 'px - 2px)' : '']"
			>
				<slot name="left"></slot>
			</div>
			<div
				class="relative"
				id="split-right"
				ref="splitRight"
				:style="[rightWidth > 0 ? 'width:calc(' + rightWidth + 'px)' : '', hideSplitLeft ? 'width:100%' : leftWidth > 0 ? 'width:calc(100% - ' + leftWidth + 'px - 2px)' : '']"
			>
				<!-- <div class="flex items-center absolute left-[-10px] top-0" v-if="hideSplitLeft" @click="toggleLeft"><ContractionIcon/></div> -->
				<button class="flex items-center absolute left-2 top-3" v-if="pushLeft" click-sound @click="toggleLeft()">
					<el-icon><Fold v-if="!hideSplitLeft" /><Expand v-else /></el-icon>
				</button>
				<slot name="right"></slot>
			</div>
		</div>
	</div>
</template>

<style lang="less" scoped>
	.split-container {
		height: calc(100%);
		width: 100%;
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
