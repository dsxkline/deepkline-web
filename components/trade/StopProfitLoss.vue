<script setup lang="ts">
	import { InstanceType, OrderType, Sides, type Ticker } from '~/fetch/okx/okx.type.d'
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
			// useNuxtApp().$clickSound();
		})
	}
	function amountFocus() {}
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
	<div :class="['pt-1', 'stopprofit-h5']">
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
				@focus="amountFocus"
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
		<div class="py-3">
			<button class="bt-green w-full !py-2" v-click-sound @click="confirm">确定</button>
		</div>
	</div>
</template>
<style lang="less" scoped>
	:deep(.el-input-number) {
		&.price-input {
			.el-input__wrapper {
				padding: 0 5px;
				// box-shadow: 0 0 0 1px rgb(var(--color-green)) inset;
				box-shadow: none;
				border: 1px solid rgb(var(--color-green));
			}
		}
	}

	@media (max-width: 999px) {
		.stopprofit-h5 {
			@apply px-4 pb-5;
			:deep(.el-input-number) {
				&.price-input {
					.el-input__wrapper {
						box-shadow: none;
						border: 1px solid var(--transparent10);
					}
				}
				.el-input__wrapper {
					box-shadow: none;
					border: 1px solid var(--transparent10);
					&.is-focus {
						box-shadow: 0 0 0 1px rgb(var(--color-brand)) inset;
					}
					.el-input__inner {
						text-align: center;
					}
				}
			}
		}
	}
</style>
