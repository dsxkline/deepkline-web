<script lang="ts" setup>
	import WhaleTrackingList from '~/components/datas/tables/WhaleTrackingList.vue'
	import { useUserStore } from '~/store/user'
	import { usePush } from '~/composable/usePush'
	import PriceBreakoutList from '~/components/datas/tables/PriceBreakoutList.vue'
	import FundingRateList from '~/components/datas/tables/FundingRateList.vue'
	import TabBar, { type MenuModel } from '~/components/common/TabBar.vue'
	import { useStore } from '~/store'
	import { getAppStatusBarHeight, getMenuHeight, getNavHeight } from '~/composable/useCommon'
	import BigOrders from '~/components/datas/tables/BigOrders.vue'
	import ChangeRateList from '~/components/datas/tables/ChangeRateList.vue'
	const props = defineProps<{
		push?: boolean
	}>()
	const usepush = usePush()
	const loading = ref(true)
	const tabbarHeight = ref(0)
	const navbar = ref()
	watch(
		() => useStore().bodyHeight,
		(n, o) => {
			setTabbarHeight()
		}
	)

	function setTabbarHeight() {
		tabbarHeight.value = useStore().bodyHeight - (useStore().isH5 ? navbar.value?.clientHeight || getNavHeight() : 0) - getAppStatusBarHeight()
		if (!props.push) {
			tabbarHeight.value -= getMenuHeight() || 55
		}
	}
	const menus = ref<MenuModel[]>([
		{
			name: '主力追踪',
			contentComp: markRaw(WhaleTrackingList),
			contentParams: {
				pageSize: 500
			}
		},
		{
			name: '支撑位',
			contentComp: markRaw(PriceBreakoutList),
			contentParams: {
				pageSize: 500,
				type: 'support'
			}
		},
		{
			name: '压力位',
			contentComp: markRaw(PriceBreakoutList),
			contentParams: {
				pageSize: 500,
				type: 'resistance'
			}
		},
		// {
		// 	name: '资金费率',
		// 	contentComp: markRaw(FundingRateList),
		// 	contentParams: {
		// 		pageSize: 500
		// 	}
		// },
		{
			name: '实时涨幅',
			contentComp: markRaw(ChangeRateList),
			contentParams: {
				pageSize: 500
			}
		},
		{
			name: '大单监控',
			contentComp: markRaw(BigOrders),
			contentParams: {
				pageSize: 30
			}
		}
	])

	onMounted(() => {
		setTabbarHeight()
	})
</script>
<template>
	<div class="volatility w-full h-full">
		<AppStatusBar/>
		<NavigationBar ref="navbar" title="市场异动" :hideBack="!push"> </NavigationBar>
		<div class="mx-4 overflow-hidden">
			<TabBar :menus="menus" :height="tabbarHeight" />
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
