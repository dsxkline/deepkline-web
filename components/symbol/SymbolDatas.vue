<script setup lang="ts">
	import { useSymbolStore } from '~/store/symbol'
	import { InstanceType, type Ticker } from '~/fetch/okx/okx.type.d'
import TakerVolumn from './echarts/TakerVolume.vue';
	const props = defineProps<{
		height: number
	}>()
	const item = ref<Ticker | null>(null)
	const containerRef = ref(null)
	const mounted = ref(false)
	const contentHeight = computed(() => {
		// 获取当前组件的高度
		return props.height || 10000
	})
	const symbol = computed(() => useSymbolStore().activeSymbol)
	const symbolObj = computed(() => useSymbolStore().symbols[symbol.value])

	function update(){
		mounted.value = true
	}
	onBeforeUnmount(() => {
		containerRef.value = null
		item.value = null
	})
	defineExpose({
		update
	})
</script>
<template>
	<div class="symbol-market-datas w-full text-xs" ref="containerRef">
		<el-scrollbar :height="contentHeight + 'px'">
			<div class="px-4" v-if="mounted">
				<!-- 需要每笔成交数据计算生成 -->
				<!-- <SymbolFundFlow :symbol="symbol"></SymbolFundFlow>
				<SymbolFiveDayFundNetInFlow :symbol="symbol"></SymbolFiveDayFundNetInFlow>
				<Symbol24FundNetInFlow :symbol="symbol"></Symbol24FundNetInFlow> -->

				<!-- 获取多空持仓人数比，支持合约和现货 -->
				<LongShortAccountRatio :symbol="symbol" />
				<!-- 获取杠杠多空比 -->
				<LoanRatio :symbol="symbol" />
				<!-- 获取合约持仓量和成交量 -->
				<OpenInterestVolume :symbol="symbol" v-if="symbolObj.instType==InstanceType.SWAP" />
				<!-- 主动买入/卖出情况 -->
				<TakerVolume :symbol="symbol" />
			</div>
		</el-scrollbar>
	</div>
</template>

<style scoped lang="less">
	.symbol-market-datas {
		ul {
			li {
				display: flex;

				span {
					@apply text-main;

					&:first-child {
						@apply text-muted pr-2;
						text-align-last: justify;
						min-width: 60px;
					}
				}
			}
		}
	}
</style>
