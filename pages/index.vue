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
	const menus = ref<MenuModel[]|null>([
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
		if (index == 0 && active.value == index) {
			useStore().setSplitLeft(0, !useStore().screenDoms[0].hideSplitLeft)
		}
		active.value = index
	}

	onBeforeUnmount(()=>{
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
				<component :is="activeMenu.contentComp" v-if="activeMenu"/>
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
