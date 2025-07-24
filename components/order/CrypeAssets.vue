<script setup lang="ts">
	import { usePushUp, useWillAppear } from '~/composable/usePush'
	import { FetchResultDto } from '~/fetch/dtos/common.dto'
	import { OrderState, type OrderDto } from '~/fetch/dtos/order.dto'
	import { MarketType } from '~/fetch/dtos/symbol.dto'
	import { MarginMode, OrderType, Sides } from '~/fetch/okx/okx.type.d'
	import { orderFetch } from '~/fetch/order.fetch'
	import { useAccountStore } from '~/store/account'
	import { useOrderStore } from '~/store/order'
	import { useSymbolStore } from '~/store/symbol'
	import { useStore } from '~/store/index'
	import type { PositionDto } from '~/fetch/dtos/position.dto'
	import StopProfitLoss from '~/components/trade/StopProfitLoss.vue'
	const pushUp = usePushUp()
	const loading = ref(true)
	const error = ref('')
	const assets = computed(() => useOrderStore().assets)

	watch(
		() => useAccountStore().currentAccount,
		() => {
			getAssets()
		}
	)

	const getAssets = () => {
		if (!useAccountStore().currentAccount?.accountId) {
			loading.value = false
			return
		}
		if (assets.value?.length) {
			loading.value = false
			return
		}
		loading.value = true
		error.value = ''
		orderFetch
			.crypeAssets(useAccountStore().currentAccount?.accountId)
			.then(result => {
				loading.value = false
				if (result?.code == FetchResultDto.OK) {
					result.data?.forEach(item => useOrderStore().addPosition(item))
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
		getAssets()
	}
	function leave() {}

	useWillAppear(() => {
		getAssets()
	})

	const confirmProfit = (position: PositionDto) => (price: number, point: number, open: boolean, changeRate: number) => {}
	const confirmLoss = (position: PositionDto) => (price: number, point: number, open: boolean, changeRate: number) => {}
	const pushStopProfitLoss = (position: PositionDto, type: number) => {
		pushUp(
			StopProfitLoss,
			{
				type: type,
				symbol: position.symbol,
				initPrice: parseFloat(position.costPrice || '0'),
				price: type == 0 ? parseFloat(position.takeProfitPrice || '0') : parseFloat(position.stopLossPrice || '0'),
				lotSize: position.lotBalance,
				positionId: position.positionId,
				onClose: type == 0 ? confirmProfit(position) : confirmLoss(position)
			},
			'90%'
		)
	}
	onMounted(() => {})

	// 暴露给父组件的方法
	defineExpose({ update, leave })
</script>

<template>
	<div class="px-4 min-h-80">
		<Empty :content="'暂无委托'" v-if="!loading && !error && !assets?.length" class="pt-20"> </Empty>
		<Error :content="error" v-if="!loading && error" class="pt-20">
			<template #default>
				<el-button @click.stop="getAssets">点击刷新</el-button>
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
				<div class="grid grid-cols-2 justify-between items-center text-xs py-0 [&_b]:text-sm [&_span]:text-grey [&_span]:pb-1">
					<el-skeleton :rows="0" animated>
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
		<ul v-if="!loading && !error && assets?.length">
			<template v-for="item in assets" :key="item.orderId">
				<li class="border-b border-[--transparent05] py-3">
					<div class="flex justify-between">
						<div class="flex items-center">
							<SymbolName :symbol="useSymbolStore().getSymbol(item.symbol)" onlyCoin class="text-base roboto-bold leading-[0]" size="25px" />
						</div>
						<div class="flex justify-between items-center gap-4">
							<button class="flex items-center">
								<el-icon><KlineIcon class="w-5 h-5" /></el-icon>
							</button>
						</div>
					</div>
					<div class="grid grid-cols-2 justify-between items-center text-xs pt-1 [&_b]:text-sm [&_span]:text-grey [&_span]:pt-2 [&_span]:pb-1">
						<div class="flex flex-col">
							<span>收益额</span>
							<b v-if="item.profit && parseFloat(item.profit)" :class="[parseFloat(item.profit) > 0 ? 'text-green' : 'text-red']"
								>{{ parseFloat(item.profit) > 0 ? '+' : '' }}{{ formatNumber(parseFloat(item.profit), '2') }}</b
							>
							<b v-else>0.00</b>
						</div>

						<div class="flex flex-col justify-center items-end">
							<span>收益率</span>
							<b v-if="item.profitRate && parseFloat(item.profitRate)" :class="[parseFloat(item.profitRate) > 0 ? 'text-green' : 'text-red']"
								>{{ parseFloat(item.profitRate) > 0 ? '+' : '' }}{{ formatNumber(parseFloat(item.profitRate) * 100, '2') }}%</b
							>
							<b v-else>0.00%</b>
						</div>
					</div>
					<div class="grid grid-cols-3 justify-between items-center text-xs py-3 pt-1 [&_b]:text-sm [&_span]:text-grey [&_span]:pt-2 [&_span]:pb-1">
						<div class="flex flex-col">
							<span>币种权益</span>
							<b>{{ formatNumber(parseFloat(item.lotSize)) }}</b>
						</div>
						<div class="flex flex-col items-center">
							<span>成本价</span>
							<b v-if="item.costPrice">{{ formatPrice(item.costPrice, useSymbolStore().getSymbol(item.symbol).tickSz) }}</b>
							<b v-else>-</b>
						</div>
						<div class="flex flex-col justify-center items-end">
							<span>最新价</span>
							<b v-if="item.lastPrice">{{ formatPrice(item.lastPrice, useSymbolStore().getSymbol(item.symbol).tickSz) }}</b>
							<b v-else>-</b>
						</div>

						<div class="flex flex-col">
							<span>余额</span>
							<b v-if="item.lotBalance">{{ formatNumber(parseFloat(item.lotBalance)) }}</b>
							<b v-else>-</b>
						</div>
					</div>
					<div class="flex items-center gap-2 justify-between *:flex-1" v-if="!useStore().isH5">
						<el-popover placement="left" trigger="click" ref="popProfit" :hide-after="0" width="300">
							<template #reference>
								<button class="bt-default">止盈</button>
							</template>
							<StopProfitLoss
								:type="0"
								:symbol="item.symbol"
								:lotSize="item.lotBalance"
								:positionId="item.positionId"
								:price="parseFloat(item.takeProfitPrice || '0')"
								:initPrice="parseFloat(item.costPrice || '0')"
								@close="confirmProfit(item)"
								v-if="!loading"
							/>
						</el-popover>
						<el-popover placement="left" trigger="click" ref="popProfit" :hide-after="0" width="300">
							<template #reference>
								<button class="bt-default">止损</button>
							</template>
							<StopProfitLoss
								:type="1"
								:symbol="item.symbol"
								:lotSize="item.lotBalance"
								:positionId="item.positionId"
								:price="parseFloat(item.stopLossPrice || '0')"
								:initPrice="parseFloat(item.costPrice || '0')"
								@close="confirmLoss(item)"
								v-if="!loading"
							/>
						</el-popover>
						<button class="bt-default" v-if="item.marketType == MarketType.SWAP">市价全平</button>
						<button class="bt-default" v-if="item.marketType == MarketType.SWAP">平仓</button>
						<button class="bt-default" v-if="item.marketType == MarketType.SPOT">买卖</button>
					</div>
					<div class="flex items-center gap-2 justify-between *:flex-1" v-else>
						<button class="bt-default" @click="pushStopProfitLoss(item, 0)">止盈</button>
						<button class="bt-default" @click="pushStopProfitLoss(item, 1)">止损</button>
						<button class="bt-default" v-if="item.marketType == MarketType.SWAP">市价全平</button>
						<button class="bt-default" v-if="item.marketType == MarketType.SWAP">平仓</button>
						<button class="bt-default" v-if="item.marketType == MarketType.SPOT">买卖</button>
					</div>
				</li>
			</template>
		</ul>
	</div>
</template>
