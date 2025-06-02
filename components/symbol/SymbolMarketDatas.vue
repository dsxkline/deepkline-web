<script setup lang="ts">
	import { useSymbolStore } from '~/store/symbol'
	import { type Ticker } from '~/fetch/okx/okx.type.d'
	import Trades from './Trades.vue'
	import { useStore } from '~/store/index'
import { useWillAppear, useWillDisappear } from '~/composable/usePush';
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
		return (props.height || 10000)
	})
	watch(
		() => props.symbol,
		(val, old) => {
			$ws.removeTickerHandler(old, tickerHandler)
			$ws.addTickerHandler(val, tickerHandler)
			item.value = null
			nextTick(()=>{
				tickerHandler($ws?.getTickers(props.symbol) || {})
			})
		}
	)
	const symbolObj = computed(() => useSymbolStore().symbols[props.symbol] || {})
	const { $wsb, $ws } = useNuxtApp()
	const tickerHandler = (data: Ticker) => {
		
		// console.log('symbol', symbol, '行情tick', item.value);
		// 涨跌额
		change.value = parseFloat(data?.last || '0') - parseFloat(data?.sodUtc8 || '0')
		// 涨跌幅
		rate.value = (change.value / parseFloat(data?.sodUtc8 || '0')) * 100
		item.value = data
	}

	let subHandle = ''

	function subSymbols() {
		// h5 spa模式
		if(!useStore().isH5) return;
		const { $wsb, $ws } = useNuxtApp()
		
		subHandle = $ws.subTickers([props.symbol], (message, error) => {
			if (useStore().isLeave) return
			// console.log("subTickers", message.data, error);
			if (message.data)
				message.data.forEach(item => {
					// console.log('subitem',item.instId,item)
					// 同步到store
					// useSymbolStore().setTickets(item.instId, item)
					$ws.setTickers(item.instId, item)
					
					// bgFlicker(item)
				})
		})
	}

	function unSubSymbols() {
		const { $wsb, $ws } = useNuxtApp()
		if (subHandle) {
			$ws.unsubscribe(subHandle)
			
		}
	}
	
	onMounted(() => {
		$ws.addTickerHandler(props.symbol, tickerHandler)
		tickerHandler($ws.getTickers(props.symbol))
		subSymbols()
	})

	useWillDisappear(()=>{
		console.log('symbol-market-datas useWillDisappear....')
		unSubSymbols()
	})
	useWillAppear(()=>{
		console.log('symbol-market-datas useWillAppear....')
		subSymbols()
	})

	onBeforeUnmount(() => {
		unSubSymbols()
		$ws.removeTickerHandler(props.symbol, tickerHandler)
		item.value = null
		containerRef.value = null
		
		
	})
</script>
<template>
	<div class="symbol-market-datas w-full text-xs" ref="containerRef">
		<ScrollBar :height="contentHeight + 'px'" :always="false">
			<div class="market-datas-head">
				<div class="market-datas-head-price flex flex-col items-start mt-2 mb-3 pl-4">
					<b v-autosize="32" :class="'text-3xl roboto-bold ' + (rate >= 0 ? 'text-green' : 'text-red')" v-if="item?.last && symbolObj">
						<!-- ${{ formatPrice(parseFloat(item?.last), symbolObj.tickSz) }} -->
						<NumberIncrease :value="formatPrice(parseFloat(item?.last), symbolObj.tickSz)" :fontSize="30" />
					</b>
					<b :class="'text-3xl ' + (rate >= 0 ? 'text-green' : 'text-red')" v-else>--</b>
					<span :class="'' + (rate >= 0 ? 'text-green' : 'text-red')" v-if="change">{{ rate > 0 ? '+' : '' }}{{ formatPrice(change, symbolObj.tickSz,'') }} ({{ rate > 0 ? '+' : '' }}{{ rate.toFixed(2) }}%)</span>
					<span :class="'' + (rate >= 0 ? 'text-green' : 'text-red')" v-else>- (-%)</span>
				</div>

				<ul class="market-datas-head-right grid grid-cols-2 gap-2 text-invert mb-3 px-4 text-xs">
					<li>
						<span>24H开盘</span>
						<span v-if="item?.open24h">{{ formatPrice(parseFloat(item?.open24h), symbolObj.tickSz) }}</span>
						<span v-else>--</span>
					</li>
					<li class="show">
						<span>24H最高</span>
						<span v-if="item?.high24h">{{ formatPrice(parseFloat(item?.high24h), symbolObj.tickSz) }}</span>
						<span v-else>--</span>
					</li>
					<li>
						<span>24H收盘</span>
						<span v-if="item?.last">{{ formatPrice(parseFloat(item?.last), symbolObj.tickSz) }}</span>
						<span v-else>--</span>
					</li>
					<li class="show">
						<span>24H最低</span>
						<span v-if="item?.low24h">{{ formatPrice(parseFloat(item?.low24h), symbolObj.tickSz) }}</span>
						<span v-else>--</span>
					</li>
					<li class="show">
						<span>24H成交量</span>
						<span v-if="item?.vol24h">{{ moneyFormat(item?.vol24h) }}</span>
						<span v-else>--</span>
					</li>
					<li>
						<span>买一价</span>
						<span v-if="item?.askPx">{{ formatPrice(item?.askPx, symbolObj.tickSz) }}</span>
						<span v-else>--</span>
					</li>
					<li class="show">
						<span>24H成交额</span>
						<span v-if="item?.volCcy24h">{{ moneyFormat(item?.volCcy24h) }}</span>
						<span v-else>--</span>
					</li>
					<li>
						<span>卖一价</span>
						<span v-if="item?.bidPx">{{ formatPrice(item?.bidPx, symbolObj.tickSz) }}</span>
						<span v-else>--</span>
					</li>
				</ul>
			</div>

			<div class="pb-3 mb-2 min-h-[50vh] flex flex-col justify-between market-kline-container" v-if="useStore().isH5">
				<div class="px-4 w-full border-b border-[--transparent05]"><CycleBar :symbol="symbol" /></div>
				<div class="flex-1"><KlineChart :symbol="symbol" /></div>
				<div class="px-4 w-full h-auto border-b border-t border-[--transparent05] py-2"><Indicator :symbol="symbol" /></div>
			</div>

			<div class="px-4">
				<BooksFull :symbol="symbol" />
			</div>
			<div class="px-4 py-3">
				<Trades :symbol="symbol" />
			</div>
		</ScrollBar>
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
						min-width: 70px;
					}
				}
			}
		}
	}
	.market-kline-container {
		display: none;
	}

	:deep(.ScrollBar__bar){
		.ScrollBar__thumb{
			display: none;
		}
	}
	@media (max-width: 999px) {
		.market-datas-head {
			display: flex;
			flex-direction: row;
			align-items: center;
			.market-datas-head-price {
				height: 60px;
				flex: 1;
				min-width: 0;
				@apply mb-2;
			}
			.market-datas-head-right {
				display: flex;
				flex-direction: column;
				justify-content: space-between;
				width: max-content;
				min-width: 40%;
				flex-shrink: 0;
				height: 100%;
				gap:0;
				@apply mt-3 mb-2;
				li {
					width: 100%;
					display: none;
					justify-content: space-between;
					align-items: center;
					line-height: normal;
					&.show{
						display: flex;
					}
					span {
						@apply text-xs text-nowrap;
						font-size: 0.65rem;
						&:first-child {
							@apply text-muted pr-2;
							text-align-last:unset;
							min-width: auto;
						}
					}
				}
			}
		}
		.market-kline-container {
			display: flex;
			height: calc(var(--body-height) - 3 * 40px - 60px);
		}
	}
</style>
