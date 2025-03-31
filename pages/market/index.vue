<script lang="ts" setup>
import { useSymbolStore } from '~/store/symbol';

</script>
<template>
	<div class="w-full h-full">
		<SplitContainer>
			<template #left>
				<SymbolSearch />
			</template>
			<template #right>
				<SplitRowContainer>
					<template #up>
						<KlineHeader :symbol="useSymbolStore().getActiveSymbol()" />
					</template>
					<template #down>
						<div class="flex flex-col justify-between w-full h-full">
                            <div class="flex-1"><KlineChart :symbol="useSymbolStore().getActiveSymbol()" /></div>
                            <div><KlineFooter :symbol="useSymbolStore().getActiveSymbol()" /></div>
						</div>
					</template>
				</SplitRowContainer>
			</template>
		</SplitContainer>
	</div>
</template>
