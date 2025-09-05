<script lang="ts" setup>
	import { getAppStatusBarHeight, getMenuHeight, getNavHeight } from '~/composable/useCommon'
	import { usePush, useRefreshChildEvent, useWillAppear, useWillDisappear } from '~/composable/usePush'
	import type { MarketSectorDto } from '~/fetch/dtos/exchange.dto'
	import { useStore } from '~/store'
	import SymbolList from '~/components/symbol/search/SymbolList.vue'
	import { MarketType } from '~/fetch/dtos/symbol.dto'
	import HotSector from '~/components/sector/HotSector.vue'
	const props = defineProps<{
		push?: boolean
		height?: number
		sector: MarketSectorDto
	}>()
	const pushLeft = usePush()
	const tabbarHeight = ref(0)
	const navbar = ref()
	const mc = ref()
	watch(
		() => useStore().bodyHeight,
		(n, o) => {
			setTabbarHeight()
		}
	)

	function setTabbarHeight() {
		tabbarHeight.value = (props.height || useStore().bodyHeight) - (useStore().isH5 ? navbar.value?.clientHeight || getNavHeight() : 0) - getAppStatusBarHeight()
		if (!props.push) {
			tabbarHeight.value -= getMenuHeight() || 55
		}
	}

	const symbolListHeight = computed(() => tabbarHeight.value - (mc.value?.clientHeight || 108))

	onMounted(() => {
		setTabbarHeight()
	})
	onBeforeUnmount(() => {})

	useWillDisappear(() => {
		// 写hook方法
		console.log('page market willdisappear...')
	})

	useWillAppear(() => {
		console.log('page market willappear...')
	})

	defineExpose({
		...useRefreshChildEvent()
	})
</script>
<template>
	<div class="market-sectors w-full h-full">
		<AppStatusBar/>
		<NavigationBar ref="navbar" :title="sector.name" :hideBack="!push"> </NavigationBar>
		<HotSector :sector="sector" ref="mc" />
		<SymbolList :symbolCategory="MarketType.SPOT" :coins="sector.topCoins?.split(',') || []" :start="true" :height="symbolListHeight" />
	</div>
</template>
<style lang="less" scoped></style>
