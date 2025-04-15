<script setup lang="ts">
	import { marketFetch } from '~/fetch/market.fetch'
	import type { BookEntry, BookMessage, BookResponse, Books, Instruments, Ticker } from '~/fetch/okx/okx.type.d'
	import { useSymbolStore } from '~/store/symbol'
	import { throttle } from 'lodash-es'

	const props = defineProps<{
		symbol: string
	}>()

	const orderBook = ref<{ asks: Map<number, BookEntry>; bids: Map<number, BookEntry> }>({
		asks: new Map<number, BookEntry>(),
		bids: new Map<number, BookEntry>()
	})
	const asks = ref<BookEntry[]>([])
	const bids = ref<BookEntry[]>([])
	let totalAsks = ref(0)
	let totalBids = ref(0)
	// 小数点
	const point = ref(0)

	const loading = ref(true)
	const error = ref('')
	const symbolObj = computed(() => useSymbolStore().symbols[props.symbol])

	const { $wsb, $ws } = useNuxtApp()
	const ticker = ref($ws?.getTickers(props.symbol) || {})
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
		if (!pointLevel.value) pointLevel.value = tickSz
		if (tickSz) {
			const rs = [tickSz]
			for (let i = 1; i <= 3; i++) {
				rs.push(tickSz * 10 ** i)
			}
			return rs
		}
		return []
	})

	watch(
		() => pointLevel.value,
		val => {
			getBooksFull()
		}
	)

	watch(
		() => props.symbol,
		val => {
			getBooksFull()
		}
	)

	const updateBookList = throttle((message: BookMessage) => {
		if (message.data && message.data.length > 0) {
			const data = message.data[0]
			updateOrderBook(data)
		}
	}, 10)

	function getBooksFull() {
		loading.value = true
		error.value = ''
		orderBook.value = {
			asks: new Map<number, BookEntry>(),
			bids: new Map<number, BookEntry>()
		}
		totalAsks.value = 0
		totalBids.value = 0

		if (subHandle) $ws.unsubscribe(subHandle)
		$ws.removeTickerHandler(props.symbol, tickerHandler)

		marketFetch
			.booksFull(props.symbol, 10)
			.then(res => {
				loading.value = false
				if (res?.code == 0 && res.data) {
					const data = res.data[0]
					updateOrderBook(data)
					$ws.addTickerHandler(props.symbol, tickerHandler)
					subHandle = $ws.subBooks('books', [symbolObj.value?.instId || props.symbol], (message, err) => {
						// console.log('subBooksL2Tbt', message.data[0])
						if (!loading.value && !error.value) updateBookList(message)
					})
				} else {
					error.value = res?.msg
				}
			})
			.catch(err => {
				console.log('err', err)
				loading.value = false
				error.value = '网络异常，请稍后再试'
			})
	}

	function updateOrderBook(updates: BookResponse) {
		updates.asks.forEach(([px, sz]) => {
			let price = parseFloat(px)

			if (pointLevel.value > 0) {
				if (pointLevel.value < 1) {
					// 保留小数位数
					const p = (pointLevel.value + '').split('.')[1].length
					price = parseFloat(price.toFixed(p))
				} else {
					// 取整位数
					price = Math.floor(parseInt(price.toFixed(0)) / pointLevel.value) * pointLevel.value
				}
			}
			const size = parseFloat(sz)
			if (sz.indexOf('.') >= 0) {
				const p = sz.split('.')[1].length
				if (p > point.value) point.value = Math.min(5, p)
			}
			// 大于当前价的数据不要
			// if(price>parseFloat(ticker.value?.last))return;
			if (size === 0) orderBook.value.asks.delete(price)
			else orderBook.value.asks.set(price, { px: price, sz: size, total: 0, ratio: 0 })
		})

		updates.bids.forEach(([px, sz]) => {
			let price = parseFloat(px)

			if (pointLevel.value > 0) {
				if (pointLevel.value < 1) {
					// 保留小数位数
					const p = (pointLevel.value + '').split('.')[1].length
					price = parseFloat(price.toFixed(p))
				} else {
					// 取整位数
					price = Math.floor(parseInt(price.toFixed(0)) / pointLevel.value) * pointLevel.value
				}
			}
			const size = parseFloat(sz)
			if (sz.indexOf('.') >= 0) {
				const p = sz.split('.')[1].length
				if (p > point.value) point.value = Math.min(5, p)
			}
			// 小于当前价的数据不要
			// if(price<parseFloat(ticker.value?.last))return;
			if (size === 0) orderBook.value.bids.delete(price)
			else orderBook.value.bids.set(price, { px: price, sz: size, total: 0, ratio: 0 })
		})
		point.value = 1 / 10 ** point.value

		totalAsks.value = 0
		totalBids.value = 0
		// 倒序排列
		let ask = Array.from(orderBook.value.asks.values()).sort((a, b) => b.px - a.px)//.filter(item=>item.px<parseFloat(ticker.value?.last))
		for (let index = 0; index < ask.length; index++) {
			const item = ask[index]
			item.total = totalAsks.value += item.sz
		}
		asks.value = ask.slice(0,9)

		// 倒序排列
		let bid = Array.from(orderBook.value.bids.values()).sort((a, b) => b.px - a.px)//.filter(item=>item.px>parseFloat(ticker.value?.last))
		for (let index = bid.length - 1; index >= 0; index--) {
			const item = bid[index]
			item.total = totalBids.value += item.sz
		}
		bids.value = bid.reverse().slice(0,9).reverse()
	}
	// bid/ask
	const calculateBuySellRatio = computed(() => {
		const totalBids = Array.from(orderBook.value.bids.values()).reduce((sum, entry) => sum + entry.sz, 0)
		const totalAsks = Array.from(orderBook.value.asks.values()).reduce((sum, entry) => sum + entry.sz, 0)
		return (totalAsks / (totalBids + totalAsks)) * 100
	})

	onMounted(() => {
		setTimeout(() => {
			getBooksFull()
		}, 0)
	})
	onUnmounted(() => {
		$ws.unsubscribe(subHandle)
		$ws.removeTickerHandler(props.symbol, tickerHandler)
	})
</script>
<template>
	<div class="w-full h-full">
		<div class="flex items-center justify-between mb-2">
			<h3 class="text-sm mb-1 flex items-center">
				<b class="text-base">订单表</b>
			</h3>
			<el-radio-group v-model="pointLevel" :disabled="disabled">
				<el-radio-button :value="item" v-for="item in pointLevelOptions">{{ item }}</el-radio-button>
			</el-radio-group>
		</div>
		<el-result icon="error" title="错误提示" :sub-title="error" v-if="!loading && error">
			<template #extra>
				<el-button @click.stop="getBooksFull()">点击刷新</el-button>
			</template>
		</el-result>
		<el-skeleton :rows="3" animated v-if="loading && !error" class="py-2" />
		<template v-else-if="!error">
			<ul class="w-full h-full *:w-full flex flex-col *:grid *:grid-cols-3 *:my-[1px] *:py-[3px] *:items-center *:justify-between *:relative">
				<li class="text-grey">
					<div>价格(USDT)</div>
					<div class="text-right">数量(BTC)</div>
					<div class="text-right">合计(BTC)</div>
				</li>
				<li v-for="(item, index) in bids">
					<div class="text-red">{{ formatPrice(item.px, symbolObj?.tickSz) }}</div>
					<div class="text-right">{{ formatPrice(item.sz, point) }}</div>
					<div class="text-right">{{ formatPrice(item.total, point) }}</div>
					<div class="absolute top-0 right-0 h-full bg-red/20 transition-all transition-100 ease-in-out" :style="{ width: (item.total / (totalBids + totalAsks)) * 100 + '%' }"></div>
				</li>

				<li class="">
					<div class="col-span-3 w-full h-5 flex justify-between text-xs text-white rounded-sm">
						<div
							class="bg-green/50 flex justify-start items-center"
							:style="{ width: 'calc(' + calculateBuySellRatio + '% + 5px)', transition: 'all 0.3s', 'clip-path': 'polygon(0px 0px, 0 100%, calc(100% - 5px) 100%, 100% 0%)' }"
						>
							<b class="px-2">B</b><span>{{ calculateBuySellRatio.toFixed(2) }}%</span>
						</div>
						<div
							class="bg-red/50 flex justify-end items-center"
							:style="{ width: 'calc(' + (100 - calculateBuySellRatio) + '% + 5px)', transition: 'all 0.3s', 'clip-path': 'polygon(5px 0px, 0px 100%, 100% 100%, 100% 0%)' }"
						>
							<span>{{ (100 - calculateBuySellRatio).toFixed(2) }}%</span><b class="px-2">S</b>
						</div>
					</div>
				</li>

				<li v-for="(item, index) in asks">
					<div class="text-green">{{ formatPrice(item.px, symbolObj?.tickSz) }}</div>
					<div class="text-right">{{ formatPrice(item.sz, point) }}</div>
					<div class="text-right">{{ formatPrice(item.total, point) }}</div>
					<div class="absolute top-0 right-0 h-full bg-green/20 transition-all transition-100 ease-in-out" :style="{ width: (item.total / (totalBids + totalAsks)) * 100 + '%' }"></div>
				</li>
			</ul>
		</template>
	</div>
</template>
