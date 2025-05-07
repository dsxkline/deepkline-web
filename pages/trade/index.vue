<script lang="ts" setup>
	import { useStore } from '~/store'
	import { useSymbolStore } from '~/store/symbol'
	
	onMounted(() => {
		

	})
</script>
<template>
	<div class="w-full h-[800px]">
		<KlineChart :symbol="useSymbolStore().activeSymbol" />
		
	</div>
</template>
