<script setup lang="ts">
	import { useWillAppear } from '~/composable/usePush'
	import { FetchResultDto } from '~/fetch/dtos/common.dto'
	import { OrderState, type AddOrderDto, type OrderDto } from '~/fetch/dtos/order.dto'
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
	const positions = computed(() => useOrderStore().positions)
	const popProfitLoss = ref([])
	// 平仓loading
	const closeLoadings = ref<Record<string, boolean>>({})

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
		if (positions.value?.length) {
			loading.value = false
			return
		}
		loading.value = true
		error.value = ''
		orderFetch
			.positions(useAccountStore().currentAccount?.accountId)
			.then(result => {
				loading.value = false
				if (result?.code == FetchResultDto.OK) {
					result.data?.reverse().forEach(item => useOrderStore().addPosition(item))
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
		//console.log('configmProfitLoss', takeProfitPrice, stopLossPrice)
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
		if (closeLoadings.value[position.positionId]) return
		//console.log('pushSimpleBuySell', position.lastPrice)
		pushUp(
			SimpleBuySell,
			{
				symbol: position.symbol,
				price: parseFloat(position.lastPrice),
				position: position,
				action: 'close'
			},
			'90%'
		)
	}

	const closeBuyMarketPrice = (position: PositionDto) => {
		if (closeLoadings.value[position.positionId]) return
		ElMessageBox.confirm(t('将以市价全部平仓',{symbolName:getSymbolName(useSymbolStore().getSymbol(position.symbol)),leverage:parseInt(position.leverage)}), {
			title: t('提示'),
			center: true
		})
			.then(() => {
				closeOrder(position)
			})
			.catch(() => {})
	}

	const closeOrder = (position: PositionDto) => {
		if (closeLoadings.value[position.positionId]) return
		closeLoadings.value[position.positionId] = true
		const action = 'close'
		let s = position.side
		// 现货合约杠杆平仓，平多单还是平空单
		if (position && action=='close' && parseInt(position.leverage) > 0) {
			if(position.side==Sides.BUY) s=Sides.SELL
			else s=Sides.BUY
		}
		const order = {
			action,
			positionId:position.positionId,
			side: s,
			orderType: OrderType.MARKET,
			price: String('0'),
			lotSize: position.lotAvailable,
			marginMode: position.marginMode,
			margin: String('0'),
			accountId: position.accountId,
			exchange: position.exchange,
			symbol: position.symbol,
			leverage: position.leverage
		} as unknown as AddOrderDto

		orderFetch
			.add(order)
			.then(result => {
				if (result?.code == FetchResultDto.OK) {
					// 平仓下单成功
					closeLoadings.value[position.positionId] = false
				} else {
					setTimeout(() => {
						ElMessage.error(result?.msg)
						closeLoadings.value[position.positionId] = false
					}, 500)
				}
			})
			.catch(err => {
				setTimeout(() => {
					ElMessage.error(t('网络异常，请稍后再试'))
					closeLoadings.value[position.positionId] = false
				}, 500)
			})
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
							<span class="text-xs text-grey leading-normal">{{ formatDate(new Date(item.createdAt).getTime(), 'MM/DD HH:mm:ss') }}</span>
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
								<span>{{ isSpot(item.symbol) ? '仓位资产' : '持仓量' }}({{ useSymbolStore().getSymbol(item.symbol).baseCoin }})</span>
								<b>{{ formatNumber(parseFloat(item.lotSize || '0'), useSymbolStore().getSymbol(item.symbol).lotSz) }}</b>
							</div>
							<div class="flex flex-col items-center">
								<span>{{t('保证金')}}({{ useSymbolStore().getSymbol(item.symbol).quoteCoin }})</span>
								<b v-if="item.margin">{{ formatNumber(item.margin, '2') }}</b>
								<b v-else>-</b>
							</div>
							<div class="flex flex-col items-end">
								<span>{{ t('保证金水平') }}</span>
								<b v-if="item.margin">{{ formatPrice(((parseFloat(item.margin) + parseFloat(item.profit)) / (parseFloat(item.margin) / (parseFloat(item.leverage) + 1))) * 100, '2') }}%</b>
								<b v-else>-</b>
							</div>
							<div class="flex flex-col">
								<span>{{ t('开仓均价') }}</span>
								<b v-if="item.costPrice">{{ formatPrice(item.costPrice, useSymbolStore().getSymbol(item.symbol).tickSz) }}</b>
								<b v-else>-</b>
							</div>
							<div class="flex flex-col items-center">
								<span>{{ t('最新价') }}</span>
								<b v-if="item.lastPrice">{{ formatPrice(item.lastPrice, useSymbolStore().getSymbol(item.symbol).tickSz) }}</b>
								<b v-else>-</b>
							</div>
							<div class="flex flex-col items-end">
								<span>{{ t('预估强平价') }}</span>
								<b v-if="item.costPrice">
									<template v-if="item.side==Sides.BUY">
										{{ formatPrice(parseFloat(item.costPrice || '0') * (1 - 1 / parseFloat(item.leverage)), useSymbolStore().getSymbol(item.symbol).tickSz) }}
									</template>
									<template v-if="item.side==Sides.SELL">
										{{ formatPrice(parseFloat(item.costPrice || '0') * (1 + 1 / parseFloat(item.leverage)), useSymbolStore().getSymbol(item.symbol).tickSz) }}
									</template>
								</b>
								<b v-else>-</b>
							</div>
							<div class="flex flex-col" v-if="isSpot(item.symbol)">
								<span>{{t('负债')}}({{ useSymbolStore().getSymbol(item.symbol).quoteCoin }})</span>
								<b v-if="item.margin">{{ moneyFormat(parseFloat(item.margin) * parseInt(item.leverage), '', '2') }}</b>
								<b v-else>-</b>
							</div>
						</div>
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

							<button :class="['bt-default',closeLoadings[item.positionId]?'!text-grey':'']" @click="closeBuyMarketPrice(item)">{{ t('市价全平') }}</button>
							<button :class="['bt-default',closeLoadings[item.positionId]?'!text-grey':'']" @click="pushSimpleBuySell(item)">{{ t('平仓') }}</button>
						</div>
						<div class="flex items-center gap-2 justify-between *:flex-1" v-else>
							<button class="bt-default" @click="pushStopProfitLoss(item)">{{ t('止盈止损') }}</button>
							<button :class="['bt-default',closeLoadings[item.positionId]?'!text-grey':'']" @click="closeBuyMarketPrice(item)">{{ t('市价全平') }}</button>
							<button :class="['bt-default',closeLoadings[item.positionId]?'!text-grey':'']" @click="pushSimpleBuySell(item)">{{ t('平仓') }}</button>
						</div>
					</li>
				</template>
			</ul>
		</ScrollBar>
	</div>
</template>
