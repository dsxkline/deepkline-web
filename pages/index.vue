<script lang="ts" setup>
	import { useNuxtApp } from '#app'
	import OKXWebSocket from '@/fetch/okx/okx.websocket'
	import { CandleCannel } from '@/fetch/okx/okx.type.d'
	import MarketIndex from '@/pages/market/index.vue'
	import TradeIndex from '@/pages/trade/index.vue'
	import type { MenuModel } from '~/components/common/TabBar.vue'
	import { Histogram, House, Monitor } from '@element-plus/icons-vue'
	import { useStore } from '~/store'

	// 使用默认布局
	definePageMeta({
		layout: 'main'
	})
	onMounted(async () => {
		console.log('server', process.server)
		// const worker = new Worker('/js/worker.js')
	})
	const addScreenType = ref(false)
	const active = ref(0)
	const activeMenu = computed(() => menus.value[active.value])
	// 定义菜单及对应的组件
	const menus = ref<MenuModel[]>([
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
		}
	])
	const menuHandler = (item: MenuModel, index: number) => {
		console.log('menuHandler', item, index)
		if (index == 0 && active.value == index) {
			useStore().setSplitLeft(0, !useStore().screenDoms[0].hideSplitLeft)
		}
		active.value = index
	}

	const update = () => {
		console.log('update')
	}
</script>
<template>
	<div class="main-container flex justify-between flex-row w-full h-full">
		<LeftMenu @menuHandler="menuHandler" :menus="menus"></LeftMenu>
		<!-- 使用缓存 -->
		<div class="right-container">
			<KeepAlive>
				<component :is="activeMenu.contentComp" />
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
</style>
