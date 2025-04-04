<script setup lang="ts">
	import { Search } from '@element-plus/icons-vue'
	import { type MenuModel } from '../common/TabBar.vue'
	import TabBar from '../common/TabBar.vue'
	import Options from './search/Options.vue'
	import SymbolList from './search/SymbolList.vue'
	import MarketList from './search/MarketList.vue'
	const keyword = ref('')

	const tabbarHeight = ref(0)
	const menus = ref<MenuModel[]>([
		{
			name: '自选',
			contentComp: markRaw(Options),
			contentParams: {
				title: '测试'
			}
		},
		{
			name: '市场',
			contentComp: markRaw(MarketList)
		}
	])
	const search = () => {}

	onMounted(() => {
		tabbarHeight.value = window?.innerHeight - 40 - 56 - 30
	})
</script>
<template>
	<div>
		<el-input v-model="keyword" placeholder="Please Input" :prefix-icon="Search" class="w-[100%] px-4 py-3" @keyup.enter="search" />
		<TabBar :menus="menus" :hideLine="true" :height="tabbarHeight" />
	</div>
</template>
<style lang="less" scoped>
	:deep(.tabbar-container) {
		.tabbar-header {
			padding: 0 16px;
      border-bottom:1px solid var(--transparent05);
		}
	}
</style>
