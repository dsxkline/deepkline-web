<script lang="ts" setup>
	import WhaleTrackingList from '~/components/datas/tables/WhaleTrackingList.vue'
	import { useUserStore } from '~/store/user'
	import { usePush } from '~/composable/usePush'
	import PriceBreakoutList from '~/components/datas/tables/PriceBreakoutList.vue'
	import FundingRateList from '~/components/datas/tables/FundingRateList.vue'
	import TabBar, { type MenuModel } from '~/components/common/TabBar.vue'
import { useStore } from '~/store'
import { getMenuHeight, getNavHeight } from '~/composable/useCommon'
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
		tabbarHeight.value = (useStore().bodyHeight) - (useStore().isH5 ? navbar.value?.clientHeight || getNavHeight() : 0)
		if (!props.push) {
			tabbarHeight.value -= getMenuHeight() || 55
		}
	}
	const menus = ref<MenuModel[]>([
		{
			name: '主力追踪',
			contentComp: markRaw(WhaleTrackingList),
			contentParams: {
				pageSize:500
			}
		},
		{
			name: '价格突破',
			contentComp: markRaw(PriceBreakoutList),
			contentParams: {
				pageSize:500
			}
		},
		{
			name: '资金费率',
			contentComp: markRaw(FundingRateList),
			contentParams: {
				pageSize:30
			}
		},
		{
			name: '清算排行',
			contentComp: markRaw(WhaleTrackingList),
			contentParams: {
				pageSize:30
			}
		},
		{
			name: '舆情热度',
			contentComp: markRaw(WhaleTrackingList),
			contentParams: {
				pageSize:30
			}
		}
	])
	
	onMounted(() => {
		setTabbarHeight()
	})
</script>
<template>
	<div class="volatility w-full h-full">
		<NavigationBar ref="navbar" title="市场异动" :hideBack="!push"> </NavigationBar>
		<div class="mx-4 overflow-hidden">
			<TabBar :menus="menus" :height="tabbarHeight"/>
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
