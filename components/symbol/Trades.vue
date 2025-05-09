<script setup lang="ts">
	import { marketFetch } from '~/fetch/market.fetch'
	import type { BookEntry, BookMessage, BookResponse, Books, Instruments, Ticker, TradesMessage, TradesResponse } from '~/fetch/okx/okx.type.d'
	import { useSymbolStore } from '~/store/symbol'
	import { throttle } from 'lodash-es'

	const props = defineProps<{
		symbol: string
	}>()

	const tradesList = ref<TradesResponse[]>([])
	const lastTrade = ref<TradesResponse>()
	// 小数点
	const point = ref(0)
	const loading = ref(true)
	const error = ref('')
	const symbolObj = computed(() => {
		return useSymbolStore().symbols[props.symbol]
	})

	const { $wsb, $ws } = useNuxtApp()
	const ticker = ref($ws?.getTickers(props.symbol) || {})
	const tickerHandler = (data: Ticker) => {
		ticker.value = data
	}
	// 订阅句柄
	let subHandle = ''
	const pointLevel = ref(0)
	const pointLevelOptions = computed(() => {
		if (!symbolObj) return []
		const tickSz = symbolObj.value?.tickSz
		// if (!pointLevel.value) pointLevel.value = tickSz
		if (tickSz) {
			const rs: any[] = [tickSz]
			for (let i = 1; i <= 3; i++) {
				rs.push(noExponents(tickSz * 10 ** i))
			}
			return rs
		}
		return []
	})
	const pricePoint = ref(symbolObj.value?.tickSz || 0)
	// 模拟动画
	const animation = ref(false)
	watch(
		() => pointLevel.value,
		val => {
			if (subHandle) $ws.unsubscribe(subHandle)
			$ws.removeTickerHandler(props.symbol, tickerHandler)
			getTradeList()
		}
	)

	watch(
		() => symbolObj.value,
		val => {
			if (pointLevelOptions.value?.length > 0) pointLevel.value = pointLevelOptions.value[0]
		}
	)

	watch(
		() => props.symbol,
		(val, old) => {
			if (pointLevelOptions.value?.length > 0) pointLevel.value = pointLevelOptions.value[0]
			if (subHandle) $ws.unsubscribe(subHandle)
			$ws.removeTickerHandler(old, tickerHandler)
			getTradeList()
		}
	)

	const updateTradeList = throttle((message: TradesMessage) => {
		if (message.data && message.data.length > 0) {
			const data = message.data[0]
			const action = message.action
			updateOrderBook(data, action)
		}
	}, 10)

	function getTradeList() {
		loading.value = true
		error.value = ''
		point.value = 0
		tradesList.value = []
		$ws.addTickerHandler(props.symbol, tickerHandler)
		subHandle = $ws.subTrades(symbolObj.value?.instId || props.symbol, (message, err) => {
			// console.log('subBooksL2Tbt', message)
			// if(window.dsxKlineScrolling) return;
			if (!loading.value && !error.value && message.data) updateTradeList(message)
			if (tradesList.value?.length) {
				loading.value = false
				error.value = ''
			}
		})

		marketFetch
			.getTrades(props.symbol, 50)
			.then(res => {
				if (res?.code == 0 && res.data) {
					const datas = res.data
					datas.forEach(data => updateOrderBook(data))
				} else {
					error.value = res?.msg
				}
				if (tradesList.value?.length) {
					loading.value = false
					error.value = ''
				}
			})
			.catch(err => {
				console.log('err', err)
				loading.value = false
				error.value = '网络异常，请稍后再试'
			})
	}

	function updateOrderBook(updates: TradesResponse, action?: string) {
		point.value = symbolObj.value?.lotSz || 0
		pricePoint.value = symbolObj.value?.tickSz || 0
		if (tradesList.value.length > 30) {
			// 删除最后的数据
			lastTrade.value = JSON.parse(JSON.stringify(tradesList.value[tradesList.value.length - 1]))
			tradesList.value.splice(tradesList.value.length - 1, 1)[0]
		}
		tradesList.value?.unshift(updates)
		animation.value = true
		setTimeout(() => {
			animation.value = false
		}, 300)
	}

	const whenBrowserActive = () => {
		console.log('浏览器重新激活')
		$ws.unsubscribe(subHandle)
		$ws.removeTickerHandler(props.symbol, tickerHandler)
		getTradeList()
	}

	const wsError = (state: number) => {
		if (state == -2) {
			loading.value = false
			error.value = '网络异常，连接错误'
		} else {
			error.value = ''
		}
	}

	const { $windowEvent } = useNuxtApp()
	onMounted(() => {
		$ws.onSignalState(wsError)
		$windowEvent.addEvent(whenBrowserActive)
		pointLevel.value = symbolObj.value?.tickSz
		setTimeout(() => {
			getTradeList()
		}, 0)
	})
	onUnmounted(() => {
		$ws.unsubscribe(subHandle)
		$ws.removeTickerHandler(props.symbol, tickerHandler)
		$windowEvent.removeEvent(whenBrowserActive)
	})
</script>
<template>
	<div class="w-full h-full min-h-[750px]">
		<div class="flex items-center justify-between mb-2">
			<h3 class="text-sm mb-1 flex items-center">
				<b class="text-base">最新成交</b>
			</h3>
			<!-- <el-select v-model="pointLevel" style="width: 100px" v-if="!loading" click-sound>
				<el-option v-for="item in pointLevelOptions" :key="item" :label="item" :value="item" click-sound />
			</el-select> -->
		</div>
		<Error :content="error" v-if="!loading && error" class="min-h-[400px]">
			<!-- <template #default>
				<el-button @click.stop="getBooksFull()">点击刷新</el-button>
			</template> -->
		</Error>
		<el-skeleton :rows="3" animated v-if="loading && !error" class="py-2" />
		<template v-else-if="!error">
			<ul
				class="w-full h-full relative *:w-full flex flex-col *:grid *:grid-cols-3 *:my-[1px] *:py-[2.6px] *:items-center *:justify-between *:relative"
				:style="{ height: (tradesList.length + 3) * 21.19 + 'px' }"
			>
				<li class="text-grey bg-base !absolute top-0 left-0 z-10">
					<div>价格(USDT)</div>
					<div class="text-right">数量({{ symbolObj?.baseCcy }})</div>
					<div class="text-right">时间</div>
				</li>
				<li
					v-for="(item, index) in tradesList.slice(0, 1)"
					:key="'trade-' + index"
					class="duration-300 overflow-hidden"
					:style="['margin-top:0px', animation ? 'margin-top:21px' : 'transition:none;']"
				>
					<div :class="item.side == 'buy' ? 'text-red' : 'text-green'">{{ formatPrice(item.px, pricePoint) }}</div>
					<div class="text-right">{{ moneyFormat(formatPrice(item.sz, point), '', point) }}</div>
					<div class="text-right">{{ formatDate(parseInt(item.ts), 'HH:mm:ss') }}</div>
				</li>
				<li v-for="(item, index) in tradesList.slice(0, tradesList.length - 1)" :key="'trades-' + index" v-show="(index == 0 && !animation) || index > 0">
					<div :class="item.side == 'buy' ? 'text-red' : 'text-green'">{{ formatPrice(item.px, pricePoint) }}</div>
					<div class="text-right">{{ moneyFormat(formatPrice(item.sz, point), '', point) }}</div>
					<div class="text-right">{{ formatDate(parseInt(item.ts), 'HH:mm:ss') }}</div>
				</li>
				<li
					v-for="(item, index) in tradesList.slice(tradesList.length - 1, tradesList.length)"
					:key="'tradelast-' + index"
					class="duration-300 overflow-hidden !absolute bottom-0 left-0 bg-base z-10 h-[21.2px]"
				></li>
			</ul>
		</template>
	</div>
</template>
