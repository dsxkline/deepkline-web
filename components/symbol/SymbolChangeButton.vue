<script setup lang="ts">
	import { InstanceType, type Instruments, type Ticker } from '~/fetch/okx/okx.type.d'
	import { useSymbolStore } from '~/store/symbol'
	const props = defineProps<{
		symbol: Instruments
	}>()
	const { $wsb, $ws } = useNuxtApp()
	const price = ref<Ticker | null>()
	const changeRate = computed(() => {
		price.value = $ws.getTickers(props.symbol.instId)
		return price.value?.last && price.value?.sodUtc8 ? ((parseFloat(price.value?.last) - parseFloat(price.value?.sodUtc8)) / parseFloat(price.value?.sodUtc8)) * 100 : 0
	})
	const changeColor = ref('')
    let timer: NodeJS.Timeout | null = null
	watch(
		() => changeRate.value,
		(val, old) => {
            if(timer) {
                return
            }
			changeColor.value = ''
			if (val.toFixed(2) != old.toFixed(2)) changeColor.value = val>0?'bt-green-flash':'bt-red-flash'
            timer = setTimeout(() => {
                changeColor.value = ''
                timer = null
            }, 300);
			// console.log('changerate', val, old)
		}
	)

	
	const tickerHandler = (data: Ticker) => {
		price.value = data
	}
	onMounted(() => {
		$ws.addTickerHandler(props.symbol.instId, tickerHandler)
	})
	onUnmounted(() => {
        if(timer) clearTimeout(timer)
		price.value = null
		$ws.removeTickerHandler(props.symbol.instId, tickerHandler)
	})
</script>
<template>
	<div class="*:text-white *:px-2 *:w-16 *:h-7 *:rounded *:text-xs *:font-bold">
		<button class="bg-[var(--transparent10)] text-grey" v-if="!changeRate && !price?.last">-</button>
		<button :class="['transition-all duration-300 bg-[var(--transparent10)]',changeRate > 0 ? '!bg-[rgb(var(--color-green))]' : '', changeRate < 0 ? '!bg-[rgb(var(--color-red))]' : '', changeColor]" v-else>{{ formatChangeRate(changeRate, 2) }}%</button>
	</div>
</template>

<style lang="less" scoped>
	// 背景闪烁
	.bt-red-flash {
		filter: brightness(0.8);
	}
	.bt-green-flash {
        filter: brightness(0.8);
	}
</style>
