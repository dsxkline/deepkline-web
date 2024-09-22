<script setup lang="ts">
import { useSymbolStore } from '~/store/symbol';
import {type Ticker} from '~/fetch/okx/okx.type.d';
const props = defineProps({
	symbol: String,
});
const item = ref<Ticker|null>(null);
const symbolStore = useSymbolStore();
watchEffect(() => {
	const { symbol } = props;
	item.value = symbolStore.tickets[symbol + ''];
	console.log('symbol', symbol, '行情tick', item.value);
})

</script>
<template>
	<div class="symbol-market-datas w-full min-w-max p-3 text-xs">
		<div class="flex flex-col items-start mb-3">
			<b class="text-2xl text-red">${{ item?.last }}</b>
			<span class="text-red">+0.003003 (+0.34%)</span>
		</div>
		<ul class="grid grid-cols-2 gap-2 text-invert">
			<li>
				<span>24H开盘</span>
				<span>{{ item?.open24h }}</span>
			</li>
			<li>
				<span>24H最高</span>
				<span>{{ item?.high24h }}</span>
			</li>
			<li>
				<span>24H收盘</span>
				<span>{{ item?.open24h }}</span>
			</li>
			<li>
				<span>24H最低</span>
				<span>{{ item?.low24h }}</span>
			</li>
			<li>
				<span>24H量</span>
				<span>{{ item?.vol24h }}</span>
			</li>
			<li>
				<span>买一价</span>
				<span>{{ item?.askPx }}</span>
			</li>
			<li>
				<span>24H额</span>
				<span>{{ item?.volCcy24h }}</span>
			</li>
			<li>
				<span>卖一价</span>
				<span>{{ item?.bidPx }}</span>
			</li>
			<li>
				<span>量比</span>
				<span>1.9</span>
			</li>
			<li>
				<span>涨速</span>
				<span>-11.8</span>
			</li>
			<li>
				<span>委比</span>
				<span>43.90%</span>
			</li>
			<li>
				<span>换手率</span>
				<span>1.78%</span>
			</li>
		</ul>
		<SymbolFundFlow></SymbolFundFlow>
		<SymbolFiveDayFundNetInFlow></SymbolFiveDayFundNetInFlow>
		<Symbol24FundNetInFlow></Symbol24FundNetInFlow>

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
