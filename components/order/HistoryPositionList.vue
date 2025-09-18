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
	import { PositionStatus, type PositionDto } from '~/fetch/dtos/position.dto'
	import StopProfitLoss from '~/components/trade/StopProfitLoss.vue'
	import TakeProfitAndStopLoss from '../trade/TakeProfitAndStopLoss.vue'
	import SimpleBuySell from '../trade/SimpleBuySell.vue'
	import { useUserStore } from '~/store/user'
	import LoginIndex from '~/pages/login/index.vue'
	import ExchangeIndex from '~/pages/exchange/index.vue'
	import { usePush, usePushUp } from '~/composable/usePush'
	import SymbolDetail from '../symbol/SymbolDetail.vue'
	const { t } = useI18n()
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
	const positions = ref<PositionDto[]>([])
	const popProfitLoss = ref([])
	const page = ref(1)
	const pageSize = ref(30)

	const positionStatus = {
		undefined: t('已平仓'),
		open: t('持仓中'),
		closed: t('已平仓'),
		partially_closed: t('部分平仓'),
		liquidating: t('强制平仓中'),
		liquidated: t('已爆仓'),
		frozen: t('冻结')
	}

	watch(
		() => useAccountStore().currentAccount,
		() => {
			getDatas()
		}
	)

	const getDatas = () => {
		if (!useUserStore().user || !useAccountStore().currentAccount?.accountId) {
			error.value = ''
			loading.value = false
			return
		}
		if (positions.value?.length && page.value == 1) {
			error.value = ''
			loading.value = false
			return
		}
		if (page.value == 1) loading.value = true
		error.value = ''
		orderFetch
			.historyPositions(useAccountStore().currentAccount?.accountId, page.value, pageSize.value)
			.then(result => {
				loading.value = false
				if (result?.code == FetchResultDto.OK) {
					if (page.value <= 1) {
						positions.value = result.data?.list || []
					} else {
						positions.value = positions.value.concat(result.data?.list || [])
					}
					// 没有
					if (result.data?.total) {
						const totalPages = Math.ceil(result.data?.total / result.data?.pageSize)
						if (page.value < totalPages) page.value += 1
					}
				} else {
					error.value = result?.msg
				}
			})
			.catch(err => {
				loading.value = false
				error.value = t('网络异常，请稍后再试')
			})
	}

	function update() {
		getDatas()
	}
	function leave() {}

	useWillAppear(() => {
		getDatas()
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
		//console.log('closeSimpleBuySell')
		popProfitLoss.value.forEach(item => (item as any).hide())
	}
	const pushSimpleBuySell = (position: PositionDto) => {
		//console.log('pushSimpleBuySell', position.lastPrice)
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
				useNuxtApp().$dialog(ExchangeIndex, {}, '800px', '500px', t('开设账户'))
				return
			}
		}
	}
	function isSpot(symbol: string) {
		return useSymbolStore().getSymbol(symbol).marketType == MarketType.SPOT
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
		<Empty :content="t('暂无仓位')" v-if="!loading && !error && !positions?.length" class="pt-20">
			<el-button @click.stop="pushLogin" v-if="!useUserStore().user" class="min-w-[150px]">{{ t('登录') }}</el-button>
			<el-button @click.stop="pushOpenAccount" v-else-if="!useAccountStore().currentAccount?.accountId" class="min-w-[150px]">{{ t('开设账户') }}</el-button>
		</Empty>
		<Error :content="error" v-if="!loading && error" class="pt-20">
			<template #default>
				<el-button @click.stop="getDatas">{{ t('重新加载') }}</el-button>
			</template>
		</Error>
		<ul v-if="loading && !error">
			<li class="border-b border-[--transparent05] py-3" v-for="item in pageSize">
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
		<ScrollBar class="w-full" :noScroll="!contentHeight" :style="{ height: contentHeight ? contentHeight + 'px' : 'auto' }" ref="scrollbar" v-if="!loading && !error && positions?.length">
			<ul v-if="!loading && !error && positions?.length">
				<template v-for="item in positions" :key="item.orderId">
					<li class="border-b border-[--transparent05] py-3">
						<div class="flex justify-between">
							<div class="flex items-center">
								<button class="tag-green-large mr-2" v-if="useSymbolStore().getSymbol(item.symbol).marketType == MarketType.SWAP && item.side == Sides.BUY">{{ t('开多') }}</button>
								<button class="tag-red-large mr-2" v-if="useSymbolStore().getSymbol(item.symbol).marketType == MarketType.SWAP && item.side == Sides.SELL">{{ t('开空') }}</button>
								<button class="tag-green-large mr-2" v-if="isSpot(item.symbol) && item.side == Sides.BUY">{{ t('买入') }}</button>
								<button class="tag-red-large mr-2" v-if="isSpot(item.symbol) && item.side == Sides.SELL">{{ t('卖出') }}</button>
								<SymbolName :symbol="useSymbolStore().getSymbol(item.symbol)" class="text-base roboto-bold leading-[0]" />
							</div>
							<div class="flex justify-between items-center gap-4">
								<button class="flex items-center" @click="pushKline(item)">
									<el-icon><KlineIcon class="w-5 h-5" /></el-icon>
								</button>
							</div>
						</div>
						<div class="py-1 flex items-center *:mr-1">
							<button class="tag-default" v-if="item.marginMode == MarginMode.Isolated">{{ t('逐仓') }}</button>
							<button class="tag-default" v-if="item.marginMode == MarginMode.Cross">{{ t('全仓') }}</button>
							<button class="tag-default">{{ parseInt(item.leverage) }}x</button>
							<span class="text-xs text-grey leading-normal">{{ formatDate(new Date(item.createdAt).getTime(), 'YYYY/MM/DD HH:mm:ss') }}</span>
						</div>
						<div class="grid grid-cols-2 justify-between items-center text-xs pt-1 [&_b]:text-sm [&_span]:text-grey [&_span]:pt-2 [&_span]:pb-1">
							<div class="flex flex-col">
								<span>{{ t('收益额') }}</span>
								<b v-if="item.profit && parseFloat(item.profit)" :class="[parseFloat(item.profit) > 0 ? 'text-green' : 'text-red']"
									>{{ parseFloat(item.profit) > 0 ? '+' : '' }}{{ formatNumber(parseFloat(item.profit), '2') }}</b
								>
								<b v-else>0.00</b>
							</div>

							<div class="flex flex-col justify-center items-end">
								<span>{{ t('收益率') }}</span>
								<b v-if="item.profitRate && parseFloat(item.profitRate)" :class="[parseFloat(item.profitRate) > 0 ? 'text-green' : 'text-red']"
									>{{ parseFloat(item.profitRate) > 0 ? '+' : '' }}{{ formatNumber(parseFloat(item.profitRate) * 100, '2') }}%</b
								>
								<b v-else>0.00%</b>
							</div>
						</div>
						<div class="grid grid-cols-3 justify-between items-center text-xs py-3 pt-1 [&_b]:text-sm [&_span]:text-grey [&_span]:pt-2 [&_span]:pb-1">
							<div class="flex flex-col">
								<span>{{ t('最大持仓量') }}({{ useSymbolStore().getSymbol(item.symbol).baseCoin }})</span>
								<b v-if="item.lotTotal">{{ formatNumber(parseFloat(item.lotTotal || '0'), useSymbolStore().getSymbol(item.symbol).lotSz) }}</b>
								<b v-else>-</b>
							</div>
							<div class="flex flex-col items-center">
								<span>{{t('平仓量')}}({{ useSymbolStore().getSymbol(item.symbol).baseCoin }})</span>
								<b v-if="item.lotTotal">{{ formatNumber(parseFloat(item.lotTotal || '0') - parseFloat(item.lotSize || '0'), useSymbolStore().getSymbol(item.symbol).lotSz) }}</b>
								<b v-else>-</b>
							</div>
							<div class="flex flex-col items-end">
								<span>{{ t('平仓类型') }}</span>
								<b>{{ positionStatus[item.status] }}</b>
							</div>
							<div class="flex flex-col">
								<span>{{ t('开仓均价') }}</span>
								<b v-if="item.costPrice">{{ formatPrice(item.costPrice, useSymbolStore().getSymbol(item.symbol).tickSz) }}</b>
								<b v-else>-</b>
							</div>
							<div class="flex flex-col items-center">
								<span>{{ t('平仓均价') }}</span>
								<b v-if="item.closePrice">{{ formatPrice(item.closePrice, useSymbolStore().getSymbol(item.symbol).tickSz) }}</b>
								<b v-else>-</b>
							</div>
							<div class="flex flex-col items-end">
								<span>{{ t('强平数量') }}</span>
								<b v-if="item.lotForce">{{ formatNumber(parseFloat(item.lotForce || '0'), useSymbolStore().getSymbol(item.symbol).lotSz) }}</b>
								<b v-else>-</b>
							</div>
							<div class="flex flex-col col-span-3">
								<span>{{ t('平仓时间') }}</span>
								<b v-if="item.margin">{{ formatDate(new Date(item.updatedAt).getTime(), 'YYYY/MM/DD HH:mm:ss') }}</b>
								<b v-else>-</b>
							</div>
						</div>
						<template v-if="item.status == PositionStatus.OPEN">
							<div class="flex items-center gap-2 justify-between *:flex-1" v-if="!useStore().isH5">
								<el-popover placement="left" trigger="click" ref="popProfitLoss" :hide-after="0" width="300">
									<template #reference>
										<button class="bt-default">{{ t('止盈止盈') }}</button>
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

								<button class="bt-default" v-if="item.marketType == MarketType.SWAP">{{ t('市价全平') }}</button>
								<button class="bt-default" v-if="item.marketType == MarketType.SWAP">{{ t('平仓') }}</button>

								<el-popover placement="left" trigger="click" ref="popProfitLoss" :hide-after="0" width="300" v-if="item.marketType == MarketType.SPOT">
									<template #reference>
										<button class="bt-default" v-if="item.marketType == MarketType.SPOT">{{ t('买卖') }}</button>
									</template>
									<SimpleBuySell :symbol="item.symbol" v-if="!loading" :price="parseFloat(item.lastPrice)" :close="closeSimpleBuySell(item)" />
								</el-popover>
							</div>
							<div class="flex items-center gap-2 justify-between *:flex-1" v-else>
								<button class="bt-default" @click="pushStopProfitLoss(item)">{{ t('止盈止损') }}</button>
								<button class="bt-default" v-if="item.marketType == MarketType.SWAP">{{ t('市价全平') }}</button>
								<button class="bt-default" v-if="item.marketType == MarketType.SWAP">{{ t('平仓') }}</button>
								<button class="bt-default" v-if="item.marketType == MarketType.SPOT" @click="pushSimpleBuySell(item)">{{ t('买卖') }}</button>
							</div>
						</template>
					</li>
				</template>
			</ul>
		</ScrollBar>
	</div>
</template>
