<script lang="ts" setup>
	import WhaleTrackingList from './tables/WhaleTrackingList.vue'
	import { useUserStore } from '~/store/user'
	import { usePush } from '~/composable/usePush'
	import TabBar, { type MenuModel } from '../common/TabBar.vue'
	import PriceBreakoutList from './tables/PriceBreakoutList.vue'
	import FundingRateList from './tables/FundingRateList.vue'
	import Volatility from '~/pages/market/volatility.vue'
	import BigOrders from './tables/BigOrders.vue'
	import ChangeRateList from './tables/ChangeRateList.vue'
	const {t} = useI18n()
	const props = defineProps<{
		push?: string
	}>()
	const usepush = usePush()
	const loading = ref(true)
	const menus = computed<MenuModel[]>(()=>[
		{
			name: t('主力追踪'),
			contentComp: markRaw(WhaleTrackingList),
			contentParams: {
				pageSize: 11
			}
		},
		{
			name: t('支撑位'),
			contentComp: markRaw(PriceBreakoutList),
			contentParams: {
				source: 'home',
				type: 'support',
				pageSize: 11
			}
		},
		{
			name: t('压力位'),
			contentComp: markRaw(PriceBreakoutList),
			contentParams: {
				source: 'home',
				type: 'resistance',
				pageSize: 11

			}
		},
		// {
		// 	name: '资金费率',
		// 	contentComp: markRaw(FundingRateList),
		// 	contentParams: {}
		// },
		{
			name: t('实时涨幅'),
			contentComp: markRaw(ChangeRateList),
			contentParams: { source: 'home', pageSize: 8 }
		},
		{
			name: t('大单监控'),
			contentComp: markRaw(BigOrders),
			contentParams: { pageSize: 8 }
		}
	])

	function pushVolatility() {
		usepush(Volatility)
	}

	onMounted(() => {})
</script>
<template>
	<div class="market-volatility w-full h-full py-4">
		<div class="market-volatility mx-4 overflow-hidden">
			<h3 class="pb-0 flex justify-between items-center font-bold">
				{{t('异动信号')}} <el-icon @click="pushVolatility"><ElIconArrowRight /></el-icon>
			</h3>
			<TabBar :menus="menus" />
			<button class="w-full !py-2 text-center text-sm bt-default !bg-transparent !border-[--transparent05] !rounded-full overflow-hidden !text-grey" @click="pushVolatility">
				{{t('更多')}}<el-icon><ElIconArrowRight /></el-icon>
			</button>
		</div>
	</div>
</template>
<style lang="less" scoped>
	:deep(.tabbar-container) {
		@apply py-2;
		.tabbar-header {
			@apply px-0;
			ul {
				@apply text-sm;
			}
		}
	}
</style>
