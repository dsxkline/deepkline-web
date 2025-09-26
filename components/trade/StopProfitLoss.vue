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
	const { t } = useI18n()
	const pushUp = usePushUp()
	const pushLeft = usePush()
	const props = defineProps<{
		symbol: string
		type: number
		price?: number
		initPrice?: number
		push?: string
		lotSize?: string
		leverage?: string
		position?: PositionDto
	}>()
	const emit = defineEmits<{
		(event: 'close', price: number, point: number, open: boolean, changeRate: number): void
	}>()
	watch(
		() => props.price,
		() => {
			if (!price.value && props.price) {
				initPrice.value = props.price
			}
		}
	)
	const priceInput = ref()
	// 初始值
	const initPrice = ref(0)
	// 价格
	const price = ref(0)
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
	const szPercent = ref(0)
	const marks = computed(() => {
		return !props.type
			? {
					'0': '0%',
					'25': '25%',
					'50': '50%'
			  }
			: {
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
	const openStop = ref(!(localStorage.getItem('stopProfitLossClose_' + props.type) == 'true'))
	const tickSz = computed(() => parseFloat(symbolObj.value.tickSz))
	const submitLoading = ref(false)

	function priceChange(currentValue: number, oldValue: number) {
		updateInitPrice()
		if (!amount.value) amount.value = 0
		if (price.value - tickSz.value <= 0) price.value = initPrice.value

		// 价格变化，点数跟着变化
		nextTick(() => {
			setAmountWithPrice(price.value)
			setPercent(price.value)
			// useNuxtApp().$clickSound();
		})
	}

	function setAmountWithPrice(price: number) {
		if (!props.type) {
			amount.value = DecimalHelper.div(DecimalHelper.sub(price, initPrice.value).toString(), tickSz.value).toNumber()
		} else {
			amount.value = DecimalHelper.div(DecimalHelper.sub(initPrice.value, price).toString(), tickSz.value).toNumber()
		}
		// console.log('priceChange', price, initPrice.value, amount.value, tickSz.value)
	}

	function priceFocus() {}
	function amountChange() {
		updateInitPrice()
		if (!amount.value) amount.value = 0
		if (price.value - tickSz.value <= 0) price.value = initPrice.value
		// 点数变化，价格跟着变化
		nextTick(() => {
			if (!props.type) {
				price.value = DecimalHelper.add(initPrice.value, DecimalHelper.mul(amount.value, tickSz.value).toString()).toNumber()
			} else {
				price.value = DecimalHelper.sub(initPrice.value, DecimalHelper.mul(amount.value, tickSz.value).toString()).toNumber()
			}
			setPercent(price.value)
			// useNuxtApp().$clickSound();
		})
	}

	function confirm() {
		emit('close', openStop.value ? price.value : 0, openStop.value ? amount.value : 0, openStop.value, szPercent.value)
		if (props.push) useNuxtApp().$pop({ price: openStop.value ? price.value : 0, amount: openStop.value ? amount.value : 0, open: openStop.value, changeRate: szPercent.value })
	}
	function updateInitPrice() {
		if (!initPrice.value) {
			const { $ws } = useNuxtApp()
			const ticker = $ws.getTickers(props.symbol)
			if (ticker) initPrice.value = parseFloat(ticker.last)
		}
	}

	const percentChange = (val: number) => {
		setPriceWithPercent(val)
	}

	const setPercent = (price: number) => {
		let val = 0
		if (!props.type) {
			// 止盈
			val = ((price - initPrice.value) / initPrice.value) * 100
		} else {
			// 止损
			val = ((price - initPrice.value) / initPrice.value) * 100
		}
		// console.log('setPercent', val, price, initPrice.value)
		szPercent.value = val
	}
	const setPriceWithPercent = (percent: number) => {
		updateInitPrice()
		if (percent != undefined) {
			if (!props.type) {
				// 止盈
				price.value = initPrice.value + (percent / 100) * initPrice.value
			} else {
				// 止损
				price.value = initPrice.value + (percent / 100) * initPrice.value
			}
		} else {
			price.value = initPrice.value
		}
		setAmountWithPrice(price.value)
	}
	watch(
		() => szPercent.value,
		val => {
			// console.log('szPercent', val)
			setPriceWithPercent(val)
		}
	)

	const onProgress = (val: number) => {
		if (val != undefined) {
			// console.log('onProgress', val)
			// szPercent.value = parseFloat(val.toFixed(2))
			// setPriceWithPercent(szPercent.value)
		}
	}

	watch(
		() => openStop.value,
		val => {
			localStorage.setItem('stopProfitLossClose_' + props.type, val ? 'false' : 'true')
		},
		{ immediate: true }
	)

	const profit = computed(() => {
		if (props.lotSize && price.value > 0) {
			const p = (price.value - initPrice.value) * parseFloat(props.lotSize) * parseFloat(props.leverage || '1')
			return formatNumber(p, '2')
		} else {
			return '0'
		}
	})

	watch(
		() => lotBalancePercent.value,
		val => {
			lotBalance.value = (parseFloat(props.lotSize || '0') * val) / 100
			//console.log('lotBalancePercent', val, props.lotSize, lotBalance.value)
			lotBalance.value = numberToFixed(Math.max(lotBalance.value, parseFloat(symbolObj.value.minSz || '0')), symbolObj.value.lotSz)
			//console.log('onProgressLotBalance', val, symbolObj.value.minSz, symbolObj.value.lotSz, lotBalance.value)
		}
	)

	const onProgressLotBalance = (val: number) => {}

	function addOrder() {
		if (submitLoading.value) return
		if (!props.position) return
		if (!useUserStore().user) {
			if (useStore().isH5) {
				pushUp(LoginIndex,{},'100%')
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
				useNuxtApp().$dialog(ExchangeIndex, {}, '800px', '500px', t('开设账户'))
				return
			}
		}

		submitLoading.value = true

		if (!price.value) {
			ElMessage.error({ message: props.type == 0 ? t('请输入止盈价格') : t('请输入止损价格') })
			submitLoading.value = false
			return
		}

		if (!parseFloat(lotBalance.value)) {
			ElMessage.error({ message: t('请输入交易数量') })
			submitLoading.value = false
			return
		}

		const action = 'close'

		const order = {
			action,
			side: Sides.SELL,
			orderType: OrderType.STOP,
			price: String(price.value),
			lotSize: String(lotBalance.value),
			marginMode: props.position.marginMode,
			margin: String('0'),
			accountId: props.position.accountId,
			exchange: props.position.exchange,
			symbol: props.symbol,
			leverage: String('0'),
			takeProfitPrice: props.type == 0 ? String(price.value) : '0',
			stopLossPrice: props.type == 1 ? String(price.value) : '0',
			openStopLoss: props.type == 1 ? openStop.value : false,
			openTakeProfit: props.type == 0 ? openStop.value : false
		} as AddOrderDto

		// console.log('order', order)

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
					ElMessage.error(t('网络异常，请稍后再试'))
					submitLoading.value = false
				}, 500)
			})
	}

	onMounted(() => {
		// console.log('stopLoss', localStorage.getItem('stopProfitLossClose_' + props.type))
		lotBalancePercent.value = 100
		// openStop.value = !(localStorage.getItem('stopProfitLossClose_'+props.type) == 'true')
		initPrice.value = parseFloat(numberToFixed(props.initPrice || 0, symbolObj.value.tickSz))
		price.value = props.price || props.initPrice || 0
		if (price.value) {
			priceChange(price.value, 0)
		}
		// setTimeout(() => {
		// 	priceInput.value.focus()
		// }, 600)
	})

	onBeforeUnmount(() => {
		priceInput.value = null
	})
</script>
<template>
	<div :class="['pt-1', 'stopprofit-h5', type ? 'stoploss' : 'stopprofit']">
		<h3 class="flex items-center justify-between">
			<span class="text-main">{{ !type ? t('设置止盈') : t('设置止损') }} </span>
			<el-switch v-model="openStop" class="ml-2" :style="`--el-switch-on-color: rgb(var(--color-${!type ? 'green' : 'red'})); --el-switch-off-color: var(--transparent10)`" />
		</h3>
		<div class="py-1 pb-3">
			<ul>
				<li class="text-xs [&_span]:text-grey [&_span]:pr-1 [&_b]:text-main" v-if="!position">
					<span>{{ t('最新价格') }}</span>
					<b>{{ formatPrice(initPrice, symbolObj.tickSz) }}</b>
					<template v-if="lotSize">
						<span class="pl-2">{{ t('委托数量') }}</span>
						<b>{{ formatNumber(parseFloat(lotSize), symbolObj.lotSz) }}</b>
					</template>
				</li>

				<li v-else class="text-xs [&_span]:text-grey [&_span]:pr-1 [&_b]:text-main">
					<span>{{ t('成本价') }}</span>
					<b>{{ formatPrice(initPrice, symbolObj.tickSz) }}</b>
					<template v-if="lotSize">
						<span class="pl-2">{{ t('可用数量') }}</span>
						<b>{{ formatNumber(parseFloat(lotSize), symbolObj.lotSz) }}</b>
					</template>
				</li>
				<li class="text-xs [&_span]:text-grey [&_span]:pr-1 [&_b]:text-main" v-if="position">
					<span>{{ t('最新价') }}</span>
					<b>{{ formatPrice(position.lastPrice, symbolObj.tickSz) }}</b>
				</li>
			</ul>
		</div>
		<h3 class="flex items-center justify-between">
			<span>{{ !type ? t('止盈') : t('止损') }} </span>
		</h3>
		<div class="py-2">
			<el-input-number
				ref="priceInput"
				@focus="priceFocus"
				@input="priceChange"
				v-model="price"
				:step="parseFloat(symbolObj?.tickSz.toString() || '1')"
				:min="!type ? initPrice : 0"
				:max="!type ? initPrice * 1000 : initPrice"
				:precision="point"
				:controls-position="push == 'btt' ? '' : 'right'"
				size="large"
				class="!w-full price-input"
				v-click-sound
				autofocus
				inputmode="decimal"
				:disabled="!openStop"
			/>
			<div class="text-xs text-grey mt-1">
				<i18n-t keypath="当价格达到止盈" v-if="price && !type && szPercent">
					<template #price>
						<span class="text-main"> ${{ price.toFixed(point) }}</span>
					</template>
					<template #percent>
						<span class="text-main"> +{{ formatNumber(szPercent, '2') }}% </span>
					</template>
					<template #profit v-if="parseFloat(profit)">
						<b class="text-[--el-color-primary]">{{ parseFloat(profit) >= 0 ? '+' : '' }} {{ profit }} USDT</b>
					</template>
				</i18n-t>

				<i18n-t keypath="当价格达到止损" v-if="price && type && szPercent">
					<template #price
						><span class="text-main"> ${{ price.toFixed(point) }} </span></template
					>
					<template #percent>
						<span class="text-main"> {{ formatNumber(szPercent, '2') }}%</span>
					</template>
					<template #profit v-if="parseFloat(profit)">
						<b class="text-[--el-color-primary]">{{ parseFloat(profit) >= 0 ? '+' : '' }} {{ profit }} USDT</b>
					</template>
				</i18n-t>
			</div>
		</div>
		<div class="flex items-center py-2 gap-3">
			<div class="w-1/2">
				<h3 class="mb-3">{{ t('点数') }}</h3>
				<el-input-number
					@change="amountChange"
					@input="amountChange"
					v-model="amount"
					:min="0"
					:step="1"
					:precision="0"
					:controls-position="push == 'btt' ? '' : 'right'"
					size="large"
					class="!w-full"
					v-click-sound
					inputmode="decimal"
					:disabled="!openStop"
				/>
			</div>
			<div class="w-1/2">
				<h3 class="mb-3">{{ !type ? t('涨幅') : t('跌幅') }} %</h3>
				<div class="slider-box">
					<el-input-number
						@change="percentChange"
						@input="percentChange"
						v-model="szPercent"
						:min="!type ? 0 : -1000"
						:max="!type ? 1000 : 0"
						:step="0.01"
						:precision="2"
						:controls-position="push == 'btt' ? '' : 'right'"
						size="large"
						class="max-w-full"
						v-click-sound
						inputmode="decimal"
						:disabled="!openStop"
					>
						<template #suffix>
							<span>%</span>
						</template>
					</el-input-number>
				</div>
			</div>
		</div>
		<div class="slider-wrapper"><slider v-model="szPercent" :step="1" :marks="marks" :showTooltip="false" @progress="onProgress" /></div>
		<template v-if="position">
			<div class="py-2">
				<h3 class="mb-3">{{ t('数量') }}</h3>
				<el-input @change="amountChange" @input="amountChange" v-model="lotBalance" size="large" class="!w-full" v-click-sound inputmode="decimal" :disabled="!openStop" />
			</div>
			<div class="slider-wrapper"><slider v-model="lotBalancePercent" :step="1" :marks="lotSizeMarks" :showTooltip="false" @progress="onProgressLotBalance" /></div>
		</template>

		<div class="py-3">
			<button class="stop-bt bt-green w-full !py-2 flex items-center leading-normal" v-click-sound @click="position ? addOrder() : confirm()">
				<span :class="submitLoading ? 'text-white/50' : 'text-white'">{{ t('确定') }}</span>
				<Loading v-if="submitLoading" size="14px" class="mx-2" />
			</button>
		</div>
	</div>
</template>
<style lang="less" scoped>
	.stoploss {
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
