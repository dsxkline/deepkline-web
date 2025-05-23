<script lang="ts" setup>
	import { useSymbolStore } from '~/store/symbol'
	import SymbolSearch from './SymbolSearch.vue'
	const props = defineProps<{
		symbol: string
	}>()
	const symbolObj = computed(() => {
		return useSymbolStore().symbols[props.symbol]
	})
	const nuxtApp = useNuxtApp()
	function pushSearch() {
		nuxtApp.$pushLeft(SymbolSearch, {}, '460px')
	}
</script>
<template>
	<div class="symbol-title grid place-items-center text-ms px-2 cursor-pointer h-auto" @click="pushSearch">
		<!-- <img src="https://www.okx.com/cdn/oksupport/asset/currency/icon/eth.png" width="20px" class="mr-1"/> -->
		<b class="grid place-items-center text-nowrap leading-none">{{ symbolObj?.instId }}</b>
		<!-- <el-icon class="ml-1"><ArrowDown /></el-icon> -->
	</div>
</template>