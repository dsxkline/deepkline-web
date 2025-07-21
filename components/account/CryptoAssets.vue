<script setup lang="ts">
	import { useSymbolStore } from '~/store/symbol'
	import { useOrderStore } from '~/store/order';
	const point = 8
</script>

<template>
	<div class="px-4">
		<h3 class="pb-3">资产</h3>
		<ul class="*:grid *:grid-cols-3 *:w-full *:py-2 *:items-center *:my-1 *:border-b *:border-[--transparent05]">
			<li>
				<div class="text-xs text-grey">名称</div>
				<div class="text-xs text-right text-grey">数量/余额</div>
				<div class="text-xs text-right text-grey">收益</div>
			</li>
			<template v-for="item in useOrderStore().assets">
				<li>
					<b class="col-span-1 text-base">
						<SymbolName :symbol="useSymbolStore().getSymbol(item.symbol)" :onlyCoin="true" size="30px"/>
					</b>
					<div class="flex flex-col col-span-1 text-xs items-end">
						<span class="text-sm">{{formatNumber(parseFloat(item.lotSize), useSymbolStore().getSymbol(item.symbol).lotSz) }}</span>
						<span class="text-grey">{{formatNumber(parseFloat(item.lotBalance||'0'), useSymbolStore().getSymbol(item.symbol).lotSz) }}</span>
					</div>
					<div class="flex flex-col col-span-1 text-xs items-end" v-if="parseFloat(item.profit)">
						<span :class="['text-sm', (parseFloat(item.profit)) > 0 ? 'text-green' : 'text-red']">{{ formatNumber(parseFloat(item.profit), '2') }}</span>
						<span :class="(parseFloat(item.profit)) > 0 ? 'text-green' : 'text-red'">{{ formatNumber(parseFloat(item.profit), '2')}}%</span>
					</div>
					<div class="flex flex-col col-span-1 text-xs items-end" v-else>
						<span :class="['text-sm']">--</span>
						<span>--</span>
					</div>
				</li>
			</template>
		</ul>
	</div>
</template>
