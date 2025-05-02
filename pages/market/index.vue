<script lang="ts" setup>
	import { useStore } from '~/store'
	import { useSymbolStore } from '~/store/symbol'
	const mainSplit = ref()
	const twoSplit = ref()
	watch(
		() => useStore().hideSplitLeft,
		newVal => {
			if (mainSplit.value) mainSplit.value?.toggleLeft(newVal)
		}
	)
	watch(
		() => useStore().hideSplitRight,
		newVal => {
			if (mainSplit.value) mainSplit.value?.toggleRight(newVal)
		}
	)

	watch(
		() => useStore().splitScreen,
		newVal => {
			if (newVal == 1) {
				// if (mainSplit.value) mainSplit.value?.toggleLeft(true)
				// if (twoSplit.value) twoSplit.value?.toggleLeft(true)
			}
			if (newVal == 2) {
				// if (mainSplit.value) mainSplit.value?.toggleLeft(true)
				// if (twoSplit.value) twoSplit.value?.toggleLeft(false)
				// useStore().setSplitLeft(true)
			}
			if (newVal == 3) {
				// if (mainSplit.value) mainSplit.value?.toggleLeft(false)
				// if (twoSplit.value) twoSplit.value?.toggleLeft(false)
			}
		}
	)
	onMounted(() => {
		useStore().addSplitScreen(mainSplit.value)
		useStore().addSplitScreen(twoSplit.value)
	})
</script>
<template>
	<div class="w-full h-full">
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
								<KlineHeader :symbol="useSymbolStore().getActiveSymbol()" />
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
									<div><KlineFooter :symbol="useSymbolStore().getActiveSymbol()" /></div>
								</div>
							</template>
						</SplitRowContainer>
					</template>
				</SplitContainer>
			</template>
		</SplitContainer>
	</div>
</template>
