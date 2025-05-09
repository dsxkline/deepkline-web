<script setup lang="ts">
	import { Search } from '@element-plus/icons-vue'
	import { type MenuModel } from '../common/TabBar.vue'
	import TabBar from '../common/TabBar.vue'
	import Options from './search/Options.vue'
	import SymbolList from './search/SymbolList.vue'
	import MarketList from './search/MarketList.vue'
	import { useSymbolStore } from '~/store/symbol'
	import { useStore } from '~/store'
	const tabbar = ref()
	const active = ref(0)
	const tabbarHeight = ref(0)
	const menus = ref<MenuModel[]>([
		{
			name: '自选',
			contentComp: markRaw(Options),
			contentParams: {}
		},
		{
			name: '市场',
			contentComp: markRaw(MarketList)
		}
	])
	const search = () => {}

	watch(
		() => useStore().bodyHeight,
		(n, o) => {
			tabbarHeight.value = n - 40 - 30
		}
	)

	onMounted(() => {
		tabbarHeight.value = window?.innerHeight - 40 - 30
		useSymbolStore().loadFavoriteSymbols()
		let favoriteSymbols = useSymbolStore().favoriteSymbols || []
		if (!favoriteSymbols?.length) {
			active.value = 1
			tabbar.value.update(active.value)
		}
	})
</script>
<template>
	<div>
		<TabBar ref="tabbar" :menus="menus" :hideLine="true" :height="tabbarHeight" :active="active" />
	</div>
</template>
<style lang="less" scoped>
	:deep(.tabbar-container) {
		.tabbar-header {
			@apply px-4;
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
			// box-shadow: 0 0 0 1px var(--el-input-focus-border-color) inset;
			box-shadow: none;
			border: 1px solid var(--el-input-focus-border-color);
		}
	}
</style>
