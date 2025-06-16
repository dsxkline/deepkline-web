<script lang="ts" setup>
	import TableList from './tables/TableList.vue'
	import { useUserStore } from '~/store/user'
	import { usePush } from '~/composable/usePush'
	import TabBar, { type MenuModel } from '../common/TabBar.vue'
	const props = defineProps<{
		push?: boolean
	}>()
	const usepush = usePush()
	const menus = ref<MenuModel[]>([
		{
			name: '量价齐升',
			contentComp: markRaw(TableList),
			contentParams: {},
			onClick: () => {}
		},
		{
			name: '主力追踪',
			contentComp: markRaw(TableList),
			contentParams: {},
			onClick: () => {}
		},
		{
			name: '价格突破',
			contentComp: markRaw(TableList),
			contentParams: {},
			onClick: () => {}
		},
		{
			name: '资金费率',
			contentComp: markRaw(TableList),
			contentParams: {},
			onClick: () => {}
		},
		{
			name: '清算排行',
			contentComp: markRaw(TableList),
			contentParams: {},
			onClick: () => {}
		},
		{
			name: '舆情热度',
			contentComp: markRaw(TableList),
			contentParams: {},
			onClick: () => {}
		}
	])
	onMounted(() => {})
</script>
<template>
	<div class="w-full h-full px-4 py-2">
		<h3 class="pb-0 flex justify-between items-center">
			异动信号 <el-icon><ElIconArrowRight /></el-icon>
		</h3>
		<TabBar :menus="menus" />
        <button class="w-full !py-2 text-center text-sm bt-default glass !border-none overflow-hidden !text-grey">更多<el-icon><ElIconArrowRight /></el-icon></button>
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
