<script setup lang="ts">
	import { useStore } from '~/store'
	import SymbolCards from './symbol/SymbolCards.vue'
	// const store = useStore();
	// store.increment();
</script>
<template>
	<div class="header border-b border-[--border-color] w-full flex items-center justify-between">
		<!-- logo -->
		<div class="flex items-center px-2">
			<div class="flex items-center justify-center w-[18px] h-[18px] mr-1 rounded-full bg-[rgb(var(--color-text-main))] border border-green-500" v-if="useColorMode().preference=='dark'">
				<img src="~/assets/images/logo.png" alt="logo" class="w-[14px] h-[14px]"/>
			</div>
			<div class="flex items-center justify-center w-[22px] h-[22px] mr-1 rounded-full bg-white border border-green-500" v-else>
				<img src="~/assets/images/logo.png" alt="logo" class="w-[14px] h-[14px]" />
			</div>
			<b class="logo-text mr-2 font-mono text-sm text-green"> DeepKline </b>
			
		</div>
		<!-- 品种搜索 -->
		<div class="flex items-center justify-center flex-1">
			<SymbolSearch />
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
		.logo-text {
			// font-weight: 900;
			// background: linear-gradient(315deg, #42d392 25%, #647eff);
			// background-clip: text;
			// -webkit-text-fill-color: transparent;
		}
	}
</style>
