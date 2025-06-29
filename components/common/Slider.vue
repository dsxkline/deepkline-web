<script setup lang="ts">
	const props = defineProps<{
		modelValue: number
		step: number
		marks?: Record<number, string>
		max?: number
		min?: number
		showTooltip?: boolean
		hideMaskText?: boolean
	}>()

	const emit = defineEmits<{
		(event: 'update:modelValue', value: number): void
		(event: 'progress', value: number): void
	}>()

	const isMouseDown = ref(false) // 用于跟踪鼠标是否按下
	const maxValue = ref(100)
	const minValue = ref(0)
	const progressValue = ref(0) // 用于存储百分比值
	const sliderProgressStops = ref<HTMLElement | null>(null)
	const tooltip = ref<HTMLElement | null>(null)
	const sliderContainer = ref<HTMLElement | null>(null)

	const mouseDown = (event: MouseEvent) => {
		event.preventDefault() // 阻止默认事件，避免页面滚动
		const rect = (event.currentTarget as HTMLElement).getBoundingClientRect()
		let newValue = ((event.clientX - rect.left) / rect.width) * 100
		// newValue = Math.max(0, Math.min(100, newValue)) // 限制在0-100之间
		// console.log('mouseDown', newValue, maxValue.value, minValue.value)
		updateValue(newValue)
		isMouseDown.value = true
	}

	const mouseMove = (event: MouseEvent) => {
		if (!isMouseDown.value) return // 如果鼠标没有按下，则不处理移动事件
		const rect = (event.currentTarget as HTMLElement).getBoundingClientRect()
		let newValue = ((event.clientX - rect.left) / rect.width) * 100
		console.log('mouseMove', newValue)
		// newValue = Math.max(0, Math.min(100, newValue)) // 限制在0-100之间
		updateValue(newValue)
	}

	const mouseUp = (event: MouseEvent) => {
		isMouseDown.value = false // 鼠标松开时重置状态
	}

	const touchMove = (event: TouchEvent) => {
		event.preventDefault() // 阻止默认事件，避免页面滚动
		isMouseDown.value = true // 鼠标松开时重置状态
		const touch = event.touches[0]
		const rect = (event.currentTarget as HTMLElement).getBoundingClientRect()
		let newValue = ((touch.clientX - rect.left) / rect.width) * 100
		console.log('touchMove', newValue)
		// newValue = Math.max(0, Math.min(100, newValue)) // 限制在0-100之间
		updateValue(newValue)
	}
	const touchEnd = (event: TouchEvent) => {
		isMouseDown.value = false // 鼠标松开时重置状态
	}

	const updateValue = (value: number) => {
		let newValue = percentToValue(value) // 将百分比转换为实际值

		const point = String(props.step).split('.')
		if (point.length > 1) {
			newValue = parseFloat(newValue.toFixed(point[1].length)) // 保留小数点后位数
		} else {
			newValue = Math.round(newValue) // 如果没有小数点，直接取整
		}

		newValue = Math.min(newValue, maxValue.value) // 限制最大值
		newValue = Math.max(newValue, minValue.value) // 限制最小值
		console.log('updateValue', newValue, maxValue.value, minValue.value)
		progressValue.value = newValue // 更新百分比值
		emit('progress', newValue) // 触发进度更新事件
	}

	const setMaxMinValue = () => {
		const marksFirst = props.marks ? Object.keys(props.marks).sort((a, b) => parseFloat(a) - parseFloat(b))[0] : undefined
		const masksLast = props.marks ? Object.keys(props.marks).sort((a, b) => parseFloat(a) - parseFloat(b))[Object.keys(props.marks).length - 1] : undefined
		maxValue.value = parseFloat(String(props.max !== undefined ? props.max : masksLast != undefined ? masksLast : 100)) // 默认最大值为100
		minValue.value = parseFloat(String(props.min !== undefined ? props.min : marksFirst != undefined ? marksFirst : 0)) // 默认最小
	}

	const valueToPercent = (val: number) => {
		const result = ((val - minValue.value) / (maxValue.value - minValue.value)) * 100
		//console.log('valueToPercent', val,result)
		return result
	}
	const percentToValue = (percent: number) => {
		return minValue.value + (percent / 100) * (maxValue.value - minValue.value)
	}
	const tooltipTransform = computed(() => {
		if (tooltip.value) {
			const width = sliderContainer.value ? sliderContainer.value.clientWidth : 0
			const rect = tooltip.value.getBoundingClientRect()
			const left = (valueToPercent(progressValue.value) * width) / 100
			console.log('tooltipTransform', left, rect.width / 2, width)
			if (left - rect.width / 2 <= 0) {
				return `translateX(calc(-50% + ${rect.width / 2 - left}px)) translateY(-130%)`
			} else if (left + rect.width / 2 >= width) {
				return `translateX(calc(-50% + ${width - left - rect.width / 2}px)) translateY(-130%)`
			}
			return `translateX(-50%) translateY(-130%)`
		}
		return 'translateX(0) translateY(-130%)'
	})

	watch(
		() => progressValue.value,
		val => {
			console.log('szPercentddddddd', val)
			emit('update:modelValue', val) // 更新父组件的值
		}
	)

	watch(
		() => props.modelValue,
		val => {
			console.log('props.modelValue', val)
			progressValue.value = val // 更新进度值
		}
	)

	onMounted(() => {
		setMaxMinValue()
	})
</script>
<template>
	<div
		class="slider-wrapper flex flex-col items-center justify-center w-full h-full py-3 px-0 cursor-pointer"
		@mouseup.stop="mouseUp"
		@mousemove.stop="mouseMove"
		@touchstart.stop="touchMove"
		@touchmove.stop="touchMove"
		@mousedown.stop="mouseDown"
		@touchend.stop="touchEnd"
	>
		<div class="slider-container w-full h-[2px] bg-[--transparent20] rounded-full relative z-[99999]" ref="sliderContainer">
			<div
				class="slider-progress bg-[--slider-border-color] rounded-full absolute top-0 left-0 h-full"
				:style="{
					width: (valueToPercent(progressValue) > valueToPercent(0) ? valueToPercent(progressValue) - valueToPercent(0) : valueToPercent(0) - valueToPercent(progressValue)) + '%',
					left: Math.min(valueToPercent(0), valueToPercent(progressValue)) + '%'
				}"
			></div>
			<div class="slider-stops text-xs text-muted w-full relative rounded-full *:absolute [&_span]:-translate-x-1/2 last:[&_span]:-translate-x-full first:[&_span]:-translate-x-0" v-if="marks">
				<span
					:style="{
						left: valueToPercent(parseFloat(val)) + '%',
						borderColor: (progressValue > 0 && progressValue > parseFloat(val)) || (progressValue < 0 && progressValue < parseFloat(val)) ? 'var(--slider-border-color)' : 'var(--transparent20)'
					}"
					v-for="val in Object.keys(marks).sort((a, b) => parseFloat(a) - parseFloat(b))"
					class="w-2 h-2 rounded-full bg-base border-2 border-[--transparent20] -translate-y-1/3"
				></span>
			</div>

			<div
				ref="sliderProgressStops"
				class="slider-progress-stops bg-base border-[3px] border-[--slider-border-color] rounded-full absolute top-0 w-3 h-3"
				:style="{
					left: valueToPercent(progressValue) + '%',
					transform:
						(valueToPercent(progressValue) <= valueToPercent(minValue) ? 'translateX(-25%)' : valueToPercent(progressValue) < valueToPercent(maxValue) ? 'translateX(-50%)' : 'translateX(-75%)') +
						' translateY(-40%)'
				}"
			></div>
			<div
				ref="tooltip"
				:style="{ left: valueToPercent(progressValue) + '%', opacity: isMouseDown || showTooltip ? '1' : '0', transform: tooltipTransform }"
				class="slider-tooltip absolute bg-[--slider-border-color] overflow-hidden w-max rounded-full top-0 transition-[opacity] duration-200 z-[99999]"
			>
				<div class="w-full h-full px-2 py-[2px] text-white text-xs">{{ progressValue }}%</div>
			</div>
		</div>

		<div
			class="slider-text text-[10px] text-muted w-full relative h-4 py-1 *:absolute [&_span]:-translate-x-1/2 last:[&_span]:-translate-x-full first:[&_span]:-translate-x-0"
			v-if="marks && !hideMaskText"
		>
			<span :style="{ left: valueToPercent(parseFloat(val)) + '%' }" v-for="val in Object.keys(marks).sort((a, b) => parseFloat(a) - parseFloat(b))">{{ marks[val as any] }}</span>
		</div>
	</div>
</template>
<style scoped lang="less">
	.slider-wrapper {
		--slider-border-color: rgb(var(--color-green));
	}
</style>
