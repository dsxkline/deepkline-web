<script lang="ts" setup>
	import HotSector from '~/components/sector/HotSector.vue'
	import { getAppStatusBarHeight, getMenuHeight, getNavHeight } from '~/composable/useCommon'
	import { useCurrentPageSubSymbols } from '~/composable/usePageSubSymbols'
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
		tabbarHeight.value = (props.height || useStore().bodyHeight) - (useStore().isH5 ? navbar.value?.clientHeight || getNavHeight() : 0) - getAppStatusBarHeight()
		if (!props.push) {
			tabbarHeight.value -= getMenuHeight() || 55
		}
	}

	const pageSubSymbols = useCurrentPageSubSymbols().subSymbols
	watch(
		() => pageSubSymbols.value,
		val => {
			console.log('板块首页的品种变动', val)
			unSubSymbols()
			subSymbols()
		},
		{ deep: true }
	)

	let subHandle = ''
	function subSymbols() {
		const { $wsb, $ws } = useNuxtApp()
		if (!pageSubSymbols.value?.length) return
		useSymbolStore().setSubSymbols(pageSubSymbols.value)
		subHandle = $ws.subTickers(pageSubSymbols.value, (message, error) => {
			if (message.data)
				message.data.forEach(item => {
					$ws.setTickers(item.instId, item)
				})
		})
	}

	function unSubSymbols() {
		const { $wsb, $ws } = useNuxtApp()
		if (subHandle) {
			$ws.unsubscribe(subHandle)
		}
	}

	onMounted(() => {
		setTabbarHeight()
	})
	onBeforeUnmount(() => {
        unSubSymbols()
    })

	useWillDisappear(() => {
		// 写hook方法
		console.log('page market sector willdisappear...')
        unSubSymbols()
	})

	useWillAppear(() => {
		console.log('page market sector willappear...')
        subSymbols()
	})

	defineExpose({
		...useRefreshChildEvent()
	})
</script>
<template>
	<div class="market-sectors w-full h-full">
		<AppStatusBar/>
		<NavigationBar ref="navbar" title="板块排行" :hideBack="!push"> </NavigationBar>
		<ScrollBar class="w-full h-full" :wrap-style="{ height: tabbarHeight + 'px' }" :always="false">
			<HotSector :full="true" />
		</ScrollBar>
	</div>
</template>
<style lang="less" scoped></style>
