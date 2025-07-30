<script setup lang="ts">
	import { useSymbolStore } from '~/store/symbol'
	import { type Ticker } from '~/fetch/okx/okx.type.d'
	import { useStore } from '~/store/index'
	import { usePush, useWillAppear, useWillDisappear } from '~/composable/usePush'
	import SymbolDetail from './SymbolDetail.vue'
	import type { SymbolDto } from '~/fetch/dtos/symbol.dto'
	import { useAddPageSubSymbols } from '~/composable/usePageSubSymbols'
	const props = defineProps<{
		symbol: string
	}>()
	const item = ref<Ticker | null>(null)
	const change = ref<number>(0)
	const rate = ref<number>(0)
	const containerRef = ref(null)
	const loading = ref(true)
	const { $wsb, $ws } = useNuxtApp()
	watch(
		() => props.symbol,
		(val, old) => {
			$ws.removeTickerHandler(old, tickerHandler)
			$ws.addTickerHandler(val, tickerHandler)
			item.value = null
			nextTick(() => {
				tickerHandler($ws?.getTickers(props.symbol) || {})
			})
		}
	)
	const symbolObj = computed(() => useSymbolStore().symbols[props.symbol] || {})

	const tickerHandler = (data: Ticker) => {
		// console.log('symbol', symbol, '行情tick', item.value);
		// 涨跌额
		change.value = parseFloat(data?.last || '0') - parseFloat(data?.sodUtc8 || '0')
		// 涨跌幅
		rate.value = (change.value / parseFloat(data?.sodUtc8 || '0')) * 100
		item.value = data

		loading.value = false
	}

	const push = usePush()
	function clickSymbol(item?: SymbolDto) {
		// 是否选中返回
		if (useStore().isH5) {
			const params = {
				symbol: item?.symbol
			}
			push(SymbolDetail, params)
			return
		}
	}

	// 使用页面订阅收集器
	const pageSubSymbols = useAddPageSubSymbols()

	onMounted(() => {
		$ws.addTickerHandler(props.symbol, tickerHandler)
		tickerHandler($ws.getTickers(props.symbol))
		// 注入页面订阅收集器
		pageSubSymbols.addSubSymbols([props.symbol])
	})

	useWillDisappear(() => {
		console.log('symbol-card useWillDisappear....')
		
	})
	useWillAppear(() => {
		console.log('symbol-card useWillAppear....')
		
	})

	onBeforeUnmount(() => {
	
		$ws.removeTickerHandler(props.symbol, tickerHandler)
		item.value = null
		containerRef.value = null
	})
</script>
<template>
	<div
		:class="['symbol-card flex flex-col justify-between p-2 py-3 rounded-md overflow-hidden', rate > 0 ? 'green-linear' : rate < 0 ? 'red-linear' : 'default-linear']"
		@click="clickSymbol(symbolObj)"
	>
		<div class="flex flex-col items-center justify-between text-sm" v-if="item?.last && !loading">
			<SymbolName :symbol="symbolObj" v-if="item?.last && symbolObj?.symbol" size="20px" />
			<span v-else>--</span>
			<b v-autosize="20" :class="'text-base roboto-bold leading-none py-0 ' + (rate >= 0 ? 'text-green' : 'text-red')" v-if="item?.last && symbolObj">
				<!-- ${{ formatPrice(parseFloat(item?.last), symbolObj.tickSz) }} -->
				<NumberIncrease :value="formatPrice(parseFloat(item?.last), symbolObj.tickSz)" :fontSize="20" />
			</b>
			<span v-else>-</span>
			<div v-if="item?.last && symbolObj && change" :class="'text-[10px] ' + (rate >= 0 ? 'text-green' : 'text-red')">
				<span class="pr-1">{{ rate > 0 ? '+' : '' }}{{ formatPrice(change, symbolObj.tickSz || '0.01', '') }}</span
				><span>{{ formatChangeRate(rate, 2) }}%</span>
			</div>
			<div class="text-[10px]" v-else>--</div>
		</div>
		<div class="flex flex-col items-center justify-between text-sm text-center min-h-16" v-else>
			<el-skeleton :rows="0" animated>
				<template #template>
					<el-skeleton-item variant="p" style="width: 40%; height: 50%" />
				</template>
			</el-skeleton>
			<el-skeleton :rows="0" animated>
				<template #template>
					<el-skeleton-item variant="p" style="width: 100%; height: 70%" />
				</template>
			</el-skeleton>
			<el-skeleton :rows="0" animated>
				<template #template>
					<el-skeleton-item variant="p" style="width: 40%; height: 40%" />
				</template>
			</el-skeleton>
		</div>
	</div>
</template>

<style lang="less" scoped>
	.default-linear {
		background: linear-gradient(to bottom, rgb(var(--color-text-main) / 0.05), rgb(var(--color-text-main) / 0));
	}

	.green-linear {
		background: linear-gradient(to bottom, rgb(var(--color-green) / 0.15), rgb(var(--color-green) / 0));
	}

	.red-linear {
		background: linear-gradient(to bottom, rgb(var(--color-red) / 0.15), rgb(var(--color-red) / 0));
	}
</style>
