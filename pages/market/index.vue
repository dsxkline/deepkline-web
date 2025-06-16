<script lang="ts" setup>
	import { useRefreshChildEvent, useWillAppear, useWillDisappear } from '~/composable/usePush'
	import { useStore } from '~/store'
	import { useSymbolStore } from '~/store/symbol'
	const mainSplit = ref()
	const twoSplit = ref()

	onMounted(() => {
		mainSplit.value && useStore().addSplitScreen(mainSplit.value)
		twoSplit.value && useStore().addSplitScreen(twoSplit.value)
		if (useStore().bodyWidth < 1400 && mainSplit.value) useStore().setSplitScreen(2)
	})
	onBeforeUnmount(() => {
		mainSplit.value = null
		twoSplit.value = null
	})

	useWillDisappear(() => {
		// 写hook方法
		console.log('page market willdisappear...')
	})

	useWillAppear(() => {
		console.log('page market willappear...')
	})

	watch(
		() => useStore().bodyWidth,
		val => {
			mainSplit.value && useStore().addSplitScreen(mainSplit.value)
			twoSplit.value && useStore().addSplitScreen(twoSplit.value)
			if (val < 1400) {
				// 隐藏行情
				mainSplit.value && useStore().setSplitScreen(2)
			}
			if (val < 1200) {
				// 隐藏行情
				mainSplit.value && useStore().setSplitScreen(1)
			}
		}
	)
	defineExpose({
		...useRefreshChildEvent()
	})
</script>
<template>
	<div class="pc-market w-full h-full" v-if="!useNuxtApp().$isMobile.value && !useStore().isH5">
		<SplitContainer ref="mainSplit">
			<template #left>
				<SymbolMarket />
			</template>
			<template #right>
				<SplitContainer :pushLeft="true" ref="twoSplit">
					<template #left>
						<SymbolDetail :symbol="useSymbolStore().activeSymbol" />
					</template>
					<template #right>
						<SplitRowContainer>
							<template #up>
								<KlineHeader :symbol="useSymbolStore().activeSymbol" />
							</template>
							<template #down>
								<div class="flex flex-col justify-between w-full h-full">
									<div class="flex-1">
										<SplitContainer :right="120" :left="0">
											<template #left>
												<KlineChart :symbol="useSymbolStore().activeSymbol" />
											</template>
											<template #right>
												<TradeOrder :symbol="useSymbolStore().activeSymbol" />
											</template>
										</SplitContainer>
									</div>
									<div><KlineFooter :symbol="useSymbolStore().activeSymbol" /></div>
								</div>
							</template>
						</SplitRowContainer>
					</template>
				</SplitContainer>
			</template>
		</SplitContainer>
	</div>
	<div class="h5-market w-full h-full">
		<SymbolMarket />
	</div>
</template>
<style lang="less" scoped>
	.h5-market {
		display: none;
	}
	@media (max-width: 999px) {
		.pc-market {
			display: none;
		}
		.h5-market {
			display: unset;
		}
	}
</style>
