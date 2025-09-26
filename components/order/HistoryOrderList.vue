<script setup lang="ts">
	import { FetchResultDto } from '~/fetch/dtos/common.dto'
	import { OrderState, type OrderDto, OrderType } from '~/fetch/dtos/order.dto'
	import { MarketType } from '~/fetch/dtos/symbol.dto'
	import { MarginMode, Sides } from '~/fetch/okx/okx.type.d'
	import { orderFetch } from '~/fetch/order.fetch'
	import { useAccountStore } from '~/store/account'
	import { useOrderStore } from '~/store/order'
	import { useSymbolStore } from '~/store/symbol'
	import { useUserStore } from '~/store/user'
	import LoginIndex from '~/pages/login/index.vue'
	import ExchangeIndex from '~/pages/exchange/index.vue'
	import { usePush, usePushUp } from '~/composable/usePush'
	import { useStore } from '~/store'
	import type { DownLoadingInstance, UpLoadingInstance } from '~/types/types'
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
	const loading = ref(false)
	const error = ref('')
	const loadingCancel = ref<Record<string, boolean>>({})
	const page = ref(1)
	const pageSize = ref(30)

	const orders = ref<OrderDto[]>([])

	watch(
		() => useAccountStore().currentAccount,
		() => {
			getOrders()
		}
	)

	const getOrders = (downInstance?: DownLoadingInstance) => {
		if (loading.value) return
		if (!useUserStore().user || !useAccountStore().currentAccount?.accountId) {
			error.value = ''
			loading.value = false
			return
		}
		if (orders.value?.length && page.value == 1 && !downInstance) {
			error.value = ''
			loading.value = false
			return
		}
		if (page.value == 1 && !downInstance) loading.value = true
		error.value = ''
		orderFetch
			.historyList(useAccountStore().currentAccount?.accountId, OrderState.ALL, page.value, pageSize.value)
			.then(result => {
				downInstance?.success()
				loading.value = false
				if (result?.code == FetchResultDto.OK) {
					if (page.value <= 1) {
						orders.value = result.data?.list || []
					} else {
						orders.value = orders.value.concat(result.data?.list || [])
					}
					// 没有
					if (result.data?.total) {
						const totalPages = Math.ceil(result.data?.total / result.data?.pageSize)
						if (page.value < totalPages) {
							upLoading.value = upLoadingHandle
							page.value += 1
						} else {
							upLoading.value = upLoadingHandle
							downInstance?.theend(t('到底了'))
						}
					}
				} else {
					error.value = result?.msg
				}
			})
			.catch(err => {
				downInstance?.error()
				loading.value = false
				error.value = t('网络异常，请稍后再试')
			})
	}

	function cancelStart(order: OrderDto) {
		if (loadingCancel.value[order.orderId]) return
		let sideStr = t('买入')
		if (useSymbolStore().getSymbol(order.symbol).marketType == MarketType.SPOT) {
			sideStr = order.side == Sides.BUY ? t('买入') : t('卖出')
		}
		if (useSymbolStore().getSymbol(order.symbol).marketType == MarketType.SWAP) {
			sideStr = order.side == Sides.BUY ? t('做多') : t('做空')
		}
		const lotSize = formatNumber(parseFloat(order.lotSize), useSymbolStore().getSymbol(order.symbol).lotSz)
		ElMessageBox.confirm(t('确认撤单', { side: sideStr, symbol: order.symbol, lotSize: lotSize }), {
			title: t('提示'),
			center: true
		})
			.then(() => {
				cancelNext(order)
			})
			.catch(() => {})
	}

	function cancelNext(order: OrderDto) {
		if (loadingCancel.value[order.orderId]) return
		loadingCancel.value[order.orderId] = true
		orderFetch
			.cancel(order.orderId, useAccountStore().currentAccount?.accountId)
			.then(result => {
				loadingCancel.value[order.orderId] = true
				if (result?.code == FetchResultDto.OK) {
					ElMessage.success(t('撤单申请提交成功'))
					order.state = OrderState.PENDING_CANCEL
					useOrderStore().updateOrder(order)
				} else {
					ElMessage.error(result?.msg)
				}
			})
			.catch(err => {
				loadingCancel.value[order.orderId] = true
				ElMessage.error(t('网络异常，请稍后再试'))
			})
	}

	function pushLogin() {
		if (!useUserStore().user) {
			if (useStore().isH5) {
				pushUp(LoginIndex,{},'100%')
				return
			} else {
				useNuxtApp().$dialog(LoginIndex, {}, '600px', '560px')
				return
			}
		}
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

	function update() {
		getOrders()
	}
	function leave() {}

	const downLoading = (downInstance: DownLoadingInstance) => {
		//console.log('下拉刷新开设,,,,,', downInstance)
		page.value = 1
		getOrders(downInstance)
	}
	const upLoading = ref()
	const upLoadingHandle = (upInstance: UpLoadingInstance) => {
		//console.log('下拉刷新开设,,,,,', upInstance)
		getOrders(upInstance)
	}

	onMounted(() => {})

	// 暴露给父组件的方法
	defineExpose({ update, leave })
</script>

<template>
	<div class="px-4 h-full w-full" :style="{ minHeight: contentHeight ? contentHeight + 'px' : 'auto', height: contentHeight ? contentHeight + 'px' : 'auto' }">
		<Empty :content="t('暂无委托')" v-if="!loading && !error && !orders?.length">
			<el-button @click.stop="pushLogin" v-if="!useUserStore().user" class="min-w-[150px]">{{ t('登录') }}</el-button>
			<el-button @click.stop="pushOpenAccount" v-else-if="!useAccountStore().currentAccount?.accountId" class="min-w-[150px]">{{ t('开设账户') }}</el-button>
		</Empty>
		<Error :content="error" v-if="!loading && error">
			<template #default>
				<el-button @click.stop="getOrders()">{{ t('重新加载') }}</el-button>
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
		<ScrollBar
			:downLoading="downLoading"
			:upLoading="upLoading"
			class="w-full"
			:noScroll="!contentHeight"
			:style="{ height: contentHeight ? contentHeight + 'px' : 'auto' }"
			ref="scrollbar"
			v-if="!loading && !error && orders?.length"
		>
			<ul v-if="!loading && !error && orders?.length">
				<template v-for="item in orders" :key="item.orderId">
					<li class="border-b border-[--transparent05] py-3">
						<div class="flex justify-between">
							<div class="flex items-center">
								<button class="tag-green-large mr-2" v-if="useSymbolStore().getSymbol(item.symbol).marketType == MarketType.SWAP && item.side == Sides.BUY">{{ t('开多') }}</button>
								<button class="tag-red-large mr-2" v-if="useSymbolStore().getSymbol(item.symbol).marketType == MarketType.SWAP && item.side == Sides.SELL">{{ t('开空') }}</button>
								<button class="tag-green-large mr-2" v-if="useSymbolStore().getSymbol(item.symbol).marketType == MarketType.SPOT && item.side == Sides.BUY">{{ t('买入') }}</button>
								<button class="tag-red-large mr-2" v-if="useSymbolStore().getSymbol(item.symbol).marketType == MarketType.SPOT && item.side == Sides.SELL">{{ t('卖出') }}</button>
								<SymbolName :symbol="useSymbolStore().getSymbol(item.symbol)" class="text-base roboto-bold leading-[0]" />
							</div>
							<!-- <div class="flex justify-between items-center gap-4">
							<button class="flex items-center">
								<el-icon><Edit /></el-icon>
							</button>
						</div> -->
						</div>
						<div class="py-1 flex items-center *:mr-1">
							<button :class="[item.side == Sides.BUY ? 'tag-green' : 'tag-red']" v-if="item.orderType == OrderType.LIMIT">{{ t('限价') }}</button>
							<button :class="[item.side == Sides.BUY ? 'tag-green' : 'tag-red']" v-if="item.orderType == OrderType.MARKET">{{ t('市价') }}</button>
							<button :class="[item.side == Sides.BUY ? 'tag-green' : 'tag-green']" v-if="parseFloat(item.takeProfitPrice)">{{ t('止盈') }}</button>
							<button :class="[item.side == Sides.BUY ? 'tag-red' : 'tag-red']" v-if="parseFloat(item.stopLossPrice)">{{ t('止损') }}</button>
							<button class="tag-default" v-if="item.marginMode == MarginMode.Isolated && item.marketType == MarketType.SWAP">{{ t('逐仓') }}</button>
							<button class="tag-default" v-if="item.marginMode == MarginMode.Cross && item.marketType == MarketType.SWAP">{{ t('全仓') }}</button>
							<button class="tag-default">{{ parseInt(item.leverage) }}x</button>
							<span class="text-xs text-grey leading-normal">{{ formatDate(new Date(item.createdAt).getTime(), 'MM/DD HH:mm:ss') }}</span>
						</div>
						<div class="grid grid-cols-3 justify-between items-center text-xs py-3 [&_b]:text-sm [&_span]:text-grey [&_span]:pb-1 [&_b]:pb-2">
							<div class="flex flex-col">
								<span>{{ t('委托数量') }}</span>
								<b>{{ formatNumber(parseFloat(item.lotSize), useSymbolStore().getSymbol(item.symbol).lotSz) }}</b>
							</div>
							<div class="flex flex-col justify-center items-center">
								<span>{{ t('已成数量') }}</span>
								<b>{{ formatNumber(item.matchSize, useSymbolStore().getSymbol(item.symbol).lotSz) }}</b>
							</div>
							<div class="flex flex-col justify-center items-end">
								<span>{{ t('成交均价') }}</span>
								<b>{{ formatNumber(item.matchPrice, useSymbolStore().getSymbol(item.symbol).lotSz) }}</b>
							</div>

							<template v-if="parseFloat(item.takeProfitPrice) && parseFloat(item.stopLossPrice)">
								<div class="flex flex-col">
									<span>{{ t('止盈') }}</span>
									<b v-if="parseFloat(item.takeProfitPrice)">{{ formatPrice(item.takeProfitPrice, useSymbolStore().getSymbol(item.symbol).tickSz) }}</b>
									<b v-else> - </b>
								</div>
								<div class="flex flex-col items-center">
									<span>{{ t('止损') }}</span>
									<b v-if="parseFloat(item.stopLossPrice)">{{ formatPrice(item.stopLossPrice, useSymbolStore().getSymbol(item.symbol).tickSz) }}</b>
									<b v-else> - </b>
								</div>
							</template>
							<template v-else>
								<div class="flex flex-col" v-if="parseFloat(item.takeProfitPrice)">
									<span>{{ t('止盈') }}</span>
									<b v-if="parseFloat(item.takeProfitPrice)">{{ formatPrice(item.takeProfitPrice, useSymbolStore().getSymbol(item.symbol).tickSz) }}</b>
									<b v-else> - </b>
								</div>
								<div class="flex flex-col" v-if="parseFloat(item.stopLossPrice)">
									<span>{{ t('止损') }}</span>
									<b v-if="parseFloat(item.stopLossPrice)">{{ formatPrice(item.stopLossPrice, useSymbolStore().getSymbol(item.symbol).tickSz) }}</b>
									<b v-else> - </b>
								</div>
							</template>
						</div>
						<div class="flex items-center gap-2 justify-between *:flex-1" v-if="item.state == OrderState.LIVE || item.state == OrderState.PENDING_CANCEL">
							<button class="bt-default" @click="cancelStart(item)" v-if="item.state != OrderState.PENDING_CANCEL">
								{{ t('撤单') }}
								<Loading class="mx-2" size="14px" v-if="loadingCancel[item.orderId]" />
							</button>
							<button class="bt-default !text-grey" v-else>{{ t('撤单中') }}</button>
						</div>
					</li>
				</template>
			</ul>
		</ScrollBar>
	</div>
</template>
