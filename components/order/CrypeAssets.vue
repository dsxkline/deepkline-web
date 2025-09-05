<script setup lang="ts">
	import { useWillAppear } from '~/composable/usePush'
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
	import TakeProfitAndStopLoss from '../trade/TakeProfitAndStopLoss.vue'
	import SimpleBuySell from '../trade/SimpleBuySell.vue'
	import { useUserStore } from '~/store/user'
	import LoginIndex from '~/pages/login/index.vue'
	import ExchangeIndex from '~/pages/exchange/index.vue'
	import { usePush, usePushUp } from '~/composable/usePush'
	import SymbolDetail from '../symbol/SymbolDetail.vue'
	const props = defineProps<{
		height: number
	}>()
	const contentHeight = computed(() => {
		// 获取当前组件的高度
		return props.height
	})
	const pushUp = usePushUp()
	const pushLeft = usePush()
	const loading = ref(true)
	const error = ref('')
	const assets = computed(() => useOrderStore().assets)
	const popProfitLoss = ref([])
	watch(
		() => useAccountStore().currentAccount,
		() => {
			getAssets()
		}
	)

	const getAssets = () => {
		if (!useUserStore().user || !useAccountStore().currentAccount?.accountId) {
			error.value = ''
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

	const configmProfitLoss = (position: PositionDto) => (takeProfitPrice: number, stopLossPrice: number) => {
		console.log('configmProfitLoss', takeProfitPrice, stopLossPrice)
		popProfitLoss.value.forEach(item => (item as any).hide())
	}
	const pushStopProfitLoss = (position: PositionDto) => {
		pushUp(
			TakeProfitAndStopLoss,
			{
				symbol: position.symbol,
				initPrice: parseFloat(position.costPrice || '0'),
				takeProfitPrice: parseFloat(position.takeProfitPrice || '0'),
				stopLossPrice: parseFloat(position.stopLossPrice || '0'),
				lotSize: position.lotAvailable,
				position: position,
				onClose: configmProfitLoss(position)
			},
			'90%'
		)
	}

	const closeSimpleBuySell = (position: PositionDto) => () => {
		console.log('closeSimpleBuySell')
		popProfitLoss.value.forEach(item => (item as any).hide())
	}
	const pushSimpleBuySell = (position: PositionDto) => {
		console.log('pushSimpleBuySell', position.lastPrice)
		pushUp(
			SimpleBuySell,
			{
				symbol: position.symbol,
				price: parseFloat(position.lastPrice)
			},
			'90%'
		)
	}

	function pushLogin() {
		if (!useUserStore().user) {
			if (useStore().isH5) {
				pushUp(LoginIndex)
				return
			} else {
				useNuxtApp().$dialog(LoginIndex, {}, '600px', '560px')
				return
			}
		}
	}

	function pushKline(position: PositionDto) {
		pushLeft(SymbolDetail, {
			symbol: position.symbol
		})
	}

	function pushOpenAccount() {
		if (!useAccountStore().accounts?.length) {
			if (useStore().isH5) {
				pushLeft(ExchangeIndex)
				return
			} else {
				useNuxtApp().$dialog(ExchangeIndex, {}, '800px', '500px', '开设账户')
				return
			}
		}
	}

	onMounted(() => {})

	// 暴露给父组件的方法
	defineExpose({ update, leave })
</script>

<template>
	<div
		class="px-4"
		:style="{
			minHeight: useStore().isH5
				? 'calc(var(--body-height) - var(--nav-height) - var(--menu-height) - var(--tabbar-height) - var(--safe-bottom) - var(--app-status-bar-height))'
				: 'calc(var(--body-height) - var(--header-height) - var(--tabbar-height) - var(--tabbar-height) - var(--status-bar-height) - var(--app-status-bar-height))'
		}"
	>
		<Empty :content="'暂无资产'" v-if="!loading && !error && !assets?.length" class="pt-20">
			<el-button @click.stop="pushLogin" v-if="!useUserStore().user" class="min-w-[150px]">登录</el-button>
			<el-button @click.stop="pushOpenAccount" v-else-if="!useAccountStore().currentAccount?.accountId" class="min-w-[150px]">开设账户</el-button>
		</Empty>
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
		<ScrollBar class="w-full" :noScroll="!contentHeight" :style="{ height: contentHeight ? contentHeight + 'px' : 'auto' }" ref="scrollbar" v-if="!loading && !error && assets?.length">
			<ul v-if="!loading && !error && assets?.length">
				<template v-for="item in assets" :key="item.orderId">
					<li class="border-b border-[--transparent05] py-3">
						<div class="flex justify-between">
							<div class="flex items-center">
								<SymbolName :symbol="useSymbolStore().getSymbol(item.symbol)" onlyCoin class="text-base roboto-bold leading-[0]" size="25px" />
							</div>
							<div class="flex justify-between items-center gap-4">
								<button class="flex items-center" @click="pushKline(item)">
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
								<b>{{ formatNumber(parseFloat(item.lotSize || '0'), useSymbolStore().getSymbol(item.symbol).lotSz) }}</b>
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
								<b v-if="item.lotBalance">{{ formatNumber(parseFloat(item.lotBalance || '0'), useSymbolStore().getSymbol(item.symbol).lotSz) }}</b>
								<b v-else>-</b>
							</div>

							<div class="flex flex-col items-center">
								<span>可用</span>
								<b v-if="item.lotBalance">{{ formatNumber(parseFloat(item.lotAvailable || '0'), useSymbolStore().getSymbol(item.symbol).lotSz) }}</b>
								<b v-else>-</b>
							</div>
						</div>
						<div class="flex items-center gap-2 justify-between *:flex-1" v-if="!useStore().isH5">
							<el-popover placement="left" trigger="click" ref="popProfitLoss" :hide-after="0" width="300">
								<template #reference>
									<button class="bt-default">止盈止盈</button>
								</template>
								<TakeProfitAndStopLoss
									:symbol="item.symbol"
									:lotSize="item.lotAvailable"
									:position="item"
									:takeProfitPrice="parseFloat(item.takeProfitPrice || '0')"
									:stopLossPrice="parseFloat(item.stopLossPrice || '0')"
									:initPrice="parseFloat(item.costPrice || '0')"
									@close="configmProfitLoss(item)"
									v-if="!loading"
								/>
							</el-popover>

							<button class="bt-default" v-if="item.marketType == MarketType.SWAP">市价全平</button>
							<button class="bt-default" v-if="item.marketType == MarketType.SWAP">平仓</button>

							<el-popover placement="left" trigger="click" ref="popProfitLoss" :hide-after="0" width="300" v-if="item.marketType == MarketType.SPOT">
								<template #reference>
									<button class="bt-default" v-if="item.marketType == MarketType.SPOT">买卖</button>
								</template>
								<SimpleBuySell :symbol="item.symbol" v-if="!loading" :price="parseFloat(item.lastPrice)" :close="closeSimpleBuySell(item)" />
							</el-popover>
						</div>
						<div class="flex items-center gap-2 justify-between *:flex-1" v-else>
							<button class="bt-default" @click="pushStopProfitLoss(item)">止盈止损</button>
							<button class="bt-default" v-if="item.marketType == MarketType.SWAP">市价全平</button>
							<button class="bt-default" v-if="item.marketType == MarketType.SWAP">平仓</button>
							<button class="bt-default" v-if="item.marketType == MarketType.SPOT" @click="pushSimpleBuySell(item)">买卖</button>
						</div>
					</li>
				</template>
			</ul>
		</ScrollBar>
	</div>
</template>
