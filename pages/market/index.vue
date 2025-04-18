<script lang="ts" setup>
	import { useSymbolStore } from '~/store/symbol'
</script>
<template>
	<div class="w-full h-full">
		<SplitContainer>
			<template #left>
				<SymbolSearch />
			</template>
			<template #right>
				<SplitContainer>
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
												<KlineChart :symbol="useSymbolStore().getActiveSymbol()" />
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
