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
	watch(
		() => changeRate.value,
		(val, old) => {
			if (startChangeColor.value) return
			if (val.toFixed(2) === old.toFixed(2)) return
			startChangeColor.value = true
			// 开始动画
			animationFrameId = requestAnimationFrame(animatonHandle)
		}
	)
	// 延迟等待销毁
	const animationend = () => {
		setTimeout(() => {
			startChangeColor.value = false
		}, 100)
	}

	// requetAnimationFrame
	// 这里可以使用requestAnimationFrame来处理动画
	let animationFrameId: number | null = null
	let startTimestamp = 0
	const animationDuration = 300 // 动画持续时间，单位毫秒
	// 颜色变化的 style
	const filterStyle = ref<string>('unset')
	// 动画执行函数
	const animatonHandle = (t: number) => {
		if (!startTimestamp) startTimestamp = t
		const progress = Math.min((t - startTimestamp) / animationDuration, 1)
		// 分两阶段：前 50% 升亮，后 50% 降暗
		let brightness = 0.8
		if (progress <= 0.5) {
			// 阶段1: 0.8 ➜ 1
			brightness = 0.8 + (1 - 0.8) * (progress / 0.5)
		} else {
			// 阶段2: 1 ➜ 0.8
			brightness = 1 - (1 - 0.8) * ((progress - 0.5) / 0.5)
		}
		filterStyle.value = `brightness(${brightness})`

		if (progress >= 1) {
			animationend()
			animationFrameId && cancelAnimationFrame(animationFrameId)
			animationFrameId = null
			startTimestamp = 0
		} else {
			animationFrameId = requestAnimationFrame(animatonHandle)
		}
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
		animationFrameId && cancelAnimationFrame(animationFrameId)
		animationFrameId = null
	})
</script>
<template>
	<div class="*:text-white *:px-2 *:w-16 *:h-7 *:rounded *:text-xs *:font-bold">
		<button class="bg-[var(--transparent10)] text-grey" v-if="!changeRate && !price?.last">-</button>
		<button :class="changeRate > 0 ? '!bg-[rgb(var(--color-green))]' : changeRate < 0 ? '!bg-[rgb(var(--color-red))]' : ''" :style="{ filter: filterStyle }">
			{{ formatChangeRate(changeRate, 2) }}%
		</button>
	</div>
</template>

<style lang="less" scoped>
	// 背景闪烁
	.bt-red-flash {
		filter: brightness(0.8);
		transition: filter 0.2s ease-in-out;
	}
	.bt-green-flash {
		filter: brightness(0.8);
		transition: filter 0.2s ease-in-out;
	}
</style>
