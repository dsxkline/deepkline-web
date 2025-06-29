<script setup lang="ts">
	import { InstanceType, OrderType, Sides, type Ticker } from '~/fetch/okx/okx.type.d'
import { useStore } from '~/store';
	import { useSymbolStore } from '~/store/symbol'
	const props = defineProps<{
		symbol: string
		type: number
		price?: number
		initPrice: number
		push?: string
	}>()
	const emit = defineEmits<{
		(event: 'close', price: number, point: number): void
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
					'50': '50%',
					'100': '100%'
			  }
			: {
					'0': '0%',
					'-50': '-50%',
					'-100': '-100%'
			  }
	})

	function priceChange(currentValue: number, oldValue: number) {
		updateInitPrice()
		if (!amount.value) amount.value = 0
		if (price.value - symbolObj.value.tickSz <= 0) price.value = initPrice.value
		console.log('priceChange', price.value, initPrice.value)
		// 价格变化，点数跟着变化
		nextTick(() => {
			if (!props.type) {
				amount.value = Math.floor((price.value - initPrice.value) / symbolObj.value.tickSz)
			} else {
				amount.value = Math.floor((initPrice.value - price.value) / symbolObj.value.tickSz)
			}
			setPercent(price.value)
			// useNuxtApp().$clickSound();
		})
	}
	function priceFocus() {}
	function amountChange() {
		updateInitPrice()
		if (!amount.value) amount.value = 0
		if (price.value - symbolObj.value.tickSz <= 0) price.value = initPrice.value
		// 点数变化，价格跟着变化
		nextTick(() => {
			if (!props.type) {
				price.value = initPrice.value + amount.value * symbolObj.value.tickSz
			} else {
				price.value = initPrice.value - amount.value * symbolObj.value.tickSz
			}
			setPercent(price.value)
			// useNuxtApp().$clickSound();
		})
	}

	function confirm() {
		emit('close', price.value, amount.value)
		if (props.push) useNuxtApp().$pop({ price: price.value, amount: amount.value })
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
			val = ((initPrice.value - price) / initPrice.value) * 100
		}
		console.log('setPercent,,,,,,', val, price, initPrice.value)
		szPercent.value = parseFloat(val.toFixed(2))
	}
	const setPriceWithPercent = (percent: number) => {
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
			amount.value = Math.floor((price.value - initPrice.value) / symbolObj.value.tickSz)
		} else {
			amount.value = Math.floor((initPrice.value - price.value) / symbolObj.value.tickSz)
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

	onMounted(() => {
		console.log('stopLoss', props.price, props.initPrice, props.push)
		price.value = props.price || 0
		initPrice.value = props.initPrice
		if (price.value) {
			priceChange(price.value, 0)
		}
		setTimeout(() => {
			priceInput.value.focus()
		}, 600)
	})

	onBeforeUnmount(() => {
		priceInput.value = null
	})
</script>
<template>
	<div :class="['pt-1', 'stopprofit-h5', type ? 'stoploss' : 'stopprofit']">
		<h3>{{ !type ? '止盈' : '止损' }}价</h3>
		<div class="py-2">
			<el-input-number
				ref="priceInput"
				@focus="priceFocus"
				@input="priceChange"
				v-model="price"
				:step="parseFloat(symbolObj?.tickSz.toString() || '1')"
				:precision="point"
				:controls-position="push == 'btt' ? '' : 'right'"
				size="large"
				class="!w-full price-input"
				v-click-sound
				autofocus
				inputmode="decimal"
			/>
		</div>
		<h3>点数</h3>
		<div class="py-2">
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
			/>
		</div>
		<div class="slider-wrapper py-2">
			<h3 class="mb-3">{{ !type ? '涨幅' : '跌幅' }}</h3>
			<div class="slider-box flex flex-col items-center justify-between gap-4">
				<el-input-number
					@change="percentChange"
					@input="percentChange"
					v-model="szPercent"
					:step="0.01"
					:precision="2"
					:controls-position="push == 'btt' ? '' : 'right'"
					size="large"
					class="!w-[220px] max-w-full"
					v-click-sound
					inputmode="decimal"
				>
					<template #suffix>
						<span>%</span>
					</template>
				</el-input-number>

				<slider v-model="szPercent" :step="1" :marks="marks" :showTooltip="false" @progress="onProgress" />
			</div>
		</div>
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
			.slider-progress {
				background-color: rgb(var(--color-red));
			}
			.slider-progress-stops {
				background-color: rgb(var(--color-red));
			}
			.slider-tooltip {
				background-color: rgb(var(--color-red));
			}
		}
		.stop-bt {
			background-color: rgb(var(--color-red));
			border-color: rgb(var(--color-red));
		}
	}
	.stopprofit {
		--el-color-primary: rgb(var(--color-green));
		:deep(.slider-container) {
			.slider-progress {
				background-color: rgb(var(--color-green));
			}
			.slider-progress-stops {
				background-color: rgb(var(--color-green));
			}
			.slider-tooltip {
				background-color: rgb(var(--color-green));
			}
		}
		.stop-bt {
			background-color: rgb(var(--color-green));
			border-color: rgb(var(--color-green));
		}
	}
	:deep(.el-input-number) {
		&.price-input {
			.el-input__wrapper {
				padding: 0 5px;
				// box-shadow: 0 0 0 1px rgb(var(--color-green)) inset;
				// box-shadow: none;
				// border: 1px solid rgb(var(--color-green));
			}
		}
	}

	@media (max-width: 999px) {
		.stopprofit-h5 {
			@apply px-4 pb-5;
			:deep(.el-input-number) {
				&.price-input {
					.el-input__wrapper {
						// box-shadow: none;
						// border: none;
					}
				}
				.el-input__wrapper {
					// box-shadow: none;
					// border: none;
					// &.is-focus {
					// 	box-shadow: 0 0 0 1px rgb(var(--color-brand)) inset;
					// }
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
