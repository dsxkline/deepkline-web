<script setup lang="ts">
	import { start } from 'single-spa'
	import { InstanceType, type Instruments, type Ticker } from '~/fetch/okx/okx.type.d'
	import { useSymbolStore } from '~/store/symbol'
	const props = defineProps<{
		symbol: Instruments
	}>()
	const { $wsb, $ws } = useNuxtApp()
	const price = ref<Ticker | null>()
	const startChangeColor = ref(false)
	const changeRate = computed(() => {
		price.value = $ws.getTickers(props.symbol.instId)
		return price.value?.last && price.value?.sodUtc8 ? ((parseFloat(price.value?.last) - parseFloat(price.value?.sodUtc8)) / parseFloat(price.value?.sodUtc8)) * 100 : 0
	})
	const changeColor = ref('')
	watch(
		() => changeRate.value,
		(val, old) => {
			if (startChangeColor.value) return
			if (val.toFixed(2) === old.toFixed(2)) return
			startChangeColor.value = true
			changeColor.value = val > 0 ? 'bt-green-flash' : 'bt-red-flash'
			// console.log('changerate', val, old)
			setTimeout(() => {
				animationend()
			}, 300);
		}
	)
	// 延迟等待销毁
	const animationend = () => {
		changeColor.value = ''
		setTimeout(() => {
			startChangeColor.value = false
		}, 50)
	}

	const tickerHandler = (data: Ticker) => {
		price.value = data
	}
	onMounted(() => {
		$ws.addTickerHandler(props.symbol.instId, tickerHandler)
	})
	onUnmounted(() => {
		price.value = null
		$ws.removeTickerHandler(props.symbol.instId, tickerHandler)
	})
</script>
<template>
	<div class="*:text-white *:px-2 *:w-16 *:h-7 *:rounded *:text-xs *:font-bold">
		<button class="bg-[var(--transparent10)] text-grey" v-if="!changeRate && !price?.last">-</button>
		<button
			v-else
			:key="changeColor"
			:class="['bg-[var(--transparent10)]', changeRate > 0 && '!bg-[rgb(var(--color-green))]', changeRate < 0 && '!bg-[rgb(var(--color-red))]', changeColor]"
		>
			{{ formatChangeRate(changeRate, 2) }}%
		</button>
	</div>
</template>

<style lang="less" scoped>
	// 背景闪烁
	// .bt-red-flash {
	// 	filter: brightness(0.8);
	// }
	// .bt-green-flash {
	// 	filter: brightness(0.8);
	// }

	@keyframes green-flash {
		0% {
			background-color: rgb(var(--color-green));
		}
		50% {
			background-color: rgb(var(--color-green)/0.8);
		}
		100% {
			background-color: rgb(var(--color-green));
		}
	}

	@keyframes red-flash {
		0% {
			background-color: rgb(var(--color-red));
		}
		50% {
			background-color: rgb(var(--color-red)/0.8);
		}
		100% {
			background-color: rgb(var(--color-red));
		}
	}

	.bt-green-flash {
		animation: green-flash 0.3s ease;
	}
	.bt-red-flash {
		animation: red-flash 0.3s ease;
	}
</style>
