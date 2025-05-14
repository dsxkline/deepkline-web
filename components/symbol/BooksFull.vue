<script setup lang="ts">
	import { marketFetch } from '~/fetch/market.fetch'
	import type { BookEntry, BookMessage, BookResponse, Books, Instruments, Ticker } from '~/fetch/okx/okx.type.d'
	import { useSymbolStore } from '~/store/symbol'
	import { throttle } from 'lodash-es'

	const props = defineProps<{
		symbol: string
	}>()

	const orderBook = ref<{ asks: Map<number, BookEntry>; bids: Map<number, BookEntry> } | null>({
		asks: new Map<number, BookEntry>(),
		bids: new Map<number, BookEntry>()
	})
	const asks = ref<BookEntry[] | null>([])
	const bids = ref<BookEntry[] | null>([])
	let totalAsks = ref(0)
	let totalBids = ref(0)
	// 小数点
	const point = ref(0)
	const showNumber = 8

	const loading = ref(true)
	const error = ref('')
	const symbolObj = computed(() => {
		return useSymbolStore().symbols[props.symbol]
	})

	const { $wsb, $ws } = useNuxtApp()
	const ticker = ref<Ticker | null>($ws?.getTickers(props.symbol) || {})
	const tickerHandler = (data: Ticker) => {
		ticker.value = data
	}
	// 订阅句柄
	let subHandle = ''
	const disabled = ref(false)

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
	const activeBook = ref(0)

	watch(
		() => pointLevel.value,
		val => {
			if (subHandle) $ws.unsubscribe(subHandle)
			$ws.removeTickerHandler(props.symbol, tickerHandler)
			getBooksFull()
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
			$ws.removeTickerHandler(old, tickerHandler)
			getBooksFull()
		}
	)

	const updateBookList = throttle((message: BookMessage) => {
		if (message.data && message.data.length > 0) {
			const data = message.data[0]
			const action = message.action
			updateOrderBook(data, action)
		}
	}, 10)

	function getBooksFull() {
		loading.value = true
		error.value = ''
		orderBook.value = {
			asks: new Map<number, BookEntry>(),
			bids: new Map<number, BookEntry>()
		}
		asks.value = []
		bids.value = []
		totalAsks.value = 0
		totalBids.value = 0
		point.value = 0

		if (subHandle) $ws.unsubscribe(subHandle)
		$ws.addTickerHandler(props.symbol, tickerHandler)
		subHandle = $ws.subBooks('books', [symbolObj.value?.instId || props.symbol], (message, err) => {
			// console.log('subBooksL2Tbt', message)
			// if(window.dsxKlineScrolling) return;

			if (message.data) updateBookList(message)
			if (asks.value?.length || bids.value?.length) {
				loading.value = false
				error.value = ''
			}
		})

		marketFetch
			.booksFull(props.symbol, 100)
			.then(res => {
				console.log('booksfull....', res)
				if (res?.code === 0 && res?.data) {
					const datas = res.data
					datas.forEach(data => updateOrderBook(data, ''))
				} else {
					error.value = res?.msg
				}
				if (asks.value?.length || bids.value?.length) {
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

	function updateOrderBook(updates: BookResponse, action: string) {
		if (action == 'snapshot') {
			// 全量
			orderBook.value = {
				asks: new Map<number, BookEntry>(),
				bids: new Map<number, BookEntry>()
			}
			totalAsks.value = 0
			totalBids.value = 0
		}
		point.value = symbolObj.value?.lotSz || 0

		updates.asks.forEach(([px, sz]) => {
			let price = parseFloat(px)

			if (pointLevel.value > 0) {
				if (pointLevel.value < 1) {
					// 保留小数位数
					const p = (pointLevel.value + '').split('.')[1].length
					pricePoint.value = p
					price = parseFloat(price.toFixed(p))
					//console.log('pointLevel',p,price)
				} else {
					pricePoint.value = 0
					// 取整位数
					price = Math.floor(parseInt(price.toFixed(0)) / pointLevel.value) * pointLevel.value
				}
			}
			const size = parseFloat(sz)
			// if (sz.indexOf('.') >= 0) {
			// 	const p = parseFloat(sz.split('.')[1]).toString().length
			// 	if (p > point.value) point.value = Math.min(5, p)
			// }
			// 大于当前价的数据不要
			// if(price>parseFloat(ticker.value?.last))return;
			if (!orderBook.value) return
			if (size === 0) orderBook.value.asks.delete(price)
			else orderBook.value.asks.set(price, { px: price, sz: size, total: 0, ratio: 0 })
		})

		updates.bids.forEach(([px, sz]) => {
			let price = parseFloat(px)

			if (pointLevel.value > 0) {
				if (pointLevel.value < 1) {
					// 保留小数位数
					const p = (pointLevel.value + '').split('.')[1].length
					pricePoint.value = p
					price = parseFloat(price.toFixed(p))
				} else {
					pricePoint.value = 0
					// 取整位数
					price = Math.floor(parseInt(price.toFixed(0)) / pointLevel.value) * pointLevel.value
				}
			}
			const size = parseFloat(sz)
			// if (sz.indexOf('.') >= 0) {
			// 	const p = parseFloat(sz.split('.')[1]).toString().length
			// 	if (p > point.value) point.value = Math.min(5, p)
			// }
			// 小于当前价的数据不要
			// if(price<parseFloat(ticker.value?.last))return;
			if (!orderBook.value) return
			if (size === 0) orderBook.value.bids.delete(price)
			else orderBook.value.bids.set(price, { px: price, sz: size, total: 0, ratio: 0 })
		})
		// point.value = 1 / 10 ** point.value

		throttleAskBid()
		// console.log('Array.from(orderBook.value.bids.values())',Array.from(orderBook.value.bids.values()).length)
	}
	const throttleAskBid = throttle(() => {
		totalAsks.value = 0
		totalBids.value = 0
		if (!orderBook.value) return
		// 倒序排列
		let ask = Array.from(orderBook.value.asks.values())
			.sort((a, b) => a.px - b.px)
			.filter(item => ticker.value && item.px > parseFloat(ticker.value.last))
		if (activeBook.value == 0) ask = ask.slice(0, showNumber).reverse()
		else ask = ask.slice(0, 2 * showNumber + 1).reverse()
		for (let index = ask.length - 1; index >= 0; index--) {
			const item = ask[index]
			item.total = totalAsks.value += item.sz
		}
		asks.value = ask

		// 倒序排列
		let bid = Array.from(orderBook.value.bids.values())
			.sort((a, b) => b.px - a.px)
			.filter(item => ticker.value && item.px < parseFloat(ticker.value.last))
		if (activeBook.value == 0) bid = bid.slice(0, showNumber)
		else bid = bid.slice(0, 2 * showNumber + 1)
		for (let index = 0; index < bid.length; index++) {
			const item = bid[index]
			item.total = totalBids.value += item.sz
		}
		bids.value = bid

		trimMap(orderBook.value.asks, 100)
		trimMap(orderBook.value.bids, 100)
	}, 300)

	// bid/ask
	const calculateBuySellRatio = computed(() => {
		const totalBids = (bids.value && bids.value.reduce((sum, entry) => sum + entry.sz, 0)) || 1
		const totalAsks = (asks.value && asks.value.reduce((sum, entry) => sum + entry.sz, 0)) || 1
		return (totalBids / (totalBids + totalAsks)) * 100
	})

	const whenBrowserActive = () => {
		console.log('浏览器重新激活')
		$ws.unsubscribe(subHandle)
		$ws.removeTickerHandler(props.symbol, tickerHandler)
		getBooksFull()
	}

	const wsError = (state: number) => {
		if (state <= -1 && !asks.value?.length && !bids.value?.length) {
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
			getBooksFull()
		}, 0)
	})
	onUnmounted(() => {
		orderBook.value = null
		asks.value = null
		bids.value = null
		ticker.value = null
		$ws.unsubscribe(subHandle)
		$ws.removeTickerHandler(props.symbol, tickerHandler)
		$windowEvent.removeEvent(whenBrowserActive)
	})
</script>
<template>
	<div class="w-full h-full min-h-[400px]">
		<div class="flex items-center justify-between mb-2">
			<h3 class="text-sm mb-1 flex items-center">
				<b>订单表</b>
				<div class="flex items-center mx-2 *:border *:border-[var(--transparent20)] *:mx-1 *:opacity-50 *:rounded-sm">
					<button :class="['hover:opacity-80', activeBook == 0 ? '!opacity-100 !border-[var(--transparent30)]' : '']" @click="activeBook = 0" click-sound><BooksListIcon /></button>
					<button :class="['hover:opacity-80', activeBook == 1 ? '!opacity-100 !border-[var(--transparent30)]' : '']" @click="activeBook = 1" click-sound><BooksBuyListIcon /></button>
					<button :class="['hover:opacity-80', activeBook == 2 ? '!opacity-100 !border-[var(--transparent30)]' : '']" @click="activeBook = 2" click-sound><BooksSellListIcon /></button>
				</div>
			</h3>
			<!-- <el-select v-model="pointLevel" style="width: 100px;" v-if="!loading" click-sound>
				<el-option v-for="item in pointLevelOptions" :key="item" :label="item" :value="item"  click-sound/>
			</el-select> -->
		</div>
		<Error :content="error" v-if="!loading && error" class="min-h-[400px]">
			<!-- <template #default>
				<el-button @click.stop="getBooksFull()">点击刷新</el-button>
			</template> -->
		</Error>
		<el-skeleton :rows="3" animated v-if="loading && !error" class="py-2" />
		<template v-else-if="!error">
			<ul class="w-full h-full *:w-full flex flex-col *:grid *:grid-cols-3 *:my-[1px] *:py-[1.0px] *:items-center *:justify-between *:relative *:overflow-hidden">
				<li class="text-grey">
					<div>价格(USDT)</div>
					<div class="text-right">数量({{ symbolObj?.baseCcy }})</div>
					<div class="text-right">合计({{ symbolObj?.baseCcy }})</div>
				</li>
				<li v-for="(n,index) in showNumber" v-if="(activeBook == 0 || activeBook == 2) && asks" :key="index">
					<template v-if="asks[index]">
						<div class="text-red">{{ formatPrice(asks[index].px, pricePoint) }}</div>
						<div class="text-right">{{ moneyFormat(formatPrice(asks[index].sz, point), '', point) }}</div>
						<div class="text-right">{{ moneyFormat(formatPrice(asks[index].total, point), '', point) }}</div>
						<div
							class="absolute top-0 right-0 h-full w-full bg-red/20 transition-all transition-200 ease-in-out origin-right"
							:style="{
								transform: `scaleX(${(asks[index].total / (totalBids + totalAsks)) * 100 + '%'})`
							}"
						></div>
					</template>
				</li>

				<li class="!flex" v-if="bids && asks && !Number.isNaN(calculateBuySellRatio) && activeBook == 0">
					<div class="w-full h-5 text-xs text-white rounded-sm relative overflow-hidden">
						<div
							class="bg-green/50 flex justify-start items-center w-full h-full transition-all transition-100 ease-in-out absolute left-0 top-0 origin-left"
							:style="{
								transform: `translate3d(calc(-${100 - calculateBuySellRatio}% + 5px),0,0)`,
								'clip-path': 'polygon(0px 0px, 0 100%, calc(100% - 5px) 100%, 100% 0%)'
							}"
						></div>
						<div
							class="bg-red/50 flex justify-end items-center w-full h-full transition-all transition-100 ease-in-out absolute right-0 top-0 origin-right"
							:style="{
								transform: `translate3d(calc(${calculateBuySellRatio}% + 5px),0,0)`,
								'clip-path': 'polygon(5px 0px, 0px 100%, 100% 100%, 100% 0%)'
							}"
						></div>
						<div class="absolute left-0 top-0 h-full flex items-center">
							<b class="px-2">B</b><span>{{ calculateBuySellRatio.toFixed(2) }}%</span>
						</div>
						<div class="absolute right-0 top-0 h-full flex items-center">
							<span>{{ (100 - calculateBuySellRatio).toFixed(2) }}%</span><b class="px-2">S</b>
						</div>
					</div>
				</li>


				<li v-for="(n,index) in showNumber" v-if="(activeBook == 0 || activeBook == 1) && bids" :key="index">
					<template v-if="bids[index]">
						<div class="text-green">{{ formatPrice(bids[index].px, pricePoint) }}</div>
						<div class="text-right">{{ moneyFormat(formatPrice(bids[index].sz, point), '', point) }}</div>
						<div class="text-right">{{ moneyFormat(formatPrice(bids[index].total, point), '', point) }}</div>
						<div
							class="absolute top-0 right-0 h-full w-full bg-red/20 transition-all transition-300 ease-in-out origin-right"
							:style="{
								transform: `scaleX(${(bids[index].total / (totalBids + totalAsks)) * 100 + '%'})`
							}"
						></div>
					</template>
				</li>
			</ul>
		</template>
	</div>
</template>
