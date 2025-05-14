<script lang="ts" setup>
	import { useStore } from '~/store'
	import { useSymbolStore } from '~/store/symbol'
	const mainSplit = ref()
	const twoSplit = ref()

	onMounted(() => {
		useStore().addSplitScreen(mainSplit.value)
		useStore().addSplitScreen(twoSplit.value)
	})
	onBeforeUnmount(()=>{
		mainSplit.value = null
		twoSplit.value = null
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
</template>
