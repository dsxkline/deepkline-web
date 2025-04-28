<script setup lang="ts">
	import { useStore } from "~/store";
	import SymbolCards from "./symbol/SymbolCards.vue";
	// const store = useStore();
	// store.increment();
</script>
<template>
	<div class="header border-b border-[--border-color] w-full flex items-center justify-between">
		<!-- logo -->
		<div class="flex items-center w-[100px] px-2">
			<b class="logo-text">BitKline.com</b>
		</div>
		<!-- 品种搜索 -->
		<div class="flex items-center justify-center flex-1">
			<SymbolSearch/>
		</div>
		<!-- 工具栏 -->
		<div class="flex items-center w-[100px] px-2 justify-end">
			<ThemeSwitch></ThemeSwitch>
		</div>
	</div>
</template>

<style lang="less" scoped>
	.header {
		height: var(--header-height);
		background-color: var(--transparent05);
		.logo-text{
			font-weight: 900;
			background:linear-gradient(315deg,#42d392 25%,#647eff);
			background-clip: text;
    		text-fill-color: transparent;
		}
	}
</style>
