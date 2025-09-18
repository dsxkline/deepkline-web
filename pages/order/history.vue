<script setup lang="ts">
	import type { MenuModel } from '~/components/common/TabBar.vue'
	import { useStore } from '~/store'
	import { usePush } from '~/composable/usePush'
	import { getAppStatusBarHeight, getNavHeight } from '~/composable/useCommon'
	import HistoryOrderList from '~/components/order/HistoryOrderList.vue'
	import HistoryPositionList from '~/components/order/HistoryPositionList.vue'
	import FundLogsList from '~/components/order/FundLogsList.vue'
	const { t } = useI18n()
	const props = defineProps<{
		height?: number
	}>()
	const usepush = usePush()
	const tabbarHeight = ref(0)
	const navbar = ref()
	const menus = computed(
		() =>
			<MenuModel[]>[
				{
					name: t('历史委托'),
					contentComp: markRaw(HistoryOrderList)
				},
				{
					name: t('历史仓位'),
					contentComp: markRaw(HistoryPositionList)
				},
				{
					name: t('交易账单'),
					contentComp: markRaw(FundLogsList)
				}
			]
	)

	watch(
		() => useStore().bodyHeight,
		(n, o) => {
			setContentHeight()
		}
	)

	function setContentHeight() {
		tabbarHeight.value = useStore().bodyHeight - (navbar.value?.clientHeight || getNavHeight()) - getAppStatusBarHeight()
	}

	onMounted(() => {
		setContentHeight()
	})
	onUnmounted(() => {
		navbar.value = null
	})
</script>
<template>
	<div class="history-container">
		<AppStatusBar />
		<NavigationBar :title="t('交易记录')" ref="navbar"></NavigationBar>
		<TabBar :menus="menus" :height="tabbarHeight"> </TabBar>
	</div>
</template>
<style lang="less" scoped>
	:deep(.tabbar-container) {
		.tabbar-header {
			@apply border-b pb-2;
			border-color: var(--transparent10);
			ul {
				li {
					@apply !text-xs;
				}
			}
		}
	}
	@media (max-width: 999px) {
		:deep(.tabbar-container) {
			.tabbar-header {
				ul {
					li {
						@apply !text-sm;
					}
				}
			}
		}
	}
</style>
