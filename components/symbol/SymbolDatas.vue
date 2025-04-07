<script setup lang="ts">
	import { useSymbolStore } from '~/store/symbol'
	import { type Ticker } from '~/fetch/okx/okx.type.d'
	const props = defineProps<{
		height: number
	}>()
	const item = ref<Ticker | null>(null)
	const change = ref<number>(0)
	const rate = ref<number>(0)
	const symbolStore = useSymbolStore()
	const containerRef = ref(null)
	const mounted = ref(false)
	const contentHeight = computed(() => {
		// 获取当前组件的高度
		return props.height || 10000
	})
	const symbol = computed(() => useSymbolStore().activeSymbol)

	const symbolObj = computed(() => useSymbolStore().symbols[symbol.value])
	
	// 监听父级组件宽度变化自适应宽度
	onMounted(() => {})
	onDeactivated(() => {})
	function update(){
		mounted.value = true
	}
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

				<!-- 获取多空持仓人数比 -->
				<LongShortAccountRatio :symbol="symbol"></LongShortAccountRatio>
				<LoanRatio :symbol="symbol"></LoanRatio>
				<OpenInterestVolume :symbol="symbol"></OpenInterestVolume>
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
