<script setup lang="ts">
	import { InstanceType, OrderType, Sides, type Ticker } from '~/fetch/okx/okx.type.d'
	import { useSymbolStore } from '~/store/symbol'
	const props = defineProps<{
		symbol: string
		type: number
		price: number
	}>()
	const emit = defineEmits<{
		(event: 'onClose', price: number, point: number): void
	}>()
	watch(
		() => props.price,
		() => {
			if (!price.value) {
				price.value = props.price
			}
		}
	)
	const priceInput = ref()
	// 初始值
	const initPrice = ref(0)
	// 价格
	const price = ref()
	const point = computed(() => {
		let p = String(symbolObj.value?.tickSz).split('.')
		if (p.length > 1) {
			return p[1].length
		}
		return 0
	})
	// 点数
	const amount = ref(0)
	const symbolObj = computed(() => useSymbolStore().getActiveSymbol())
	function priceChange() {
		
		// 价格变化，点数跟着变化
		nextTick(() => {
            if (!amount.value) amount.value = 0
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
		
		// 点数变化，价格跟着变化
		nextTick(() => {
            if (!amount.value) amount.value = 0
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
		emit('onClose', price.value, amount.value)
	}
	onMounted(() => {
		price.value = props.price
		initPrice.value = props.price
		priceInput.value.focus()
	})
</script>
<template>
	<div class="pt-1">
		<h3>{{ !type ? '止盈' : '止损' }}价</h3>
		<div class="py-2">
			<el-input-number
				ref="priceInput"
				@change="priceChange"
				@focus="priceFocus"
				@input="priceChange"
				v-model="price"
				:step="parseFloat(symbolObj?.tickSz.toString() || '1')"
				:precision="point"
				controls-position="right"
				size="large"
				class="!w-full price-input"
				click-sound
				autofocus
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
				controls-position="right"
				size="large"
				class="!w-full"
				click-sound
			/>
		</div>
		<div class="py-2">
			<el-button type="primary" size="large" class="w-full !h-auto" click-sound @click="confirm">确定</el-button>
		</div>
	</div>
</template>
<style lang="less" scoped>
	:deep(.el-input-number) {
		&.price-input {
			.el-input__wrapper {
				padding: 0 5px;
				box-shadow: 0 0 0 1px rgb(var(--color-green)) inset;
			}
		}
	}
</style>
