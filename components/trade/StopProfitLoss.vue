<script setup lang="ts">
	import { InstanceType, OrderType, Sides, type Ticker } from '~/fetch/okx/okx.type.d'
	import { useStore } from '~/store'
	import { useSymbolStore } from '~/store/symbol'
	const props = defineProps<{
		symbol: string
		type: number
		price?: number
		initPrice?: number
		push?: string
		lotSize?: string
		positionId?: string
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

	const lotBalance = ref(formatNumber(props.lotSize || '0', '2'))
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

	function priceChange(currentValue: number, oldValue: number) {
		updateInitPrice()
		if (!amount.value) amount.value = 0
		if (price.value - tickSz.value <= 0) price.value = initPrice.value
		console.log('priceChange', price.value, initPrice.value)
		// 价格变化，点数跟着变化
		nextTick(() => {
			if (!props.type) {
				amount.value = Math.floor((price.value - initPrice.value) / tickSz.value)
			} else {
				amount.value = Math.floor((initPrice.value - price.value) / tickSz.value)
			}
			setPercent(price.value)
			// useNuxtApp().$clickSound();
		})
	}
	function priceFocus() {}
	function amountChange() {
		updateInitPrice()
		if (!amount.value) amount.value = 0
		if (price.value - tickSz.value <= 0) price.value = initPrice.value
		// 点数变化，价格跟着变化
		nextTick(() => {
			if (!props.type) {
				price.value = initPrice.value + amount.value * tickSz.value
			} else {
				price.value = initPrice.value - amount.value * tickSz.value
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
		if (!props.type) {
			amount.value = Math.floor((price.value - initPrice.value) / tickSz.value)
		} else {
			amount.value = Math.floor((initPrice.value - price.value) / tickSz.value)
		}
	}
	watch(
		() => szPercent.value,
		val => {
			console.log('szPercent', val)
			setPriceWithPercent(val)
		}
	)

	const onProgress = (val: number) => {
		if (val != undefined) {
			console.log('onProgress', val)
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
			const p = (price.value - initPrice.value) * parseFloat(props.lotSize)
			return formatNumber(p, '2')
		} else {
			return '0'
		}
	})

	watch(
		() => lotBalancePercent.value,
		val => {
			lotBalance.value = (parseFloat(props.lotSize || '0') * val) / 100
			console.log('lotBalancePercent', val,props.lotSize, lotBalance.value)
			lotBalance.value = numberToFixed(Math.max(lotBalance.value, parseFloat(symbolObj.value.minSz || '0')))
			// console.log('onProgressLotBalance', val, symbolObj.value.minSz, symbolObj.value.lotSz, lotBalance.value.toFixed(parseFloat(symbolObj.value.lotSz)))
		}
	)

	const onProgressLotBalance = (val: number) => {}

	onMounted(() => {
		console.log('stopLoss', localStorage.getItem('stopProfitLossClose_' + props.type))
		lotBalancePercent.value = 100
		// openStop.value = !(localStorage.getItem('stopProfitLossClose_'+props.type) == 'true')
		price.value = props.price || 0
		initPrice.value = props.initPrice || 0
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
			<span class="text-main">{{ !type ? '设置止盈' : '设置止损' }} </span>
			<el-switch v-model="openStop" class="ml-2" :style="`--el-switch-on-color: rgb(var(--color-${!type ? 'green' : 'red'})); --el-switch-off-color: var(--transparent10)`" />
		</h3>
		<div class="py-1 pb-3">
			<ul>
				<li class="text-xs [&_span]:text-grey [&_span]:pr-1 [&_b]:text-main">
					<span>最新价格</span>
					<b>{{ formatPrice(initPrice, symbolObj.tickSz) }}</b>
					<template v-if="lotSize">
						<span class="pl-2">委托数量</span>
						<b>{{ formatNumber(parseFloat(lotSize), '2') }}</b>
					</template>
				</li>
			</ul>
		</div>
		<h3 class="flex items-center justify-between">
			<span>{{ !type ? '止盈' : '止损' }} </span>
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
				<span v-if="price"
					>当前价格达到 <span class="text-main">${{ price.toFixed(point) }} (约等于 {{ formatNumber(szPercent, '2') }} %)</span> 时触发
					<span class="text-main">市价委托{{ !type ? '止盈' : '止损' }}</span></span
				>
				<template v-if="parseFloat(profit)">
					<span
						>，预估{{ !type ? '收益' : '亏损' }}为 <b class="text-[--el-color-primary]">{{ parseFloat(profit) >= 0 ? '+' : '' }} {{ profit }} USDT</b></span
					>
				</template>
			</div>
		</div>
		<div class="flex items-center py-2 gap-3">
			<div class="w-1/2">
				<h3 class="mb-3">点数</h3>
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
				<h3 class="mb-3">{{ !type ? '涨幅' : '跌幅' }} %</h3>
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
		<template v-if="positionId">
			<div class="py-2">
				<h3 class="mb-3">数量</h3>
				<el-input @change="amountChange" @input="amountChange" v-model="lotBalance" size="large" class="!w-full" v-click-sound inputmode="decimal" :disabled="!openStop" />
			</div>
			<div class="slider-wrapper"><slider v-model="lotBalancePercent" :step="1" :marks="lotSizeMarks" :showTooltip="false" @progress="onProgressLotBalance" /></div>
		</template>

		<div class="py-3">
			<button class="stop-bt bt-green w-full !py-2" v-click-sound @click="confirm">确定</button>
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
