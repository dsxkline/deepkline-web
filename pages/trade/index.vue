<script lang="ts" setup>
	import { usePushUp, useRefreshChildEvent, useWillAppear, useWillDisappear } from '~/composable/usePush'
	import { useStore } from '~/store'
	import { useSymbolStore } from '~/store/symbol'
	import SymbolSearch from '~/components/symbol/SymbolSearch.vue'
	import { InstanceType, Sides, type Ticker } from '~/fetch/okx/okx.type.d'
	import BooksFull from '~/components/symbol/BooksFull.vue'
	import CrypeOrder from '~/components/order/CrypeOrder.vue'
	import { MarketType, type SymbolDto } from '~/fetch/dtos/symbol.dto'
	const { t } = useI18n()
	const symbol = ref('BTC-USDT')
	const showKline = ref(false)
	const item = ref<Ticker | null>(null)
	const change = ref<number>(0)
	const rate = ref<number>(0)
	const openLarverage = ref(false)
	const loading = ref(false)
	const side = ref(Sides.BUY)
	const symbolObj = computed(() => {
		return useSymbolStore().symbols[symbol.value]
	})
	// 订单表的数量
	const booksAmount = computed(() => {
		let amount = 9
		if (openLarverage.value) {
			amount = 10
		}
		if(symbolObj.value?.marketType==MarketType.SWAP){
			amount = 12
		}
		return amount
	})

	watch(
		() => openLarverage.value,
		val => {
			loading.value = true
		},
		{ immediate: true }
	)

	const push = usePushUp()
	function pushSearch() {
		// console.log('usePushUp')
		push(
			SymbolSearch,
			{
				selectHandle: (item: SymbolDto) => {
					if (item?.symbol) {
						// 切换当前symbol
						symbol.value = item.symbol
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
			loading.value = true
			if(symbolObj.value.marketType!=MarketType.SPOT){
				// 强制打开杠杆
				openLarverage.value = true
			}
			unSubSymbols()
			$ws.removeTickerHandler(old, tickerHandler)
			$ws.addTickerHandler(val, tickerHandler)
			item.value = null
			nextTick(() => {
				tickerHandler($ws?.getTickers(symbol.value) || {})
			})
			setTimeout(() => {
				subSymbols()
			}, 600)
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
			loading.value = false
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

	watch(
		() => side.value,
		(val, old) => {
			//console.log('trade index side changed', val, old)
		}
	)

	onMounted(() => {
		//console.log('trade-index onMounted....')
		$ws.addTickerHandler(symbol.value, tickerHandler)
		tickerHandler($ws.getTickers(symbol.value))
		subSymbols()
	})

	useWillDisappear(() => {
		//console.log('trade-index useWillDisappear....')
		unSubSymbols()
	})
	useWillAppear(() => {
		//console.log('trade-index useWillAppear....')
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
		<AppStatusBar/>
		<NavigationBar title="" :hideBack="true">
			<template #left>
				<div class="px-4 flex items-center">
					<img :src="symbolObj?.icon" class="mr-1 w-6 h-6" v-if="symbolObj?.icon" />
					<b class="text-lg flex items-center leading-[normal] font-extrabold roboto-bold h-full" @click="pushSearch"
						>{{ getSymbolName(symbolObj) }} {{ symbolObj?.marketType == InstanceType.SWAP ? t('永续') : '' }}</b
					>
					<button class="flex items-center pl-2 h-full" @click="pushSearch">
						<el-icon><CaretBottom /></el-icon>
					</button>

					<span :class="'pl-2 text-xs ' + (rate >= 0 ? 'text-green' : 'text-red')" v-if="change && symbolObj"
						>{{ rate > 0 ? '+' : '' }}{{ formatPrice(change, symbolObj.tickSz, '') }} ({{ rate > 0 ? '+' : '' }}{{ rate.toFixed(2) }}%)</span
					>
					<span :class="'' + (rate >= 0 ? 'text-green' : 'text-red')" v-else>- (-%)</span>
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
		<ScrollBar class="w-full h-full" :wrap-style="{ height: 'calc(var(--body-height) - var(--nav-height) - var(--menu-height) - var(--safe-bottom) - var(--app-status-bar-height))' }" :always="false">
			<div :style="{ minHeight: 'calc(var(--body-height) - var(--nav-height)  - var(--menu-height) - var(--safe-bottom) - var(--app-status-bar-height) + 1px)' }">
				<div class="h-[250px] mb-4" v-if="showKline">
					<KlineChart :symbol="symbol" :sides="['MACD']" />
				</div>
				<div class="w-full flex" v-if="!loading">
					<div class="w-3/5">
						<TradeOrder :symbol="symbol" :isH5="true" :openLarverage="openLarverage" :side="side" @update:side="(val: Sides) => side = val" />
					</div>
					<div class="w-2/5 pr-4 flex flex-col">
						<div class="flex items-center justify-end mb-2" v-if="symbolObj.marketType==MarketType.SPOT">
							<span class="text-xs text-grey">{{ t('杠杆') }}</span>
							<el-switch
								v-model="openLarverage"
								class="ml-2"
								size="small"
								:style="`--el-switch-on-color: rgb(var(--color-${side == Sides.BUY ? 'green' : 'red'})); --el-switch-off-color: var(--transparent10)`"
							/>
						</div>
						<BooksFull :symbol="symbol" :limitPoint="'5'" class="text-[10px]" :isH5="true" :limitCount="booksAmount" v-if="!loading" />
					</div>
				</div>
				<div class="w-full flex min-h-[500px]" v-else>
					<div class="w-3/5 px-4 flex flex-col justify-between">
						<el-skeleton :rows="0" animated class="flex items-center justify-between gap-4">
							<template #template>
								<el-skeleton-item variant="p" style="width: 50%; height: 30px" />
								<el-skeleton-item variant="p" style="width: 50%; height: 30px" />
							</template>
						</el-skeleton>
						<el-skeleton :rows="0" animated class="flex items-center justify-between mt-2">
							<template #template>
								<el-skeleton-item variant="p" style="width: 30%; height: 20px" />
							</template>
						</el-skeleton>
						<el-skeleton :rows="0" animated class="flex flex-col mt-3" v-for="item of 5">
							<template #template>
								<el-skeleton-item variant="p" style="width: 30%; height: 10px" />
								<el-skeleton-item variant="p" style="width: 100%; height: 30px;margin-top: 10px;" />
							</template>
						</el-skeleton>

						<el-skeleton :rows="0" animated class="flex items-center justify-between mt-2">
							<template #template>
								<el-skeleton-item variant="p" style="width: 100%; height: 40px" />
							</template>
						</el-skeleton>
					</div>
					<div class="w-2/5 pr-4 flex flex-col justify-between">
						<el-skeleton :rows="0" animated class="flex items-center justify-between mt-1" v-for="item of 9">
							<template #template>
								<el-skeleton-item variant="p" style="width: 50%; height: 12px" />
								<el-skeleton-item variant="p" style="width: 30%; height: 12px" />
							</template>
						</el-skeleton>
						<div class="h-[30px]"></div>
						<el-skeleton :rows="0" animated class="flex items-center justify-between mt-1" v-for="item of 9">
							<template #template>
								<el-skeleton-item variant="p" style="width: 50%; height: 12px" />
								<el-skeleton-item variant="p" style="width: 30%; height: 12px" />
							</template>
						</el-skeleton>
					</div>
					
				</div>
				<div class="pt-6">
					<CrypeOrder />
				</div>
			</div>
		</ScrollBar>
	</div>
</template>
