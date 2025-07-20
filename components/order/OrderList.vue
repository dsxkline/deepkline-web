<script setup lang="ts">
	import { FetchResultDto } from '~/fetch/dtos/common.dto'
import { OrderState } from '~/fetch/dtos/order.dto'
	import { MarketType } from '~/fetch/dtos/symbol.dto'
	import { MarginMode, OrderType, Sides } from '~/fetch/okx/okx.type.d'
	import { orderFetch } from '~/fetch/order.fetch'
	import { useAccountStore } from '~/store/account'
	import { useOrderStore } from '~/store/order'
	import { useSymbolStore } from '~/store/symbol'

	const loading = ref(true)
	const error = ref('')

	const orders = computed(() => useOrderStore().orders)

	const getOrders = () => {
		if (orders.value?.length) return
		loading.value = true
		error.value = ''
		orderFetch
			.list(useAccountStore().currentAccount?.accountId, OrderState.NEW)
			.then(result => {
				loading.value = false
				if (result?.code == FetchResultDto.OK) {
					result.data?.forEach(order => useOrderStore().addOrder(order))
				} else {
					error.value = result?.msg
				}
			})
			.catch(err => {
				loading.value = false
				error.value = '网络异常，请稍后再试'
			})
	}

	function update() {
		getOrders()
	}
	function leave() {}

	onMounted(() => {})

	// 暴露给父组件的方法
	defineExpose({ update, leave })
</script>

<template>
	<div class="px-4 min-h-[500px]">
		<Error :content="error" v-if="!loading && error" class="pt-20">
			<template #default>
				<el-button @click.stop="getOrders">点击刷新</el-button>
			</template>
		</Error>
		<ul v-if="loading && !error">
			<li class="border-b border-[--transparent05] py-3" v-for="item in 5">
				<div class="flex justify-between">
					<div class="flex items-center w-full">
						<el-skeleton :rows="0" animated>
							<template #template>
								<el-skeleton-item variant="p" style="width: 50%; height: 18px" />
							</template>
						</el-skeleton>
					</div>
					<div class="flex justify-between items-center gap-4"></div>
				</div>
				<div class="py-0 flex items-center">
					<el-skeleton :rows="0" animated class="flex items-center">
						<template #template>
							<el-skeleton-item variant="p" style="width: 30%; height: 10px" />
						</template>
					</el-skeleton>
				</div>
				<div class="grid grid-cols-3 justify-between items-center text-xs py-3 [&_b]:text-sm [&_span]:text-grey [&_span]:pb-1">
					<el-skeleton :rows="0" animated>
						<template #template>
							<el-skeleton-item variant="p" style="width: 40%; height: 10px" />
						</template>
					</el-skeleton>
					<el-skeleton :rows="0" animated class="text-center">
						<template #template>
							<el-skeleton-item variant="p" style="width: 40%; height: 10px" />
						</template>
					</el-skeleton>
					<el-skeleton :rows="0" animated class="text-right">
						<template #template>
							<el-skeleton-item variant="p" style="width: 40%; height: 10px" />
						</template>
					</el-skeleton>
				</div>
				<div class="flex items-center gap-2 justify-between *:flex-1"></div>
			</li>
		</ul>
		<ul v-if="!loading && !error && orders?.length">
			<template v-for="item in useOrderStore().orders" :key="item.orderId">
				<li class="border-b border-[--transparent05] py-3">
					<div class="flex justify-between">
						<div class="flex items-center">
							<button class="tag-green-large mr-2" v-if="useSymbolStore().getSymbol(item.symbol).marketType == MarketType.SWAP && item.side == Sides.BUY">开多</button>
							<button class="tag-red-large mr-2" v-if="useSymbolStore().getSymbol(item.symbol).marketType == MarketType.SWAP && item.side == Sides.SELL">开空</button>
							<button class="tag-green-large mr-2" v-if="useSymbolStore().getSymbol(item.symbol).marketType == MarketType.SPOT && item.side == Sides.BUY">买入</button>
							<button class="tag-red-large mr-2" v-if="useSymbolStore().getSymbol(item.symbol).marketType == MarketType.SPOT && item.side == Sides.SELL">卖出</button>
							<SymbolName :symbol="useSymbolStore().getSymbol(item.symbol)" class="text-base roboto-bold leading-[0]" />
						</div>
						<div class="flex justify-between items-center gap-4">
							<button class="flex items-center">
								<el-icon><Edit /></el-icon>
							</button>
						</div>
					</div>
					<div class="py-1 flex items-center *:mr-1">
						<button :class="[item.side == Sides.BUY ? 'tag-green' : 'tag-red']" v-if="item.orderType == OrderType.LIMIT">限价</button>
						<button :class="[item.side == Sides.BUY ? 'tag-green' : 'tag-red']" v-if="item.orderType == OrderType.MARKET">市价</button>

						<button class="tag-default" v-if="item.marginMode == MarginMode.Isolated && item.marketType == MarketType.SWAP">逐仓</button>
						<button class="tag-default" v-if="item.marginMode == MarginMode.Cross && item.marketType == MarketType.SWAP">全仓</button>
						<span class="text-xs text-grey leading-normal">{{ formatDate(new Date(item.createdAt).getTime(), 'MM/DD HH:mm:ss') }}</span>
					</div>
					<div class="grid grid-cols-3 justify-between items-center text-xs py-3 [&_b]:text-sm [&_span]:text-grey [&_span]:pb-1">
						<div class="flex flex-col">
							<span>委托数量</span>
							<b>{{ formatNumber(parseFloat(item.lotSize), useSymbolStore().getSymbol(item.symbol).lotSz) }}</b>
						</div>
						<div class="flex flex-col items-center">
							<span>已成数量</span>
							<b>{{ formatNumber(item.matchSize, useSymbolStore().getSymbol(item.symbol).lotSz) }}</b>
						</div>
						<div class="flex flex-col justify-center items-end">
							<span>委托价格</span>
							<b>{{ formatPrice(item.price, useSymbolStore().getSymbol(item.symbol).tickSz) }}</b>
						</div>

						<div class="flex flex-col">
							<span>止盈</span>
							<b v-if="parseFloat(item.takeProfitPrice)">{{ formatPrice(item.takeProfitPrice, useSymbolStore().getSymbol(item.symbol).tickSz) }}</b>
							<b v-else> - </b>
						</div>
						<div class="flex flex-col items-center">
							<span>止损</span>
							<b v-if="parseFloat(item.stopLossPrice)">{{ formatPrice(item.stopLossPrice, useSymbolStore().getSymbol(item.symbol).tickSz) }}</b>
							<b v-else> - </b>
						</div>
					</div>
					<div class="flex items-center gap-2 justify-between *:flex-1">
						<button class="bt-default">撤单</button>
					</div>
				</li>
			</template>
		</ul>
	</div>
</template>
