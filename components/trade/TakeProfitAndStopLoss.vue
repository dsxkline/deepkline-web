<script setup lang="ts">
	import { usePush, usePushUp } from '~/composable/usePush'
	import type { PositionDto } from '~/fetch/dtos/position.dto'
	import { InstanceType, Sides, type Ticker } from '~/fetch/okx/okx.type.d'
	import { useStore } from '~/store'
	import { useSymbolStore } from '~/store/symbol'
	import { useUserStore } from '~/store/user'
	import LoginIndex from '~/pages/login/index.vue'
	import ExchangeIndex from '~/pages/exchange/index.vue'
	import { useAccountStore } from '~/store/account'
	import { OrderType, type AddOrderDto } from '~/fetch/dtos/order.dto'
	import { orderFetch } from '~/fetch/order.fetch'
	import { FetchResultDto } from '~/fetch/dtos/common.dto'
	const pushUp = usePushUp()
	const pushLeft = usePush()
	const props = defineProps<{
		symbol: string
		takeProfitPrice?: number
		stopLossPrice?: number
		initPrice?: number
		push?: string
		lotSize?: string
		position?: PositionDto
	}>()
	const emit = defineEmits<{
		(event: 'close', takeProfitPrice: number, stopLossPrice: number): void
	}>()
	watch(
		() => props.takeProfitPrice,
		() => {
			if (!takeProfitPrice.value && props.takeProfitPrice) {
				initPrice.value = props.takeProfitPrice
			}
		}
	)
	const priceInput = ref()
	// 初始值
	const initPrice = ref(0)
	// 止盈价格
	const takeProfitPrice = ref(0)
	// 止损价格
	const stopLossPrice = ref(0)
	const point = computed(() => {
		let p = String(symbolObj.value?.tickSz).split('.')
		if (p.length > 1) {
			return p[1].length
		}
		return 0
	})
	// 点数
	const amount = ref(0)
	const symbolObj = computed(() => useSymbolStore().getSymbol(props.symbol))
	const takeProfitPercent = ref(0)
	const takeProfitMarks = computed(() => {
		return {
			'0': '0%',
			'25': '25%',
			'50': '50%',
			'75': '75%',
			'100': '100%'
		}
	})

	const stopLossPercent = ref(0)
	const stopLossMarks = computed(() => {
		return {
			'0': '0%',
			'-25': '-25%',
			'-50': '-50%'
		}
	})

	const lotBalance = ref(numberToFixed(props.lotSize || '0', symbolObj.value.lotSz))
	const lotBalancePercent = ref(0)
	const lotSizeMarks = computed(() => {
		return {
			'0': '0%',
			'25': '25%',
			'50': '50%',
			'75': '75%',
			'100': '100%'
		}
	})
	const tickSz = computed(() => parseFloat(symbolObj.value.tickSz))
	const submitLoading = ref(false)
	const openStopLoss = ref(true)
	const openTakeProfit = ref(true)

	function takeProfitPriceChange() {
		updateInitPrice()
		if (!amount.value) amount.value = 0
		if (takeProfitPrice.value - tickSz.value <= 0) takeProfitPrice.value = initPrice.value

		nextTick(() => {
			setTakeProfitPercent(takeProfitPrice.value)
			// useNuxtApp().$clickSound();
		})
	}

	function stopLossPriceChange() {
		updateInitPrice()
		if (!amount.value) amount.value = 0
		if (stopLossPrice.value - tickSz.value <= 0) stopLossPrice.value = initPrice.value
		nextTick(() => {
			setStopLossPercent(stopLossPrice.value)
			// useNuxtApp().$clickSound();
		})
	}

	function confirm() {
		console.log('confim', takeProfitPrice, stopLossPrice)
		emit('close', takeProfitPrice.value, stopLossPrice.value)
		if (props.push) useNuxtApp().$pop({ takeProfitPrice: takeProfitPrice.value, stopLossPrice: stopLossPrice.value })
	}
	function updateInitPrice() {
		if (!initPrice.value) {
			const { $ws } = useNuxtApp()
			const ticker = $ws.getTickers(props.symbol)
			if (ticker) initPrice.value = parseFloat(ticker.last)
		}
	}

	const takeProfitPercentChange = (val: number) => {
		setTakeProfitPriceWithPercent(val)
	}

	const stopLossPercentChange = (val: number) => {
		setStopLossPriceWithPercent(val)
	}

	const setTakeProfitPercent = (price: number) => {
		const val = ((price - initPrice.value) / initPrice.value) * 100
		takeProfitPercent.value = val
	}
	const setStopLossPercent = (price: number) => {
		const val = ((price - initPrice.value) / initPrice.value) * 100
		stopLossPercent.value = val
	}
	const setTakeProfitPriceWithPercent = (percent: number) => {
		updateInitPrice()
		if (percent != undefined) {
			// 止盈
			takeProfitPrice.value = parseFloat(numberToFixed(initPrice.value + (percent / 100) * initPrice.value, symbolObj.value.tickSz))
		} else {
			takeProfitPrice.value = initPrice.value
		}
		console.log('setTakeProfitPriceWithPercent', takeProfitPrice.value)
	}
	const setStopLossPriceWithPercent = (percent: number) => {
		updateInitPrice()
		if (percent != undefined) {
			// 止损
			stopLossPrice.value = parseFloat(numberToFixed(initPrice.value + (percent / 100) * initPrice.value, symbolObj.value.tickSz))
		} else {
			stopLossPrice.value = initPrice.value
		}
	}

	watch(
		() => takeProfitPercent.value,
		val => {
			setTakeProfitPriceWithPercent(val)
		}
	)

	watch(
		() => stopLossPercent.value,
		val => {
			setStopLossPriceWithPercent(val)
		}
	)

	const takeProfit = computed(() => {
		if (props.lotSize && takeProfitPrice.value > 0) {
			const p = (takeProfitPrice.value - initPrice.value) * parseFloat(props.lotSize)
			return formatNumber(p, '2')
		} else {
			return '0'
		}
	})
	const stopLoss = computed(() => {
		if (props.lotSize && stopLossPrice.value > 0) {
			const p = (stopLossPrice.value - initPrice.value) * parseFloat(props.lotSize)
			return formatNumber(p, '2')
		} else {
			return '0'
		}
	})

	watch(
		() => lotBalancePercent.value,
		val => {
			lotBalance.value = (parseFloat(props.lotSize || '0') * val) / 100
			lotBalance.value = Math.min(lotBalance.value, parseFloat(props.lotSize || '0'))
			console.log('lotBalancePercent', val, props.lotSize, lotBalance.value)
			lotBalance.value = numberToFixed(Math.max(lotBalance.value, parseFloat(symbolObj.value.minSz || '0')), symbolObj.value.lotSz)
			console.log('onProgressLotBalance', val, symbolObj.value.minSz, symbolObj.value.lotSz, lotBalance.value)
		}
	)

	const onProgressLotBalance = (val: number) => {}

	// 数量变化
	const amountChange = () => {
		const val = (lotBalance.value / parseFloat(props.lotSize || '0')) * 100
		lotBalancePercent.value = val
	}

	function addOrder() {
		if (submitLoading.value) return
		if (!props.position) return
		if (!useUserStore().user) {
			if (useStore().isH5) {
				pushUp(LoginIndex)
				return
			} else {
				useNuxtApp().$dialog(LoginIndex, {}, '600px', '560px')
				return
			}
		}

		if (!useAccountStore().accounts?.length) {
			if (useStore().isH5) {
				pushLeft(ExchangeIndex)
				return
			} else {
				useNuxtApp().$dialog(ExchangeIndex, {}, '800px', '500px', '开设账户')
				return
			}
		}

		if (!openTakeProfit.value && !openStopLoss.value) return confirm()

		submitLoading.value = true

		if (!takeProfitPrice.value && !stopLossPrice.value) {
			ElMessage.error({ message: '请输入止盈/止损价格' })
			submitLoading.value = false
			return
		}

		if (takeProfitPercent.value <= 0.001 && openTakeProfit.value) {
			ElMessage.error({ message: '止盈价格须远离成本价' })
			submitLoading.value = false
			return
		}

		if (stopLossPercent.value >= -0.001 && openStopLoss.value) {
			ElMessage.error({ message: '止损价格须远离成本价' })
			submitLoading.value = false
			return
		}

		if (!parseFloat(lotBalance.value)) {
			ElMessage.error({ message: '请输入委托数量' })
			submitLoading.value = false
			return
		}

		const action = 'close'

		const order = {
			action,
			side: Sides.SELL,
			orderType: OrderType.STOP,
			price: String('0'),
			lotSize: String(lotBalance.value),
			marginMode: props.position.marginMode,
			margin: String('0'),
			accountId: props.position.accountId,
			exchange: props.position.exchange,
			symbol: props.symbol,
			leverage: String('0'),
			takeProfitPrice: String(takeProfitPrice.value),
			stopLossPrice: String(stopLossPrice.value),
			openStopLoss: openStopLoss.value,
			openTakeProfit: openTakeProfit.value
		} as AddOrderDto

		console.log('order', order, takeProfitPercent, stopLossPercent)

		orderFetch
			.add(order)
			.then(result => {
				if (result?.code == FetchResultDto.OK) {
					// 下单成功,如果ws五秒内还不来就先给出提示
					submitLoading.value = false
					confirm()
				} else {
					setTimeout(() => {
						ElMessage.error(result?.msg)
						submitLoading.value = false
					}, 500)
				}
			})
			.catch(err => {
				setTimeout(() => {
					ElMessage.error('网络异常，请稍后再试')
					submitLoading.value = false
				}, 500)
			})
	}

	onMounted(() => {
		lotBalancePercent.value = 100
		// openStop.value = !(localStorage.getItem('stopProfitLossClose_'+props.type) == 'true')
		initPrice.value = parseFloat(numberToFixed(props.initPrice || 0, symbolObj.value.tickSz))
		takeProfitPrice.value = props.initPrice || 0
		if (takeProfitPrice.value) {
			takeProfitPriceChange()
		}
		stopLossPrice.value = props.initPrice || 0
		if (stopLossPrice.value) {
			stopLossPriceChange()
		}
	})

	onBeforeUnmount(() => {
		priceInput.value = null
	})
</script>
<template>
	<div :class="['pt-1', 'stopprofit-h5']">
		<h3 class="flex items-center justify-between">
			<span class="text-main flex items-center"> 设置止盈止损 </span>
			<SymbolName :symbol="useSymbolStore().getSymbol(symbol)" class="text-base roboto-bold leading-[0] mr-2" size="20px" />
		</h3>
		<div class="py-1 pb-1">
			<ul>
				<li class="text-xs [&_span]:text-grey [&_span]:pr-1 [&_b]:text-main" v-if="!position">
					<span>最新价格</span>
					<b>{{ formatPrice(initPrice, symbolObj.tickSz) }}</b>
					<template v-if="lotSize">
						<span class="pl-2">委托数量</span>
						<b>{{ formatNumber(parseFloat(lotSize), symbolObj.lotSz) }}</b>
					</template>
				</li>

				<li v-else class="text-xs [&_span]:text-grey [&_span]:pr-1 [&_b]:text-main">
					<span>成本价</span>
					<b>{{ formatPrice(initPrice, symbolObj.tickSz) }}</b>
					<template v-if="lotSize">
						<span class="pl-2">可用数量</span>
						<b>{{ formatNumber(parseFloat(lotSize), symbolObj.lotSz) }}</b>
					</template>
				</li>
				<li class="text-xs [&_span]:text-grey [&_span]:pr-1 [&_b]:text-main" v-if="position">
					<span>最新价</span>
					<b>{{ formatPrice(position.lastPrice, symbolObj.tickSz) }}</b>
				</li>
			</ul>
		</div>

		<div class="py-1">
			<div class="flex items-center gap-3">
				<div class="flex-auto">
					<h3 class="mb-3 flex items-center">
						止盈<el-switch v-model="openTakeProfit" class="ml-2 !h-auto" :style="`--el-switch-on-color: rgb(var(--color-green)); --el-switch-off-color: var(--transparent10)`" />
					</h3>
					<el-input-number
						ref="priceInput"
						@input="takeProfitPriceChange"
						v-model="takeProfitPrice"
						:step="parseFloat(symbolObj?.tickSz.toString() || '1')"
						:min="initPrice"
						:max="initPrice * 1000"
						:precision="point"
						:controls-position="push == 'btt' ? '' : 'right'"
						size="large"
						class="!w-full price-input"
						v-click-sound
						autofocus
						inputmode="decimal"
						:disabled="!openTakeProfit"
					/>
				</div>
				<div class="w-[100px]">
					<h3 class="mb-3">涨幅 %</h3>
					<div class="slider-box">
						<el-input-number
							@change="takeProfitPercentChange"
							@input="takeProfitPercentChange"
							v-model="takeProfitPercent"
							:min="0"
							:max="100"
							:step="0.01"
							:precision="2"
							:controls-position="push == 'btt' ? '' : 'right'"
							size="large"
							class="max-w-full"
							v-click-sound
							inputmode="decimal"
							:controls="false"
							:disabled="!openTakeProfit"
						>
							<template #suffix>
								<span>%</span>
							</template>
						</el-input-number>
					</div>
				</div>
			</div>

			<div class="slider-wrapper"><slider v-model="takeProfitPercent" :step="1" :marks="takeProfitMarks" :showTooltip="false" /></div>
		</div>

		<div class="py-0">
			<div class="flex items-center gap-3">
				<div class="flex-auto">
					<h3 class="mb-3 flex items-center">
						止损
						<el-switch v-model="openStopLoss" class="ml-2 !h-auto" :style="`--el-switch-on-color: rgb(var(--color-red)); --el-switch-off-color: var(--transparent10)`" />
					</h3>
					<el-input-number
						ref="priceInput"
						@input="stopLossPriceChange"
						v-model="stopLossPrice"
						:step="parseFloat(symbolObj?.tickSz.toString() || '1')"
						:min="initPrice * 0.5"
						:max="initPrice"
						:precision="point"
						:controls-position="push == 'btt' ? '' : 'right'"
						size="large"
						class="!w-full price-input"
						v-click-sound
						autofocus
						inputmode="decimal"
						:disabled="!openStopLoss"
					/>
				</div>
				<div class="w-[100px]">
					<h3 class="mb-3">跌幅 %</h3>
					<div class="slider-box">
						<el-input-number
							@change="stopLossPercentChange"
							@input="stopLossPercentChange"
							v-model="stopLossPercent"
							:min="-1000"
							:max="0"
							:step="0.01"
							:precision="2"
							:controls-position="push == 'btt' ? '' : 'right'"
							size="large"
							class="max-w-full"
							v-click-sound
							inputmode="decimal"
							:controls="false"
							:disabled="!openStopLoss"
						>
							<template #suffix>
								<span>%</span>
							</template>
						</el-input-number>
					</div>
				</div>
			</div>
			<div class="slider-wrapper-loss"><slider v-model="stopLossPercent" :step="1" :marks="stopLossMarks" :showTooltip="false" /></div>
		</div>

		<template v-if="position">
			<div class="py-1">
				<h3 class="mb-3">委托数量</h3>
				<el-input @change="amountChange" @input="amountChange" v-model="lotBalance" size="large" class="!w-full" v-click-sound inputmode="decimal" />
			</div>
			<div class="slider-wrapper"><slider v-model="lotBalancePercent" :step="1" :marks="lotSizeMarks" :showTooltip="false" @progress="onProgressLotBalance" /></div>
		</template>

		<div class="py-3">
			<button class="stop-bt bt-green w-full !py-2 flex items-center leading-normal" v-click-sound @click="position ? addOrder() : confirm()">
				<span :class="submitLoading ? 'text-white/50' : 'text-white'">确定</span>
				<Loading v-if="submitLoading" size="14px" class="mx-2" />
			</button>
		</div>
	</div>
</template>
<style lang="less" scoped>
	.slider-wrapper-loss {
		--el-color-primary: rgb(var(--color-red));
		:deep(.slider-container) {
			--slider-border-color: rgb(var(--color-red));
			// .slider-progress {
			// 	background-color: rgb(var(--color-red));
			// }
			// .slider-progress-stops {
			// 	background-color: rgb(var(--color-red));
			// }
			// .slider-tooltip {
			// 	background-color: rgb(var(--color-red));
			// }
		}
		.stop-bt {
			background-color: rgb(var(--color-red));
			border-color: rgb(var(--color-red));
		}
	}
	.stopprofit {
		--el-color-primary: rgb(var(--color-green));
		.stop-bt {
			background-color: rgb(var(--color-green));
			border-color: rgb(var(--color-green));
		}
	}

	@media (max-width: 999px) {
		.stopprofit-h5 {
			@apply px-4 pb-5;
			:deep(.el-input-number) {
				&.price-input {
					padding: 0;
				}
				.el-input-number__decrease,
				.el-input-number__increase {
					width: 35px !important;
				}
				.el-input__wrapper {
					.el-input__inner {
						text-align: center;
					}
				}
			}
		}
		.slider-wrapper {
			.slider-box {
				@apply flex-row;
			}
		}
	}
</style>
