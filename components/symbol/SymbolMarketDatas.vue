<script setup lang="ts">
	import { useSymbolStore } from '~/store/symbol'
	import { type Ticker } from '~/fetch/okx/okx.type.d'
	import Trades from './Trades.vue'
	import { useStore } from '~/store/index'
	const props = defineProps<{
		symbol: string
		height: number
	}>()
	const item = ref<Ticker | null>(null)
	const change = ref<number>(0)
	const rate = ref<number>(0)
	const containerRef = ref(null)
	const contentHeight = computed(() => {
		// 获取当前组件的高度
		return props.height || 10000
	})
	watch(
		() => props.symbol,
		(val, old) => {
			$ws.removeTickerHandler(old, tickerHandler)
			$ws.addTickerHandler(val, tickerHandler)
			item.value = null
		}
	)
	const symbolObj = computed(() => useSymbolStore().symbols[props.symbol] || {})
	const { $wsb, $ws } = useNuxtApp()
	const tickerHandler = (data: Ticker) => {
		item.value = data
		// console.log('symbol', symbol, '行情tick', item.value);
		// 涨跌额
		change.value = parseFloat(item.value?.last || '0') - parseFloat(item.value?.sodUtc8 || '0')
		// 涨跌幅
		rate.value = (change.value / parseFloat(item.value?.sodUtc8 || '0')) * 100
	}
	onMounted(() => {
		$ws.addTickerHandler(props.symbol, tickerHandler)
	})
	onUnmounted(() => {
		containerRef.value = null
		item.value = null
		$ws.removeTickerHandler(props.symbol, tickerHandler)
	})
</script>
<template>
	<div class="symbol-market-datas w-full text-xs" ref="containerRef">
		<el-scrollbar :height="contentHeight + 'px'">
			<div class="flex flex-col items-start mt-2 mb-3 px-[16px]">
				<b :class="'text-3xl ' + (rate >= 0 ? 'text-green' : 'text-red')" v-if="item?.last && symbolObj">
					<!-- ${{ formatPrice(parseFloat(item?.last), symbolObj.tickSz) }} -->
					<NumberIncrease :value="formatPrice(parseFloat(item?.last), symbolObj.tickSz)" :fontSize="30" />
				</b>
				<b :class="'text-3xl ' + (rate >= 0 ? 'text-green' : 'text-red')" v-else>--</b>
				<span :class="'' + (rate >= 0 ? 'text-green' : 'text-red')" v-if="change">{{ rate > 0 ? '+' : '' }}{{ change.toFixed(2) }} ({{ rate > 0 ? '+' : '' }}{{ rate.toFixed(2) }}%)</span>
				<span :class="'' + (rate >= 0 ? 'text-green' : 'text-red')" v-else>- (-%)</span>
			</div>

			<ul class="grid grid-cols-2 gap-2 text-invert mb-3 px-[16px]">
				<li>
					<span>24H开盘</span>
					<span v-if="item?.open24h">{{ formatPrice(parseFloat(item?.open24h), symbolObj.tickSz) }}</span>
					<span v-else>--</span>
				</li>
				<li>
					<span>24H最高</span>
					<span v-if="item?.high24h">{{ formatPrice(parseFloat(item?.high24h), symbolObj.tickSz) }}</span>
					<span v-else>--</span>
				</li>
				<li>
					<span>24H收盘</span>
					<span v-if="item?.last">{{ formatPrice(parseFloat(item?.last), symbolObj.tickSz) }}</span>
					<span v-else>--</span>
				</li>
				<li>
					<span>24H最低</span>
					<span v-if="item?.low24h">{{ formatPrice(parseFloat(item?.low24h), symbolObj.tickSz) }}</span>
					<span v-else>--</span>
				</li>
				<li>
					<span>24H量</span>
					<span v-if="item?.vol24h">{{ moneyFormat(item?.vol24h) }}</span>
					<span v-else>--</span>
				</li>
				<li>
					<span>买一价</span>
					<span v-if="item?.askPx">{{ formatPrice(item?.askPx, symbolObj.tickSz) }}</span>
					<span v-else>--</span>
				</li>
				<li>
					<span>24H额</span>
					<span v-if="item?.volCcy24h">{{ moneyFormat(item?.volCcy24h) }}</span>
					<span v-else>--</span>
				</li>
				<li>
					<span>卖一价</span>
					<span v-if="item?.bidPx">{{ formatPrice(item?.bidPx, symbolObj.tickSz) }}</span>
					<span v-else>--</span>
				</li>
			</ul>

			
			<div class="px-4 py-3 min-h-[50vh] flex flex-col justify-between" v-if="useStore().isH5">
				<CycleBar :symbol="symbol"/>
				<div class="flex-1"><KlineChart :symbol="symbol" /></div>
				<Indicator :symbol="symbol"/>
			</div>

			<div class="px-4">
				<BooksFull :symbol="symbol" />
			</div>
			<div class="px-4 py-3">
				<Trades :symbol="symbol" />
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
