<script setup lang="ts">
	import Split from "split.js";
	onMounted(() => {
		Split(["#split-left", "#split-right"], {
			sizes: [80, 20],
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
</script>
<template>
	<div class="split-container">
		<div class="split-horizontal">
			<div id="split-left">
				<slot name="left"></slot>
			</div>
			<div id="split-right">
				<slot name="right"></slot>
			</div>
		</div>
	</div>
</template>

<style lang="less" scoped>
	.split-container {
		width: 100%;
		height: calc(100vh - 0px);
		.split-horizontal {
			display: flex;
			flex-direction: row;
			width: 100%;
			height: 100%;
			&:deep(.gutter) {
				background-color: #eee;
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
