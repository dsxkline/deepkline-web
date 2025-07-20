<script setup lang="ts">
	import type { MenuModel } from '~/components/common/TabBar.vue'
	import { useStore } from '~/store'
	import OrderList from './OrderList.vue'
	import { usePush } from '~/composable/usePush'
	import HistoryOrder from '~/pages/order/history.vue'
	import { useOrderStore } from '~/store/order'
	import CrypeAssets from './CrypeAssets.vue'
	import PositionList from './PositionList.vue'
	const usepush = usePush()
	const tabbarHeight = ref(0)
	const navbar = ref()
	const menus = computed(
		() =>
			<MenuModel[]>[
				{
					name: '委托(' + useOrderStore().orders.length + ')',
					contentComp: markRaw(OrderList)
				},
				{
					name: '仓位(' + useOrderStore().positions.length + ')',
					contentComp: markRaw(PositionList)
				},
				{
					name: '资产(' + useOrderStore().assets.length + ')',
					contentComp: markRaw(CrypeAssets)
				}
			]
	)

	watch(
		() => useStore().bodyHeight,
		(n, o) => {
			tabbarHeight.value = n - 40 - 40
			if (useStore().isH5) tabbarHeight.value = n - (navbar.value?.clientHeight || 55)
		}
	)

	function pushHistoryOrder() {
		usepush(HistoryOrder)
	}

	onMounted(() => {
		tabbarHeight.value = window?.innerHeight - 40 - 40
		if (useStore().isH5) tabbarHeight.value = window?.innerHeight - (navbar.value?.clientHeight || 55)
	})
	onUnmounted(() => {
		navbar.value = null
	})
</script>
<template>
	<div class="order-container">
		<TabBar :menus="menus">
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
				@apply text-sm;
			}
		}
	}
</style>
