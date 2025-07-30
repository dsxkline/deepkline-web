<script lang="ts" setup>
	import HotSector from '~/components/sector/HotSector.vue';
import { getMenuHeight, getNavHeight } from '~/composable/useCommon'
	import { usePush, useRefreshChildEvent, useWillAppear, useWillDisappear } from '~/composable/usePush'
	import { useStore } from '~/store'
	import { useSymbolStore } from '~/store/symbol'
	const props = defineProps<{
		push?: boolean
		height?: number
	}>()
	const pushLeft = usePush()
	const tabbarHeight = ref(0)
	const navbar = ref()
	watch(
		() => useStore().bodyHeight,
		(n, o) => {
			setTabbarHeight()
		}
	)

	function setTabbarHeight() {
		tabbarHeight.value = (props.height || useStore().bodyHeight) - (useStore().isH5 ? navbar.value?.clientHeight || getNavHeight() : 0)
		if (!props.push) {
			tabbarHeight.value -= getMenuHeight() || 55
		}
	}

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
		<NavigationBar ref="navbar" title="板块排行" :hideBack="!push"> </NavigationBar>
		<ScrollBar class="w-full h-full" :wrap-style="{ height: tabbarHeight + 'px' }" :always="false">
            <HotSector :full="true"/>
		</ScrollBar>
	</div>
</template>
<style lang="less" scoped></style>
