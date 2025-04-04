<script setup lang="ts">
	import { marketFetch } from '~/fetch/market.fetch'
	import type { BookEntry, BookResponse, Books, Instruments } from '~/fetch/okx/okx.type.d'
	import { useSymbolStore } from '~/store/symbol'

	const props = defineProps<{
		symbol: string
	}>()

	const orderBook = ref<{ asks: Map<number, BookEntry>; bids: Map<number, BookEntry> }>({
		asks: new Map<number, BookEntry>(),
		bids: new Map<number, BookEntry>()
	})
	const asks = computed(() => {
		return Array.from(orderBook.value.asks.values())
			.sort((a, b) => a.px - b.px)
			.slice(0, 9)
	})
	const bids = computed(() => {
		return Array.from(orderBook.value.bids.values())
			.sort((a, b) => b.px - a.px)
			.slice(0, 9)
	})
    let totalAsks = ref(0)
	let totalBids = ref(0)
	// 小数点
	const point = ref(0)

	const loading = ref(true)
	const error = ref('')
	const symbolObj = computed(() => useSymbolStore().symbols[props.symbol])

	const { $wsb, $ws } = useNuxtApp()
	// 订阅句柄
	let subHandle = ''

	function getBooksFull() {
		loading.value = true
		error.value = ''
		marketFetch
			.booksFull(props.symbol, 400)
			.then(res => {
				loading.value = false
				if (res?.code == 0) {
					const data = res.data[0] as BookResponse
					updateOrderBook(data)
					subHandle = $ws.subBooks('books', [symbolObj.value.instId], (message, error) => {
						// console.log('subBooksL2Tbt', message.data[0])
						message.data && updateOrderBook(message.data[0])
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
			const price = parseFloat(px)
			const size = parseFloat(sz)
			if (sz.indexOf('.') >= 0) {
				const p = sz.split('.')[1].length
				if (p > point.value) point.value = Math.min(5, p)
			}
			if (size === 0) orderBook.value.asks.delete(price)
			else orderBook.value.asks.set(price, { px: price, sz: size, total: 0,ratio:0 })
		})

		updates.bids.forEach(([px, sz]) => {
			const price = parseFloat(px)
			const size = parseFloat(sz)
            if (sz.indexOf('.') >= 0) {
				const p = sz.split('.')[1].length
				if (p > point.value) point.value = Math.min(5, p)
			}
			if (size === 0) orderBook.value.bids.delete(price)
			else orderBook.value.bids.set(price, { px: price, sz: size, total: 0,ratio:0 })
		})
		point.value = 1 / 10 ** point.value

        totalAsks.value = 0;
        totalBids.value = 0

		asks.value.forEach(item => {
			item.total = totalAsks.value += item.sz
		})
		for (let index = bids.value.length - 1; index >= 0; index--) {
			const item = bids.value[index]
			item.total = totalBids.value += item.sz
		}
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
	})
</script>
<template>
	<div class="w-full h-full">
		<h3 class="text-base py-1">订单表</h3>
		<el-result icon="error" title="错误提示" :sub-title="error" v-if="!loading && error">
			<template #extra>
				<el-button type="primary" @click.stop="getBooksFull()">点击刷新</el-button>
			</template>
		</el-result>
		<el-skeleton :rows="20" animated v-if="loading && !error" class="py-2" />
		<template v-else>
			<ul class="w-full h-full *:w-full flex flex-col *:grid *:grid-cols-3 *:my-[1px] *:py-[3px] *:items-center *:justify-between *:relative *:transition-all *:transition-1000 *:ease-linear">
				<li class="text-grey">
					<div>价格(USDT)</div>
					<div class="text-right">数量(BTC)</div>
					<div class="text-right">合计(BTC)</div>
                   
				</li>
				<li v-for="(item, index) in bids">
					<div class="text-red">{{ formatPrice(item.px, symbolObj.tickSz) }}</div>
					<div class="text-right">{{ formatPrice(item.sz, point) }}</div>
					<div class="text-right">{{ formatPrice(item.total, point) }}</div>
                    <div class="absolute top-0 right-0 h-full bg-red/10" :style="{width:(item.total/(totalBids+totalAsks)*100)+'%'}"></div>
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
					<div class="text-green">{{ formatPrice(item.px, symbolObj.tickSz) }}</div>
					<div class="text-right">{{ formatPrice(item.sz, point) }}</div>
					<div class="text-right">{{ formatPrice(item.total, point) }}</div>
                    <div class="absolute top-0 right-0 h-full bg-green/10" :style="{width:(item.total/(totalBids+totalAsks)*100)+'%'}"></div>
				</li>
			</ul>
		</template>
	</div>
</template>
