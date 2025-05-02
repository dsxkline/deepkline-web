<script setup lang="ts">
	import { useStore } from '~/store'
	import SymbolCards from './symbol/SymbolCards.vue'
	import OneScreenIcon from './icons/OneScreenIcon.vue'
	// const store = useStore();
	// store.increment();
	function clickSplitScreen(num: number) {
		useStore().setSplitScreen(num)
	}
</script>
<template>
	<div class="header border-b border-[--border-color] w-full flex items-center justify-between">
		<!-- logo -->
		<div class="flex items-center px-2">
			<div class="flex items-center justify-center w-[18px] h-[18px] mr-1 rounded-full bg-[rgb(var(--color-text-main))] border border-green-500" v-if="useColorMode().preference == 'dark'">
				<img src="~/assets/images/logo.png" alt="logo" class="w-[14px] h-[14px]" />
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
			<div class="split-screen flex items-center justify-center *:mx-1 ml-3">
				<button :class="{ active: useStore().splitScreen == 3 }" @click="clickSplitScreen(3)" click-sound><ThreeScreenIcon /></button>
				<button :class="{ active: useStore().splitScreen == 2 }" @click="clickSplitScreen(2)" click-sound><TwoScreenIcon /></button>
				<button :class="{ active: useStore().splitScreen == 1 }" @click="clickSplitScreen(1)" click-sound><OneScreenIcon /></button>
			</div>
		</div>
	</div>
</template>

<style lang="less" scoped>
	.header {
		height: var(--header-height);
		background-color: var(--transparent05);
		.split-screen {
			button {
				&.active {
					:deep(svg) {
						path {
							fill: var(--transparent50);
						}
					}
				}
				&:hover {
					:deep(svg) {
						path {
							fill: var(--transparent50);
						}
					}
				}
			}
		}
	}
</style>
