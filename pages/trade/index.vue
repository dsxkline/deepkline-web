<script lang="ts" setup>
	import { usePushUp, useRefreshChildEvent, useWillAppear, useWillDisappear } from '~/composable/usePush'
	import { useStore } from '~/store'
	import { useSymbolStore } from '~/store/symbol'
	import SymbolSearch from '~/components/symbol/SymbolSearch.vue'
	import { InstanceType, type Instruments, type Ticker } from '~/fetch/okx/okx.type.d'
	import BooksFull from '~/components/symbol/BooksFull.vue'
	import CrypeOrder from '~/components/order/CrypeOrder.vue'
	const symbol = ref('BTC-USDT')
	const showKline = ref(false)
	const item = ref<Ticker | null>(null)
	const change = ref<number>(0)
	const rate = ref<number>(0)
	const symbolObj = computed(() => {
		return useSymbolStore().symbols[symbol.value]
	})

	const push = usePushUp()
	function pushSearch() {
		// console.log('usePushUp')
		push(
			SymbolSearch,
			{
				selectHandle: (item: Instruments) => {
					if (item?.instId) {
						// 切换当前symbol
						symbol.value = item.instId
						useNuxtApp().$pop()
					}
				}
			},
			'80%'
		)
	}
	watch(
		() => symbol.value,
		(val, old) => {
			$ws.removeTickerHandler(old, tickerHandler)
			$ws.addTickerHandler(val, tickerHandler)
			item.value = null
			nextTick(() => {
				tickerHandler($ws?.getTickers(symbol.value) || {})
			})
		}
	)
	const { $wsb, $ws } = useNuxtApp()
	const tickerHandler = (data: Ticker) => {
		// console.log('symbol', symbol, '行情tick', item.value);
		// 涨跌额
		change.value = parseFloat(data?.last || '0') - parseFloat(data?.sodUtc8 || '0')
		// 涨跌幅
		rate.value = (change.value / parseFloat(data?.sodUtc8 || '0')) * 100
		item.value = data
	}

	let subHandle = ''

	function subSymbols() {
		// h5 spa模式
		if (!useStore().isH5) return
		const { $wsb, $ws } = useNuxtApp()

		subHandle = $ws.subTickers([symbol.value], (message, error) => {
			if (useStore().isLeave) return
			// console.log("subTickers", message.data, error);
			if (message.data)
				message.data.forEach(item => {
					// console.log('subitem',item.instId,item)
					// 同步到store
					// useSymbolStore().setTickets(item.instId, item)
					$ws.setTickers(item.instId, item)

					// bgFlicker(item)
				})
		})
	}

	function unSubSymbols() {
		const { $wsb, $ws } = useNuxtApp()
		if (subHandle) {
			$ws.unsubscribe(subHandle)
		}
	}

	onMounted(() => {
		console.log('trade-index onMounted....')
		$ws.addTickerHandler(symbol.value, tickerHandler)
		tickerHandler($ws.getTickers(symbol.value))
	})

	useWillDisappear(() => {
		console.log('trade-index useWillDisappear....')
		unSubSymbols()
	})
	useWillAppear(() => {
		console.log('trade-index useWillAppear....')
		subSymbols()
	})

	onBeforeUnmount(() => {
		unSubSymbols()
		$ws.removeTickerHandler(symbol.value, tickerHandler)
		item.value = null
	})

	defineExpose({
		...useRefreshChildEvent()
	})
</script>
<template>
	<div class="w-full h-full">
		<NavigationBar title="" :hideBack="true">
			<template #left>
				<div class="px-4 flex items-center">
					<b class="text-xl flex items-center leading-[normal] font-extrabold roboto-bold h-full" @click="pushSearch"
						>{{ getSymbolName(symbolObj) }} {{ symbolObj?.instType == InstanceType.SWAP ? '永续' : '' }}</b
					>
					<button class="flex items-center pl-2 h-full" @click="pushSearch">
						<el-icon><CaretBottom /></el-icon>
					</button>
				</div>
			</template>
			<template #right>
				<div class="flex px-2">
					<button class="px-2 h-full text-main" @click="showKline = !showKline"><KlineIcon class="w-5 h-5" /></button>
					<button class="px-2 h-full">
						<el-icon><MoreFilled /></el-icon>
					</button>
				</div>
			</template>
		</NavigationBar>
		<ScrollBar class="w-full h-full" :wrap-style="{ height: 'calc(var(--body-height) - var(--nav-height) - var(--menu-height) - var(--safe-bottom))' }" :always="false">
			<div :style="{ minHeight: 'calc(var(--body-height) - var(--nav-height)  - var(--menu-height) - var(--safe-bottom) + 1px)' }">
				<div class="h-[200px] mb-4" v-if="showKline">
					<KlineChart :symbol="symbol" :sides="['MACD']" />
				</div>
				<div class="w-full flex">
					<div class="w-3/5">
						<TradeOrder :symbol="symbol" :isH5="true" />
					</div>
					<div class="w-2/5 pr-4">
						<BooksFull :symbol="symbol" :limitPoint="5" class="text-[10px]" :isH5="true" :limitCount="10" />
					</div>
				</div>
				<div class="pt-6">
					<CrypeOrder />
				</div>
			</div>
		</ScrollBar>
	</div>
</template>
