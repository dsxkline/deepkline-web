<script lang="ts" setup>
	import MarketIndex from '@/pages/market/index.vue'
	import TradeIndex from '@/pages/trade/index.vue'
	import type { MenuModel } from '~/components/common/TabBar.vue'
	import { Histogram, Monitor } from '@element-plus/icons-vue'
	import { useStore } from '~/store'

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
			icon: markRaw(Histogram),
			contentComp: markRaw(MarketIndex),
			contentParams: {}
		},
		{
			name: '交易',
			icon: markRaw(Monitor),
			contentComp: markRaw(TradeIndex),
			contentParams: {}
		},
		{
			name: '日历',
			icon: markRaw(Monitor),
			contentComp: markRaw(TradeIndex),
			contentParams: {}
		},
		{
			name: '我的',
			icon: markRaw(Monitor),
			contentComp: markRaw(TradeIndex),
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
				<component :is="activeMenu.contentComp" v-if="activeMenu" />
			</KeepAlive>
		</div>
	</div>
</template>

<style scoped lang="less">
	.main-container {
		height: calc(var(--body-height) - var(--header-height) - var(--status-bar-height));
		width: var(--body-width);
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
		.left-menu {
			background-color: rgb(var(--color-bg-base));
			position: fixed;
			bottom: 0;
			z-index: 10;
			width: var(--body-width);
			display: flex;
			flex-direction: column;
			
			:deep(.other-menu) {
				display: none;
			}
			:deep(.main-menu) {
				ul {
					height: var(--menu-height);
					width: 100% !important;
					display: flex;
					flex-direction: row;
					align-items: center;
					background-color: var(--transparent05);
					display: grid;
					grid-template-columns:auto auto auto auto;
					li {
						height: var(--menu-height);
						flex: 1;
						padding: 0 12px;
						align-items: center;
						border: none;
						background: none;
						span {
							padding-bottom: 0;
							padding-top: 3px;
						}
					}
				}
			}
		}
	}
</style>
