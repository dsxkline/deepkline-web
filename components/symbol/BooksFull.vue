<script setup lang="ts">
	import { marketFetch } from '~/fetch/market.fetch'
	import type { BookEntry, BookMessage, BookResponse, Books, Instruments, Ticker } from '~/fetch/okx/okx.type.d'
	import { useSymbolStore } from '~/store/symbol'
	import { throttle } from 'lodash-es'
	import { useStore } from '~/store'
	import { useWillAppear, useWillDisappear } from '~/composable/usePush'
	import { useRequestAnimation } from '~/composable/useRequestAnimation'
	import { use } from 'echarts'

	const props = defineProps<{
		symbol: string
		limitPoint?: number
		isH5?: boolean
		limitCount?: number
	}>()

	const orderBook = ref<{ asks: Map<number, BookEntry>; bids: Map<number, BookEntry> } | null>({
		asks: new Map<number, BookEntry>(),
		bids: new Map<number, BookEntry>()
	})
	const asks = ref<BookEntry[] | null>([])
	const bids = ref<BookEntry[] | null>([])
	const lastAsks = ref<BookEntry[] | null>([])
	const lastBids = ref<BookEntry[] | null>([])
	let totalAsks = ref(0)
	let totalBids = ref(0)
	// 小数点
	const point = ref(0)
	const showNumber = computed(() => props.limitCount || 16)

	const loading = ref(true)
	const error = ref('')
	const symbolObj = computed(() => {
		return useSymbolStore().symbols[props.symbol]
	})

	const { $wsb, $ws } = useNuxtApp()
	const ticker = ref<Ticker | null>($ws?.getTickers(props.symbol) || {})
	const change = ref<number>(0)
	const rate = ref<number>(0)
	const tickerHandler = (data: Ticker) => {
		if (useStore().isLeave) return
		// 涨跌额
		change.value = parseFloat(data?.last || '0') - parseFloat(data?.sodUtc8 || '0')
		// 涨跌幅
		rate.value = (change.value / parseFloat(data?.sodUtc8 || '0')) * 100
		ticker.value = data
	}
	// 订阅句柄
	let subHandle = ''
	const interVisible = ref(false)
	const interVisibleBottom = ref(false)

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
			ticker.value = $ws?.getTickers(props.symbol) || {}
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

	function getBooksFull(noloading?: boolean) {
		if (!noloading) {
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
		}

		if (subHandle) $ws.unsubscribe(subHandle)
		$ws.addTickerHandler(props.symbol, tickerHandler)
		subHandle = $ws.subBooks('books', [symbolObj.value?.instId || props.symbol], (message, err) => {
			// console.log('subBooksL2Tbt', message)
			// if(window.dsxKlineScrolling) return;
			if (useStore().isLeave) return
			// if (!interVisible.value) return
			if (message.data) updateBookList(message)
			if (asks.value?.length || bids.value?.length) {
				loading.value = false
				error.value = ''
			}
		})

		marketFetch
			.booksFull(props.symbol, 100)
			.then(res => {
				// console.log('booksfull....', res)
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
		point.value = props.limitPoint || symbolObj.value?.lotSz || 0

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
			.filter(item => ticker.value && item.px >= parseFloat(ticker.value.last))

		if (activeBook.value == 0) ask = ask.slice(0, showNumber.value)
		else ask = ask.slice(0, 2 * showNumber.value + 1)

		for (let index = ask.length - 1; index >= 0; index--) {
			const item = ask[index]
			item.total = totalAsks.value += item.sz
		}

		// 倒序排列
		let bid = Array.from(orderBook.value.bids.values())
			.sort((a, b) => b.px - a.px)
			.filter(item => ticker.value && item.px <= parseFloat(ticker.value.last))

		if (activeBook.value == 0) bid = bid.slice(0, showNumber.value)
		else bid = bid.slice(0, 2 * showNumber.value + 1)
		for (let index = 0; index < bid.length; index++) {
			const item = bid[index]
			item.total = totalBids.value += item.sz
		}

		bookAnimation(ask, bid)

		// 反过来才对
		asks.value = bid
		bids.value = ask

		trimMap(orderBook.value.asks, 500)
		trimMap(orderBook.value.bids, 500)
	}, 300)

	// 每个订单的占比动画
	function bookAnimation(asks: BookEntry[], bids: BookEntry[]) {
		if (!asks || !bids) return
		if (totalAsks.value + totalBids.value <= 0) return
		// 计算每个订单的占比
		// transform: `scaleX(${(bids[index].total / (totalBids + totalAsks)) * 100 + '%'})`
		asks.forEach((item, index) => {
			const ratio = item.sz / totalAsks.value
			// 上一次比例
			const lastRatio = (lastAsks.value && lastAsks.value[index]?.ratio) || 0
			useRequestAnimation().start({
				from: lastRatio,
				to: ratio,
				duration: 200,
				onUpdate: value => {
					// 更新dom
					item.ratio = value
				}
			})
		})
		bids.forEach((item, index) => {
			const ratio = item.sz / totalBids.value
			// 上一次比例
			const lastRatio = (lastBids.value && lastBids.value[index]?.ratio) || 0
			useRequestAnimation().start({
				from: lastRatio,
				to: ratio,
				duration: 200,
				onUpdate: value => {
					// 更新dom
					item.ratio = value
				}
			})
		})

		useRequestAnimation().start({
			from: calculateBuySellRatioValue.value,
			to: calculateBuySellRatio.value,
			duration: 200,
			onUpdate: value => {
				calculateBuySellRatioValue.value = value
			}
		})

		lastAsks.value = [...asks]
		lastBids.value = [...bids]
	}

	// bid/ask
	const calculateBuySellRatio = computed(() => {
		const totalBids = (bids.value && bids.value.reduce((sum, entry) => sum + entry.sz, 0)) || 1
		const totalAsks = (asks.value && asks.value.reduce((sum, entry) => sum + entry.sz, 0)) || 1
		return (totalAsks / (totalBids + totalAsks)) * 100
	})
	const calculateBuySellRatioValue = ref(calculateBuySellRatio.value)

	const whenBrowserActive = () => {
		// console.log('浏览器重新激活')
		updateBookList.cancel()
		throttleAskBid.cancel()
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

	// 滚动到显示触发
	function onObserveVisible(visible: boolean) {
		interVisible.value = visible
		if (props.isH5) interVisible.value = true
	}
	function onObserveVisibleBottom(visible: boolean) {
		interVisibleBottom.value = visible
		if (props.isH5) interVisibleBottom.value = true
	}

	const { $windowEvent } = useNuxtApp()
	onMounted(() => {
		console.log('booksfull onMounted....')
		$ws.onSignalState(wsError)
		$windowEvent.addEvent(whenBrowserActive)
		pointLevel.value = symbolObj.value?.tickSz
		getBooksFull()
	})
	onBeforeUnmount(() => {
		$ws.removeSignalState(wsError)
		$ws.unsubscribe(subHandle)
		$ws.removeTickerHandler(props.symbol, tickerHandler)
		$windowEvent.removeEvent(whenBrowserActive)
		throttleAskBid.cancel()
		updateBookList.cancel()
		orderBook.value = null
		asks.value = null
		bids.value = null
		ticker.value = null
	})
	useWillDisappear(() => {
		console.log('booksfull useWillDisappear....')
		updateBookList.cancel()
		throttleAskBid.cancel()
		$ws.unsubscribe(subHandle)
		$ws.removeTickerHandler(props.symbol, tickerHandler)
	})
	useWillAppear(() => {
		console.log('booksfull useWillAppear....')
		if (!loading.value) getBooksFull(true)
	})
</script>
<template>
	<div :class="['w-full h-full min-h-[400px]', isH5 ? 'books-small' : '']">
		<div class="flex items-center justify-between mb-2" v-if="!isH5">
			<h3 class="text-sm mb-1 flex items-center">
				<b class="books-title">订单表</b>
				<!-- <div class="flex items-center mx-2 *:border *:border-[var(--transparent20)] *:mx-1 *:opacity-50 *:rounded-sm">
					<button :class="['hover:opacity-80', activeBook == 0 ? '!opacity-100 !border-[var(--transparent30)]' : '']" @click="activeBook = 0" v-click-sound><BooksListIcon /></button>
					<button :class="['hover:opacity-80', activeBook == 1 ? '!opacity-100 !border-[var(--transparent30)]' : '']" @click="activeBook = 1" v-click-sound><BooksBuyListIcon /></button>
					<button :class="['hover:opacity-80', activeBook == 2 ? '!opacity-100 !border-[var(--transparent30)]' : '']" @click="activeBook = 2" v-click-sound><BooksSellListIcon /></button>
				</div> -->
			</h3>
			<!-- <el-select v-model="pointLevel" style="width: 100px;" v-if="!loading" v-click-sound>
				<el-option v-for="item in pointLevelOptions" :key="item" :label="item" :value="item"  v-click-sound/>
			</el-select> -->
		</div>
		<Error :content="error" v-if="!loading && error" class="min-h-[400px]">
			<!-- <template #default>
				<el-button @click.stop="getBooksFull()">点击刷新</el-button>
			</template> -->
		</Error>
		<el-skeleton :rows="3" animated v-if="loading && !error" class="py-2" />
		<template v-else-if="!error">
			<div v-if="isH5">
				<ul class="w-full h-full *:w-full flex flex-col *:grid *:grid-cols-2 *:my-[1px] *:py-[1.0px] *:items-center *:justify-between *:relative *:overflow-hidden">
					<li class="text-grey">
						<div>价格</div>
						<div class="text-right">数量(USDT)</div>

						<!-- <div class="text-right">合计({{ symbolObj?.baseCcy }})</div> -->
					</li>
				</ul>
			</div>
			<div class="flex gap-3 book-container">
				<ul class="w-full h-full *:w-full flex flex-col *:grid *:grid-cols-2 *:my-[1px] *:py-[1.0px] *:items-center *:justify-between *:relative *:overflow-hidden">
					<li class="text-grey !pb-1" v-observe-visible.multi="onObserveVisible">
						<div>买入(USDT)</div>
						<div class="text-right">价格</div>
						<!-- <div class="text-right">合计({{ symbolObj?.baseCcy }})</div> -->
					</li>

					<li v-for="(n, index) in activeBook == 1 ? 2 * showNumber + 2 : showNumber" v-if="(activeBook == 0 || activeBook == 1) && asks" :key="index">
						<template v-if="asks[index]">
							<div class="">{{ moneyFormat(formatPrice(asks[index].sz, point), '', point) }}</div>
							<div class="text-green text-right">{{ formatPrice(asks[index].px, pricePoint) }}</div>
							<!-- <div class="text-right">{{ moneyFormat(formatPrice(bids[index].total, point), '', point) }}</div> -->
							<div
								v-if="interVisible && interVisibleBottom"
								class="bg absolute top-0 right-0 h-full w-full bg-green/20 origin-right"
								:style="{
									transform: `scaleX(${asks[index].ratio})`
								}"
							></div>
						</template>
					</li>
				</ul>
				<div class="books-realtime justify-between items-center">
					<div class="flex flex-col items-start justify-center">
						<b :class="['text-base font-extrabold', change > 0 ? 'text-green' : 'text-red']">{{ formatPrice(ticker?.last, symbolObj.tickSz) }}</b>
						<span :class="'' + (rate >= 0 ? 'text-green' : 'text-red')" v-if="change"
							>{{ rate > 0 ? '+' : '' }}{{ formatPrice(change, symbolObj.tickSz, '') }} ({{ rate > 0 ? '+' : '' }}{{ rate.toFixed(2) }}%)</span
						>
						<span :class="'' + (rate >= 0 ? 'text-green' : 'text-red')" v-else>- (-%)</span>
					</div>
					<el-icon><ElIconArrowRight /></el-icon>
				</div>
				<ul class="w-full h-full *:w-full flex flex-col *:grid *:grid-cols-2 *:my-[1px] *:py-[1.0px] *:items-center *:justify-between *:relative *:overflow-hidden">
					<li class="text-grey !pb-1" v-observe-visible.multi="onObserveVisible">
						<div>价格</div>
						<div class="text-right">卖出({{ symbolObj?.baseCcy }})</div>
						<!-- <div class="text-right">合计({{ symbolObj?.baseCcy }})</div> -->
					</li>
					<li v-for="(n, index) in activeBook == 2 ? 2 * showNumber + 2 : showNumber" v-if="(activeBook == 0 || activeBook == 2) && bids" :key="index">
						<template v-if="bids[index]">
							<div class="text-red">{{ formatPrice(bids[index].px, pricePoint) }}</div>
							<div class="text-right">{{ moneyFormat(formatPrice(bids[index].sz, point), '', point) }}</div>
							<!-- <div class="text-right">{{ moneyFormat(formatPrice(asks[index].total, point), '', point) }}</div> -->
							<div
								v-if="interVisible"
								class="bg absolute top-0 right-0 h-full w-full bg-red/20 origin-left"
								:style="{
									transform: `scaleX(${bids[index].ratio})`
								}"
							></div>
						</template>
					</li>
				</ul>
			</div>
			<div v-observe-visible.multi="onObserveVisibleBottom" class="!flex pt-2" v-if="bids && asks && !Number.isNaN(calculateBuySellRatioValue) && activeBook == 0">
				<div class="w-full h-5 text-white rounded-sm relative overflow-hidden books-process">
					<div
						class="bg-green/50 flex justify-start items-center w-full h-full absolute left-0 top-0 origin-left"
						:style="{
							transform: `translate3d(calc(-${100 - calculateBuySellRatioValue}% + 5px),0,0)`,
							'clip-path': 'polygon(0px 0px, 0 100%, calc(100% - 5px) 100%, 100% 0%)'
						}"
					></div>
					<div
						class="bg-red/50 flex justify-end items-center w-full h-full absolute right-0 top-0 origin-right"
						:style="{
							transform: `translate3d(calc(${calculateBuySellRatioValue}% + 5px),0,0)`,
							'clip-path': 'polygon(5px 0px, 0px 100%, 100% 100%, 100% 0%)'
						}"
					></div>
					<div class="absolute left-0 top-0 h-full flex items-center">
						<b class="px-2">B</b><span>{{ calculateBuySellRatioValue.toFixed(0) }}%</span>
					</div>
					<div class="absolute right-0 top-0 h-full flex items-center">
						<span>{{ (100 - calculateBuySellRatioValue).toFixed(0) }}%</span><b class="px-2">S</b>
					</div>
				</div>
			</div>
		</template>
	</div>
</template>

<style lang="less" scoped>
	.books-realtime {
		display: none;
	}
	@media (max-width: 999px) {
		.books-small {
			display: flex;
			flex-direction: column;
			justify-content: space-between;
			.books-realtime {
				display: flex;
			}
			.book-container {
				flex-direction: column-reverse;
				ul:first-child {
					li {
						&:first-child {
							display: none;
						}
						display: flex;
						flex-direction: row-reverse;
						.bg {
							transform-origin: right;
						}
					}
				}
				ul:last-child {
					flex-direction: column-reverse;
					li:first-child {
						display: none;
					}
					li {
						.bg {
							transform-origin: right;
						}
					}
				}
			}
			.books-process {
				border-radius: 66px;
				div:first-child {
					background-color: rgb(var(--color-green) / 0.2);
				}
				div:nth-child(2) {
					background-color: rgb(var(--color-red) / 0.2);
				}
			}
		}
	}
</style>
