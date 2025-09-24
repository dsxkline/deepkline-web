<script setup lang="ts">
	import type { MenuModel } from '~/components/common/TabBar.vue'
	import { useStore } from '~/store'
	import OrderList from './OrderList.vue'
	import { usePush } from '~/composable/usePush'
	import HistoryOrder from '~/pages/order/history.vue'
	import { useOrderStore } from '~/store/order'
	import CrypeAssets from './CrypeAssets.vue'
	import PositionList from './PositionList.vue'
	import { useGetProvideParent } from '~/composable/useProviderParent'
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
					name: t('委托') + '(' + useOrderStore().orders.length + ')',
					contentComp: markRaw(OrderList)
				},
				{
					name: t('仓位') + '(' + useOrderStore().positions.length + ')',
					contentComp: markRaw(PositionList)
				},
				{
					name: t('资产') + '(' + useOrderStore().assets.length + ')',
					contentComp: markRaw(CrypeAssets)
				}
			]
	)

	watch(
		() => useStore().bodyHeight,
		(n, o) => {
			setContentHeight()
		}
	)

	function setContentHeight() {}

	const parentContainer = useGetProvideParent()
	function pushHistoryOrder() {
		usepush(HistoryOrder, {height:props.height},  '100%', parentContainer)
	}

	onMounted(() => {
		setContentHeight()
	})
	onUnmounted(() => {
		navbar.value = null
	})
</script>
<template>
	<div class="order-container">
		<TabBar :menus="menus" :height="props.height ? props.height : 0">
			<template #right>
				<button class="text-main w-5" @click="pushHistoryOrder"><OrderHistoryOrderIcon /></button>
			</template>
		</TabBar>
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
