<script setup lang="ts">
	import { Search } from '@element-plus/icons-vue'
	import { type MenuModel } from '../common/TabBar.vue'
	import TabBar from '../common/TabBar.vue'
	import Options from './search/Options.vue'
	import SymbolList from './search/SymbolList.vue'
	import MarketList from './search/MarketList.vue'
	import SymbolMarketDatas from './SymbolMarketDatas.vue'
	import SymbolDatas from './SymbolDatas.vue'
	import TradeOrder from '../trade/TradeOrder.vue'
	const props = defineProps<{
		symbol: string
	}>()
	const tabbarHeight = ref(0)
	const menus = ref<MenuModel[]>([
		{
			name: '行情',
			contentComp: markRaw(SymbolMarketDatas),
			contentParams: {
				symbol: props.symbol
			}
		},
		{
			name: '概况',
			contentComp: markRaw(MarketList),
			contentParams: {
				symbol: props.symbol
			}
		},
		{
			name: '数据',
			contentComp: markRaw(SymbolDatas),
			contentParams: {
				symbol: props.symbol
			}
		},
		{
			name: '交易',
			contentComp: markRaw(TradeOrder),
			contentParams: {
				symbol: props.symbol
			}
		}
	])

	onMounted(() => {
		tabbarHeight.value = window?.innerHeight - 40 - 40
	})
</script>
<template>
	<div class="w-full h-full">
		<TabBar :menus="menus" :height="tabbarHeight" />
	</div>
</template>
<style lang="less" scoped>
	:deep(.tabbar-container) {
		.tabbar-header {
			padding: 0px 16px;
			border-bottom: 1px solid var(--transparent05);
			overflow-x: unset;
			height: var(--header-height);
			ul {
				li {
					font-size: 16px;
				}
			}
		}
	}
</style>
