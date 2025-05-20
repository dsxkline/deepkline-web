<script setup lang="ts">
	import { marketFetch } from '~/fetch/market.fetch'
	import type { BookEntry, BookMessage, BookResponse, Books, Instruments, Ticker, TradesMessage, TradesResponse } from '~/fetch/okx/okx.type.d'
	import { useSymbolStore } from '~/store/symbol'
	import { throttle } from 'lodash-es'
import { useStore } from '~/store';
	const props = defineProps<{
		symbol: string
	}>()

	const tradesList = ref<TradesResponse[] | null>([])
	const lastTrade = ref<TradesResponse | null>()
	// 小数点
	const point = ref(0)
	const loading = ref(true)
	const error = ref('')
	const symbolObj = computed(() => {
		return useSymbolStore().symbols[props.symbol]
	})
	const { $wsb, $ws } = useNuxtApp()
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
	const interVisible = ref(false)
	watch(
		() => pointLevel.value,
		val => {
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

			getTradeList()
		}
	)

	const updateTradeList = (message: TradesMessage) => {
		if (message.data && message.data.length > 0) {
			const data = message.data[0]
			const action = message.action
			updateOrderBook(data, action)
		}
	}

	function getTradeList() {
		if (updateTimer) clearTimeout(updateTimer)
		loading.value = true
		error.value = ''
		point.value = 0
		tradesList.value = []
		if (subHandle) $ws.unsubscribe(subHandle)
		subHandle = $ws.subTrades(symbolObj.value?.instId || props.symbol, (message, err) => {
			if (useStore().isLeave) return
			if (!interVisible.value) return
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
				console.log('trades....', res)
				if (res?.code === 0 && res?.data) {
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

	let updateTimer: NodeJS.Timeout
	function updateOrderBook(updates: TradesResponse, action?: string) {
		if (updateTimer) clearTimeout(updateTimer)
		point.value = symbolObj.value?.lotSz || 0
		pricePoint.value = symbolObj.value?.tickSz || 0
		if (tradesList.value && tradesList.value.length > 30) {
			// 删除最后的数据
			lastTrade.value = JSON.parse(JSON.stringify(tradesList.value[tradesList.value.length - 1]))
			tradesList.value.splice(tradesList.value.length - 1, 1)[0]
		}
		tradesList.value?.unshift(updates)
		animation.value = true
		updateTimer = setTimeout(() => {
			// tradesList.value?.unshift(updates)
			animation.value = false
		}, 200)
	}

	const whenBrowserActive = () => {
		console.log('浏览器重新激活')
		updateTimer && clearTimeout(updateTimer)
		$ws.unsubscribe(subHandle)
		getTradeList()
	}

	const wsError = (state: number) => {
		if (state <= -1 && !tradesList.value?.length) {
			loading.value = false
			error.value = '网络异常，连接错误'
		} else {
			error.value = ''
		}
	}

	// 滚动到显示触发
	function onObserveVisible(visible:boolean){
		interVisible.value = visible
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
		updateTimer && clearTimeout(updateTimer)
		tradesList.value = null
		lastTrade.value = null
		$ws.unsubscribe(subHandle)
		$windowEvent.removeEvent(whenBrowserActive)
		if (updateTimer) clearTimeout(updateTimer)
	})
</script>
<template>
	<div class="w-full h-full min-h-[650px] overflow-hidden">
		<div class="flex items-center justify-between mb-2">
			<h3 class="text-sm mb-1 flex items-center">
				<b>最新成交</b>
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
			<div class="w-full h-full relative" v-observe-visible.multi="onObserveVisible" >
				<div class="trade-title w-full text-grey grid grid-cols-3 my-[1px] py-[1px] items-center justify-between h-[20px] absolute top-0 left-0 z-10">
					<div>价格(USDT)</div>
					<div class="text-right">数量({{ symbolObj?.baseCcy }})</div>
					<div class="text-right">时间</div>
				</div>

				<div v-if="tradesList" class="overflow-hidden w-full text-main grid grid-cols-3 my-[1px] py-[1px] items-center justify-between h-[20px] absolute top-[20px] left-0 z-10"
				:style="{
					height: `${animation ? '20px' : '0px'}`,
					opacity:`${animation ? '1' : '0'}`,
					transition: `${animation ? 'all 0.2s' : 'none'}`,
				}">
					<template v-if="tradesList[0]">
							<div :class="tradesList[0].side == 'buy' ? 'text-red' : 'text-green'">{{ formatPrice(tradesList[0].px, pricePoint) }}</div>
							<div class="text-right">{{ moneyFormat(formatPrice(tradesList[0].sz, point), '', point) }}</div>
							<div class="text-right">{{ formatDate(parseInt(tradesList[0].ts), 'HH:mm:ss') }}</div>
						</template>
				</div>

				<ul class="relative z-20 w-full h-full *:w-full flex flex-col *:grid *:grid-cols-3 *:my-[1px] *:py-[1px] *:items-center *:justify-between *:relative *:h-[18px]" v-if="tradesList" 
				:style="{
					transform: `translateY(${animation ? '20px' : '0px'})`,
					transition: `${animation ? 'all 0.2s' : 'none'}`,
				}">
					<li v-for="(n, index) in tradesList.length" :key="index">
						<template v-if="tradesList[index]">
							<div :class="tradesList[index].side == 'buy' ? 'text-red' : 'text-green'">{{ formatPrice(tradesList[index].px, pricePoint) }}</div>
							<div class="text-right">{{ moneyFormat(formatPrice(tradesList[index].sz, point), '', point) }}</div>
							<div class="text-right">{{ formatDate(parseInt(tradesList[index].ts), 'HH:mm:ss') }}</div>
						</template>
					</li>
				</ul>
			</div>
		</template>
	</div>
</template>

<style lang="less" scoped>
.trade-title{
	position: relative;
		&::before {
			background-image: var(--bg-linear-90);
			filter: blur(60px);
			position: absolute;
			top: 0;
			left: 0;
			width: 100%;
			height: 100%;
			content: '';
			z-index: 0;
			opacity: 0.1;
		}
}
</style>