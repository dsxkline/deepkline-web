<script setup lang="ts">
	import SymbolSearch from '~/components/symbol/SymbolSearch.vue'
	import { usePush } from '~/composable/usePush'
	let push = usePush()
	function pushSearch() {
		push(SymbolSearch, {})
	}
</script>
<template>
	<div class="search-bar flex w-full" @click="pushSearch">
		<div ref="search" class="glass flex-1 search-enter bg-[--transparent05] rounded-md overflow-hidden flex items-center justify-between text-grey text-sm h-8 m-3 mx-0 px-3">
			<span class="flex items-center leading-none pr-3 text-xs"><HotIcon class="w-4 mr-2" />BTC/USDT</span>
			<el-icon class="!w-4 !h-4 !text-main"><Search class="!w-4 !h-4" /></el-icon>
		</div>
	</div>
</template>
