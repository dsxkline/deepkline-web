<script setup lang="ts">
	import Split from "split.js";
	import { useStore } from "~/store";
	const splitHorizontal = ref(null);
	const splitLeft = ref(null);
	const splitRight = ref(null);
	const rightWidth = 300;
	const windowWidth = ref(window?.innerWidth);
    const updateWindowWidth = () => {
      windowWidth.value = window.innerWidth;
	  setAutoSplit();
    }
	let left = 80;
	let right = 100 - left;
	let split: Split.Instance;
	onMounted(() => {
		window.addEventListener('resize', updateWindowWidth);
		setAutoSplit();
		split = Split(["#split-left", "#split-right"], {
			sizes: [left, right],
			minSize: [600, 0],
			maxSize: [window.innerWidth, rightWidth],
			direction: "horizontal",
			gutterSize: 3,
			onDragStart: () => {
				console.log("onDragStart");
			},
			onDrag: () => {
				console.log("onDrag");
			},
			onDragEnd: () => {
				console.log("onDragEnd");
			}
		});
	});
	onUnmounted(() => {
      window.removeEventListener('resize', updateWindowWidth);
    });
	function setAutoSplit() {
		left = ((window.innerWidth - rightWidth) / window.innerWidth) * 100;
		right = 100 - left;
	}
	function addAnimation(dom: HTMLElement | null) {
		if (dom) {
			dom.style.transition = "0.2s";
		}
	}
	function removeAnimation(dom: HTMLElement | null) {
		setTimeout(() => {
			if (dom) {
				dom.style.transition = "none";
			}
		}, 200);
	}
	function hideRight(val: boolean) {
		setAutoSplit();
		addAnimation(splitRight.value);
		addAnimation(splitLeft.value);
		if (val) split.setSizes([100, 0]);
		else split.setSizes([left, right]);
		removeAnimation(splitRight.value);
		removeAnimation(splitLeft.value);
	}
	function hideLeft(val: boolean) {
		setAutoSplit();
		addAnimation(splitRight.value);
		addAnimation(splitLeft.value);
		if (val) split.setSizes([0, 100]);
		else split.setSizes([left, right]);
		removeAnimation(splitRight.value);
		removeAnimation(splitLeft.value);
	}

	watch(
		() => useStore().hideSplitRight,
		(val) => {
			hideRight(val);
		}
	);
	watch(
		() => useStore().hideSplitLeft,
		(val) => {
			hideLeft(val);
		}
	);
</script>
<template>
	<div class="split-container">
		<div
			class="split-horizontal flex w-full h-full *:overflow-hidden"
			ref="splitHorizontal">
			<div
				id="split-left"
				ref="splitLeft">
				<slot name="left"></slot>
			</div>
			<div
				id="split-right"
				ref="splitRight">
				<el-scrollbar class="h-full">
					<slot name="right"></slot>
				</el-scrollbar>
			</div>
		</div>
	</div>
</template>

<style lang="less" scoped>
	.split-container {
		width: calc(100% - var(--menu-width));
		height: calc(100vh - var(--footer-height) - var(--header-height) - var(--status-bar-height));
		.split-horizontal {
			#split-left {
				width: calc(100% - 300px);
			}
			#split-right {
				width: 300px;
			}
			&:deep(.gutter) {
				background-color: var(--border-color);
				background-repeat: no-repeat;
				background-position: 50%;
				&:hover {
					cursor: col-resize;
				}
				.gutter-horizontal {
					background-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAeCAYAAADkftS9AAAAIklEQVQoU2M4c+bMfxAGAgYYmwGrIIiDjrELjpo5aiZeMwF+yNnOs5KSvgAAAABJRU5ErkJggg==");
					cursor: col-resize;
				}
			}
		}
	}
</style>
