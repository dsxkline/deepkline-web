<script lang="ts" setup>
	import MarketIndex from '@/pages/market/index.vue'
	import TradeIndex from '@/pages/trade/index.vue'
	import MeIndex from '@/pages/me/index.vue'
	import StrategyIndex from '@/pages/strategy/index.vue'
	import type { MenuModel } from '~/components/common/TabBar.vue'
	import { UserFilled, Histogram, Monitor,Opportunity, HelpFilled } from '@element-plus/icons-vue'
	import { useStore } from '~/store'
	import Logo from '~/components/icons/Logo.vue'

	// 使用默认布局
	definePageMeta({
		layout: 'main'
	})

	const active = ref(0)
	const activeMenu = computed(() => menus.value && menus.value[active.value])
	// 定义菜单及对应的组件
	const menus = ref<MenuModel[] | null>([
		{
			name: '行情',
			iconSelected: markRaw(Logo),
			icon:markRaw(Histogram),
			contentComp: markRaw(MarketIndex),
			contentParams: {}
		},
		{
			name: '交易',
			icon: markRaw(HelpFilled),
			contentComp: markRaw(TradeIndex),
			contentParams: {}
		},
		{
			name: '策略',
			icon: markRaw(Opportunity),
			contentComp: markRaw(StrategyIndex),
			contentParams: {}
		},
		{
			name: '我的',
			icon: markRaw(UserFilled),
			contentComp: markRaw(MeIndex),
			contentParams: {}
		}
	])
	const menuHandler = (item: MenuModel, index: number) => {
		if (index == 0 && active.value == index) {
			useStore().setSplitLeft(0, !useStore().screenDoms[0].hideSplitLeft)
		}
		active.value = index
	}

	onBeforeUnmount(() => {
		menus.value = null
		console.log('onBeforeUnmount.............................')
	})
</script>
<template>
	<div class="main-container flex justify-between flex-row w-full h-full">
		<LeftMenu @menuHandler="menuHandler" :menus="menus" v-if="menus"></LeftMenu>
		<!-- 使用缓存 -->
		<div class="right-container">
			<KeepAlive>
				<component :is="activeMenu.contentComp" v-if="activeMenu"  :key="activeMenu.name"/>
			</KeepAlive>
		</div>
	</div>
</template>

<style scoped lang="less">
	// .light .main-container{
	// 	&::before {
	// 		background-image: unset;
	// 	}
	// }
	.main-container {
		height: calc(var(--body-height) - var(--header-height) - var(--status-bar-height));
		width: var(--body-width);
		&::before {
			background-image: var(--bg-linear-180);
			// filter: blur(60px);
			position: absolute;
			top: 0;
			left: 0;
			width: 100%;
			height: 100%;
			content: '';
			z-index: -1;
			opacity: 0.15;
		}
		.right-container {
			width: calc(var(--body-width) - var(--menu-width));
		}
	}

	@media (max-width: 999px) {
		.main-container {
			height: var(--body-height);
			width: 100%;
			.right-container {
				width: 100%;
			}
		}
		
	}
</style>
