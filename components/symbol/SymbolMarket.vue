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
		tabbarHeight.value = window?.innerHeight - 40 - 30
	})
</script>
<template>
	<div>
		<TabBar :menus="menus" :hideLine="true" :height="tabbarHeight" />
	</div>
</template>
<style lang="less" scoped>
	:deep(.tabbar-container) {
		.tabbar-header {
			@apply px-4;
			border-bottom: 1px solid var(--transparent05);
			overflow-x: unset;
			height: var(--header-height);
			ul {
				li {
					font-size: 16px;
				}
			}
		}
		.tabbar-content {
			.tabbar-header {
				ul {
					li {
						font-size: 12px;
					}
				}
			}
		}
	}
	:deep(.el-input) {
		.el-input__wrapper {
			box-shadow: 0 0 0 1px var(--el-input-focus-border-color) inset;
		}
	}
</style>
