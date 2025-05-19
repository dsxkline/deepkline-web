<script lang="ts" setup>
	import { useSymbolStore } from '~/store/symbol'
	import SymbolSearch from './SymbolSearch.vue'
	import type { Instruments } from '~/fetch/okx/okx.type.d'
	const props = defineProps<{
		symbol: string
	}>()
	const symbolObj = computed(() => {
		return useSymbolStore().symbols[props.symbol]
	})
	const nuxtApp = useNuxtApp()
	function pushSearch() {
		console.log(nuxtApp)
		nuxtApp.$pushLeft(SymbolSearch, {}, '460px')
	}
</script>
<template>
	<div class="symbol-title flex items-center text-ms px-2 rounded-md cursor-pointer text-nowrap" @click="pushSearch">
		<!-- <img src="https://www.okx.com/cdn/oksupport/asset/currency/icon/eth.png" width="20px" class="mr-1"/> -->
		<b>{{ symbolObj?.instId }}</b>
		<!-- <el-icon class="ml-1"><ArrowDown /></el-icon> -->
	</div>
</template>
<style lang="less" scoped>
	.symbol-title {
		height: 30px;
		button {
			@apply border rounded py-1 px-2;
		}
	}
</style>
