<script setup lang="ts">
	import { Search } from '@element-plus/icons-vue'
	import { type MenuModel } from '../common/TabBar.vue'
	import TabBar from '../common/TabBar.vue'
	import Options from './search/Options.vue'
	import MeIndex from '../../pages/me/index.vue'
	import MarketList from './search/MarketList.vue'
	import { useSymbolStore } from '~/store/symbol'
	import { useStore } from '~/store'
	import SymbolSearch from './SymbolSearch.vue'
	import { usePush } from '~/composable/usePush'
	const tabbar = ref()
	const active = ref(0)
	const tabbarHeight = ref(0)
	const search = ref()
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

	watch(
		() => useStore().bodyHeight,
		(n, o) => {
			tabbarHeight.value = n - 40 - 30
			if (useStore().isH5) tabbarHeight.value = n - (search.value?.clientHeight || 0) - (document.querySelector('.left-menu')?.clientHeight || 0) - 30
		}
	)

	onMounted(() => {
		tabbarHeight.value = useStore().bodyHeight - 40 - 30
		if (useStore().isH5) tabbarHeight.value = useStore().bodyHeight - (search.value?.clientHeight || 0) - (document.querySelector('.left-menu')?.clientHeight || 0) - 30
		// console.log('tabbarHeight', useStore().bodyHeight)
		useSymbolStore().loadFavoriteSymbols()
		let favoriteSymbols = useSymbolStore().favoriteSymbols || []
		if (!favoriteSymbols?.length) {
			active.value = 1
			tabbar.value.update(active.value)
		}
	})

	let push = usePush()
	function pushSearch() {
		push(SymbolSearch, {})
	}
	function pushMe() {
		push(MeIndex, {})
	}
	onBeforeUnmount(() => {
		tabbar.value = null
	})
</script>
<template>
	<div>
		<div class="search-container flex px-4 w-full">
			<div ref="search" class="flex-1 search-enter bg-[--transparent05] rounded-md flex items-center justify-between text-grey text-sm h-8 my-3 mr-3 px-3">
				<span class="flex items-center leading-none"><HotIcon class="w-4 mr-2" />BTC/USDT</span>
				<el-icon class="!w-4 !h-4 !text-main"><Search class="!w-4 !h-4" /></el-icon>
			</div>
			<button @click="pushMe"><ExchangeLogo exchange="okx" class="w-7" /></button>
		</div>

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
					@apply text-base;
				}
			}
		}
		.tabbar-content {
			.tabbar-header {
				ul {
					li {
						@apply text-sm;
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

	.search-container {
		display: none;
	}

	@media (max-width: 999px) {
		.search-container {
			display: flex;
		}
		.search-enter {
			display: flex;
			position: relative;
			&::before {
				// background-image: linear-gradient(90deg, #00dc82, #36e4da, #0047e1);
				background-image: var(--bg-linear-90);
				// filter: blur(60px);
				position: absolute;
				top: 0;
				left: 0;
				width: 100%;
				height: 100%;
				content: '';
				z-index: -1;
				opacity: 0.2;
				border-radius: var(--el-border-radius-base);

				// transition: all 0.3s ease;
			}
		}

		:deep(.tabbar-container) {
			.tabbar-header {
				ul {
					li {
						@apply text-xl;
					}
				}
			}
			.tabbar-content {
				.tabbar-header {
					ul {
						li {
							@apply text-base;
						}
					}
				}
			}
		}
	}
</style>
