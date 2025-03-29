<script lang="ts" setup>
	import { ref } from "vue";
	import { Document, Menu as IconMenu, Location, Setting } from "@element-plus/icons-vue";
	import { ComposFetch } from "~/fetch";
	import { useStore } from "~/store";
	const fn = async () => {
		// ComposFetch.commonFetch.getCommon().then((res) => {
		// 	// console.log(data.value,typeof(data.value),data.value?.name);
		// });
	};
	const isCollapse = ref(true);
	const handleOpen = (key: string, keyPath: string[]) => {
		// console.log(key, keyPath);
		fn();
		useStore().setSplitLeft(!useStore().hideSplitLeft)
	};
	const handleClose = (key: string, keyPath: string[]) => {
		// console.log(key, keyPath);
	};
</script>

<template>
	<div class="left-menu flex justify-between border-l border-[--border-color]">
		<el-menu
			default-active="2"
			class="el-menu-vertical-demo"
			:collapse="isCollapse"
			@open="handleOpen"
			@close="handleClose"
			@select="handleOpen">
			<el-menu-item index="1">
				<el-icon><location /></el-icon>
			</el-menu-item>
			<el-menu-item index="2">
				<el-icon><icon-menu /></el-icon>
			</el-menu-item>
			<el-menu-item index="3">
				<el-icon><document /></el-icon>
			</el-menu-item>
			<el-menu-item index="4">
				<el-icon><setting /></el-icon>
			</el-menu-item>
		</el-menu>
	</div>
</template>
<style>
	.left-menu {
		width: var(--menu-width);
	}
</style>
