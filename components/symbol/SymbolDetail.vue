<script setup lang="ts">
	import { type MenuModel } from '../common/TabBar.vue'
	import TabBar from '../common/TabBar.vue'
	import SymbolMarketDatas from './SymbolMarketDatas.vue'
	import SymbolDatas from './SymbolDatas.vue'
	import SymbolInfo from './SymbolInfo.vue'
	import { useStore } from '~/store'
	import { useSymbolStore } from '~/store/symbol'
	import { InstanceType, type Instruments } from '~/fetch/okx/okx.type.d'
	import { getSymbolName } from '../../utils/filters'
	import { usePop, usePushUp } from '~/composable/usePush'
	import SymbolSearch from './SymbolSearch.vue'
	const props = defineProps<{
		symbol: string
	}>()
	// 更新props.symbol
	const emit = defineEmits<{
		(event: 'update:symbol', symbol: string): void
	}>()
	const currentSymbol = ref(props.symbol)
	const tabbarHeight = ref(0)
	const navbar = ref()
	const menus = ref<MenuModel[]>([
		{
			name: '行情',
			contentComp: markRaw(SymbolMarketDatas),
			contentParams: {
				symbol: currentSymbol.value
			}
		},
		{
			name: '概况',
			contentComp: markRaw(SymbolInfo),
			contentParams: {
				symbol: currentSymbol.value
			}
		},
		{
			name: '数据',
			contentComp: markRaw(SymbolDatas),
			contentParams: {
				symbol: props.symbol
			}
		}
		// {
		// 	name: '交易',
		// 	contentComp: markRaw(TradeOrder),
		// 	contentParams: {
		// 		symbol: currentSymbol.value
		// 	}
		// }
	])

	const symbolObj = computed(() => {
		return useSymbolStore().symbols[currentSymbol.value]
	})
	function favorite(item: Instruments) {
		useSymbolStore().favoriteSymbol(item)
	}
	function returnBack() {
		useNuxtApp().$pop()
	}
	watch(
		() => props.symbol,
		val => {
			currentSymbol.value = val;
		}
	)
	watch(
		() => currentSymbol.value,
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
			if (useStore().isH5) tabbarHeight.value = n - (navbar.value?.clientHeight || 55)
		}
	)

	const push = usePushUp()
	function pushSearch() {
		// console.log('usePushUp')
		push(SymbolSearch, {
			selectHandle: (item: Instruments) => {
				if (item?.instId) {
					// 切换当前symbol
					currentSymbol.value = item.instId
					useNuxtApp().$pop()
				}
			}
		},'80%')
	}

	onMounted(() => {
		tabbarHeight.value = window?.innerHeight - 40 - 40
		if (useStore().isH5) tabbarHeight.value = window?.innerHeight - (navbar.value?.clientHeight || 55)
	})
	onUnmounted(() => {
		menus.value = []
		navbar.value = null
		console.log('SymbolDetail unmounted')

		
	})
</script>
<template>
	<div class="w-full h-full">
		<NavigationBar v-if="useStore().isH5" ref="navbar">
			<template #left>
				<button class="flex items-center pr-2 h-full" @click="returnBack">
					<el-icon><ArrowLeftBold /></el-icon>
				</button>
				<b class="text-xl flex items-center leading-[normal] font-extrabold roboto-bold h-full" @click="pushSearch"
					>{{ getSymbolName(symbolObj) }} {{ symbolObj?.instType == InstanceType.SWAP ? '永续' : '' }}</b
				>
				<button class="flex items-center pl-2 h-full" @click="pushSearch">
					<el-icon><CaretBottom /></el-icon>
				</button>
			</template>
			<template #right>
				<SymbolFavoriteButton :symbol="currentSymbol" />
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
				border-bottom: 1px solid var(--transparent05);
			}
		}
	}
</style>
