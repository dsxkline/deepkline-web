<script setup lang="ts">
	import { type MenuModel } from '../common/TabBar.vue'
	import TabBar from '../common/TabBar.vue'
	import SymbolMarketDatas from './SymbolMarketDatas.vue'
	import SymbolDatas from './SymbolDatas.vue'
	import TradeOrder from '../trade/TradeOrder.vue'
	import SymbolInfo from './SymbolInfo.vue'
	import { useStore } from '~/store'
	import { useSymbolStore } from '~/store/symbol'
	import { InstanceType, type Instruments } from '~/fetch/okx/okx.type.d'
	import { getSymbolName } from '../../utils/filters'
	import { usePop } from '~/composable/usePush'
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
			contentComp: markRaw(SymbolInfo),
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
		// {
		// 	name: '交易',
		// 	contentComp: markRaw(TradeOrder),
		// 	contentParams: {
		// 		symbol: props.symbol
		// 	}
		// }
	])
	const pop = usePop()

	const symbolObj = computed(() => {
		return useSymbolStore().symbols[props.symbol]
	})
	function favorite(item: Instruments) {
		useSymbolStore().favoriteSymbol(item)
	}
	function returnBack() {
		pop()
	}

	watch(
		() => props.symbol,
		val => {
			menus.value.forEach(item => {
				if (item.contentParams) item.contentParams.symbol = val
			})
		}
	)

	watch(
		() => useStore().bodyHeight,
		(n, o) => {
			tabbarHeight.value = n - 40 - 40
			if (useStore().isH5) tabbarHeight.value = n - (document.querySelector('.navbar')?.clientHeight || 55)
		}
	)

	onMounted(() => {
		tabbarHeight.value = window?.innerHeight - 40 - 40
		if (useStore().isH5) tabbarHeight.value = window?.innerHeight - (document.querySelector('.navbar')?.clientHeight || 55)
	})
</script>
<template>
	<div class="w-full h-full">
		<NavigationBar v-if="useStore().isH5">
			<template #left>
				<button class="flex items-center pr-2" @click="returnBack">
					<el-icon><ArrowLeftBold /></el-icon>
				</button>
				<b class="text-xl flex items-center leading-[normal] font-extrabold roboto-bold">{{ getSymbolName(symbolObj) }} {{ symbolObj?.instType==InstanceType.SWAP?'永续':'' }}</b>
				<button class="flex items-center pl-2"><el-icon><CaretBottom /></el-icon></button>
			</template>
			<template #right>
				<SymbolFavoriteButton :symbol="symbol" />
			</template>
		</NavigationBar>
		<TabBar :menus="menus" :height="tabbarHeight" />
	</div>
</template>
<style lang="less" scoped>
	:deep(.tabbar-container) {
		.tabbar-header {
			@apply px-4;
			overflow-x: unset;
			height: var(--header-height);
			ul {
				li {
					font-size: 16px;
				}
			}
		}
	}
	:deep(.navbar) {
		display: none;
	}

	@media (max-width: 999px) {
		:deep(.navbar) {
			display: flex;
		}
		:deep(.tabbar-container) {
			.tabbar-header {
				overflow-x: unset;
				border-bottom: 1px solid var(--transparent10);
			}
		}
	}
</style>
