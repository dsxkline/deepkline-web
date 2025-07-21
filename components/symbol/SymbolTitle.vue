<script lang="ts" setup>
	import { useSymbolStore } from '~/store/symbol'
	import SymbolSearch from './SymbolSearch.vue'
import { usePush } from '~/composable/usePush';
	const props = defineProps<{
		symbol: string
	}>()
	const symbolObj = computed(() => {
		return useSymbolStore().symbols[props.symbol]
	})

	const push = usePush()
	function pushSearch() {
		push(SymbolSearch, {}, '460px')
	}
</script>
<template>
	<div class="symbol-title grid place-items-center text-ms px-2 cursor-pointer h-auto">
		<SymbolName :symbol="symbolObj" size="20px"/>
		<!-- <el-icon class="ml-1"><ArrowDown /></el-icon> -->
	</div>
</template>