<script setup lang="ts">
	import type { SymbolDto } from '~/fetch/dtos/symbol.dto'
	import { type Ticker } from '~/fetch/okx/okx.type.d'
	const { t } = useI18n()
	const props = defineProps<{
		symbol: SymbolDto
	}>()
	const { $wsb, $ws } = useNuxtApp()
	const price = ref<Ticker | null>()
	const startChangeColor = ref(false)
	const changeRate = computed(() => {
		price.value = $ws.getTickers(props.symbol.symbol)
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
			// 阶段1: 1 ➜ 0.8
			brightness = 1 - (1 - 0.8) * (progress / 0.5)
		} else {
			// 阶段2: 0.8 ➜ 1
			brightness = 0.8 + (1 - 0.8) * ((progress - 0.5) / 0.5)
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
		$ws.addTickerHandler(props.symbol.symbol, tickerHandler)
	})
	onUnmounted(() => {
		price.value = null
		$ws.removeTickerHandler(props.symbol.symbol, tickerHandler)
		animationFrameId && cancelAnimationFrame(animationFrameId)
		animationFrameId = null
	})
</script>
<template>
	<div class="*:text-white *:px-2 *:w-16 *:h-7 *:rounded *:text-xs *:font-bold">
		<button class="bg-[var(--transparent10)] text-grey" v-if="!changeRate && !price?.last">-</button>
		<button v-else :class="changeRate > 0 ? 'bg-[rgb(var(--color-green))]' : changeRate < 0 ? 'bg-[rgb(var(--color-red))]' : 'bg-[var(--transparent10)]'" :style="{ filter: filterStyle }">
			{{ formatChangeRate(changeRate, 2) }}%
		</button>
	</div>
</template>
