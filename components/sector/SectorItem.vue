<script setup lang="ts">
	import type { MarketSectorDto } from '~/fetch/dtos/exchange.dto'
	import LineChart from '../common/LineChart.vue'
	import { exchangeFetch } from '~/fetch/exchange.fetch'
	import { FetchResultDto } from '~/fetch/dtos/common.dto'
	import { usePush } from '~/composable/usePush'
	import Sectors from '~/pages/market/sectors.vue'
	import SectorDetail from '~/pages/market/sector-detail.vue'
	import { useAddPageSubSymbols } from '~/composable/usePageSubSymbols'
	import type { Ticker } from '~/fetch/okx/okx.type'
	import type { WsResult } from '~/types/types'

	const props = defineProps<{
		full?: boolean
		onlyOne?: boolean
		sector: MarketSectorDto
	}>()
	const pushLeft = usePush()
	const item = ref<Ticker | null>(null)
	const change = ref<number>(0)
	const rate = ref<number>(0)
	const { $wsb, $ws } = useNuxtApp()
	const symbol = computed(() => props.sector.topCoins?.split(',')[0] + '-USDT')
	const sectorRate = ref(props.sector.rate)
	const topCoin = ref(props.sector.topCoins?.split(',')[0])
	const tickerHandler = (data: Ticker) => {
		if (data?.sodUtc8) {
			// 涨跌额
			change.value = parseFloat(data?.last || '0') - parseFloat(data?.sodUtc8)
			// 涨跌幅
			rate.value = parseFloat(numberToFixed(change.value / parseFloat(data?.sodUtc8), '4'))
			item.value = data
		}
	}

	const pushSectorDetail = (sector: MarketSectorDto) => {
		pushLeft(SectorDetail, {
			sector
		})
	}

	

	onMounted(() => {
		
		// console.log('dddddd symbol.value',symbol.value)
		symbol.value && $ws.addTickerHandler(symbol.value, tickerHandler)
		symbol.value && tickerHandler($ws.getTickers(symbol.value))
	})

	onBeforeUnmount(() => {
		symbol.value && $ws.removeTickerHandler(symbol.value, tickerHandler)
		item.value = null
	})
</script>
<template>
	<li
		:class="['p-3 rounded-md overflow-hidden bg-[--transparent02] glass-1 relative', !full && !onlyOne ? 'w-[calc(var(--body-width)/2)] mr-2' : '', onlyOne ? 'w-full' : '']"
		@click="pushSectorDetail(sector)"
	>
		<h4 class="text-sm font-bold pb-1" v-if="!onlyOne">{{ sector.name }}</h4>
		<div class="text-sm flex flex-col">
			<b :class="['text-base font-bold', (sectorRate || sector.rate) >= 0 ? 'text-green' : 'text-red']" v-if="!onlyOne"
				>{{ (sectorRate || sector.rate) > 0 ? '+' : '' }}{{ numberToFixed((sectorRate || sector.rate) * 100, '2') }}%</b
			>
			<b :class="['text-base font-bold', (sectorRate || sector.rate) >= 0 ? 'text-green' : 'text-red']" v-else
				>{{ (sectorRate || sector.rate) > 0 ? '+' : '' }}{{ numberToFixed((sectorRate || sector.rate) * 100, '2') }}%</b
			>
			<span class="text-xs text-grey">24小时涨跌</span>
		</div>
		<div class="text-xs flex pt-2">
			<span>{{ topCoin }}</span
			><span :class="['px-1', rate >= 0 ? 'text-green' : 'text-red']">
				<template v-if="rate"> {{ rate > 0 ? '+' : '' }}{{ numberToFixed(rate * 100, '2') }}% </template>
				<template v-else>0.00%</template>
			</span>
		</div>
		<LineChart symbol="BTC-USDT" class="absolute right-0 top-0 w-2/5 h-1/2 translate-y-2/3 mx-3" />
	</li>
</template>
