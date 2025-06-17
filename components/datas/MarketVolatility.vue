<script lang="ts" setup>
	import WhaleTrackingList from './tables/WhaleTrackingList.vue'
	import { useUserStore } from '~/store/user'
	import { usePush } from '~/composable/usePush'
	import TabBar, { type MenuModel } from '../common/TabBar.vue'
	import PriceBreakoutList from './tables/PriceBreakoutList.vue'
    import FundingRateList from './tables/FundingRateList.vue'
	const props = defineProps<{
		push?: boolean
	}>()
	const usepush = usePush()
	const loading = ref(true)
	const menus = ref<MenuModel[]>([
		{
			name: '主力追踪',
			contentComp: markRaw(WhaleTrackingList),
			contentParams: {}
		},
		{
			name: '价格突破',
			contentComp: markRaw(PriceBreakoutList),
			contentParams: {}
		},
		{
			name: '资金费率',
			contentComp: markRaw(FundingRateList),
			contentParams: {}
		},
		{
			name: '清算排行',
			contentComp: markRaw(WhaleTrackingList),
			contentParams: {}
		},
		{
			name: '舆情热度',
			contentComp: markRaw(WhaleTrackingList),
			contentParams: {}
		}
	])
	onMounted(() => {})
</script>
<template>
	<div class="w-full h-full px-4 py-4">
		<h3 class="pb-0 flex justify-between items-center font-bold">
			异动信号 <el-icon><ElIconArrowRight /></el-icon>
		</h3>
		<TabBar :menus="menus" />
		<button class="w-full !py-2 text-center text-sm bt-default glass !border-none overflow-hidden !text-grey">
			更多<el-icon><ElIconArrowRight /></el-icon>
		</button>
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
