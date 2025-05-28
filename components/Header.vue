<script setup lang="ts">
	import { useStore } from '~/store'
	import SymbolCards from './symbol/SymbolCards.vue'
	import OneScreenIcon from './icons/OneScreenIcon.vue'
	import Languages from './common/Languages.vue'
	// const store = useStore();
	// store.increment();
	function clickSplitScreen(num: number) {
		useStore().setSplitScreen(num)
	}
</script>
<template>
	<div class="header w-full flex items-center justify-between">
		<!-- logo -->
		<div class="flex items-center px-2">
			<div class="flex items-center justify-center w-[28px] h-[28px] mr-1" v-if="useStore().theme == 'dark'">
				<img src="~/assets/images/logo.png" alt="logo" class="w-[22px] h-[22px] rounded-full" />
			</div>
			<div class="flex items-center justify-center w-[28px] h-[28px] mr-1" v-else>
				<img src="~/assets/images/logo.png" alt="logo" class="w-[22px] h-[22px]  rounded-full" />
			</div>
			<b class="logo-text mr-2 font-mono text-sm text-main"> DeepKline </b>
		</div>
		<!-- 品种搜索 -->
		<div class="flex items-center justify-center flex-1">
			<SymbolSearch />
		</div>
		<!-- 工具栏 -->
		<div class="flex items-center px-2 justify-end">
			<ThemeSwitch class="mx-2"></ThemeSwitch>
			<Languages />
			<el-divider direction="vertical" class="mx-1"></el-divider>
			<div class="split-screen flex items-center justify-center *:mx-1">
				
				<button :class="{ active: useStore().splitScreen == 3 }" @click="clickSplitScreen(3)" click-sound><ThreeScreenIcon /></button>
				<button :class="{ active: useStore().splitScreen == 2 }" @click="clickSplitScreen(2)" click-sound><TwoScreenIcon /></button>
				<button :class="{ active: useStore().splitScreen == 1 }" @click="clickSplitScreen(1)" click-sound><OneScreenIcon /></button>
				
			</div>
			<el-divider direction="vertical" class="mx-1"></el-divider>
			<div class="flex items-center justify-center">
				<button class="bt-default mx-1">登录</button>
				<button class="bt-primary mx-1">注册</button>
				
			</div>
		</div>
	</div>
</template>

<style lang="less" scoped>
[class=light]{
	.header{
		&::before{
			opacity: 0.2;
			background-image: none;
		}
	}
}
	.header {
		height: var(--header-height);
		// background-color: var(--transparent05);
		border-bottom: 1px solid var(--transparent10);
		position: relative;
		&::before {
			// background-image: linear-gradient(90deg, #00dc82, #36e4da, #0047e1);
			background-image: var(--bg-linear-90);
			// filter: blur(60px);
			position: absolute;
			top: 0;
			left: 0;
			width: 100%;
			height: 100%;
			content: '';
			z-index: -1;
			opacity: 0.2;
			
			// transition: all 0.3s ease;
		}
		

		.split-screen {
			button {
				&.active {
					:deep(svg) {
						path {
							fill: var(--transparent80);
						}
					}
				}
				&:hover:not(.active) {
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
