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
	const contentHeight = computed(() => {
		// 获取当前组件的高度
		return props.height || 10000
	})
	const symbol = computed(() => useSymbolStore().activeSymbol)
	watchEffect(() => {
		item.value = symbolStore.tickets[symbol.value + '']
		// console.log('symbol', symbol, '行情tick', item.value);
		// 涨跌额
		change.value = parseFloat(item.value?.last || '0') - parseFloat(item.value?.sodUtc8 || '0')
		// 涨跌幅
		rate.value = (change.value / parseFloat(item.value?.sodUtc8 || '0')) * 100
	})
	// 监听行情变化
	watch(
		() => item.value,
		(newSymbol, oldSymbol) => {
			// console.log('newSymbol', newSymbol, 'oldSymbol', oldSymbol);
		}
	)

	const symbolObj = computed(() => useSymbolStore().symbols[symbol.value]||{})

	// 监听父级组件宽度变化自适应宽度
	onMounted(() => {})
	onDeactivated(() => {})
</script>
<template>
	<div class="symbol-market-datas w-full text-xs" ref="containerRef">
		<el-scrollbar :height="contentHeight + 'px'">
			<div class="flex flex-col items-start mt-2 mb-3 px-[16px]">
				<b :class="'text-3xl '+(rate>=0?'text-green':'text-red')" v-if="item?.last">${{ formatPrice(parseFloat(item?.last), symbolObj.tickSz) }}</b>
				<b :class="'text-3xl '+(rate>=0?'text-green':'text-red')" v-else>--</b>
				<span :class="''+(rate>=0?'text-green':'text-red')">{{ change.toFixed(2) }} ({{ rate.toFixed(2) }}%)</span>
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

			<div class="px-4">
				<BooksFull :symbol="symbol"/>
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
