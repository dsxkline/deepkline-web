<script setup lang="ts">
	const props = defineProps<{
		modelValue: number
		step: number
		marks?: Record<number, string>
		max?: number
		min?: number
		showTooltip?: boolean
	}>()

	const emit = defineEmits<{
		(event: 'update:modelValue', value: number): void
        (event: 'progress', value: number): void
	}>()

	const isMouseDown = ref(false) // 用于跟踪鼠标是否按下
	const maxValue = ref(100)
	const minValue = ref(0)
    const progressValue = ref(0) // 用于存储百分比值

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

    watch(
		() => progressValue.value,
		val => {
			console.log('szPercentddddddd', val)
            emit('update:modelValue', val) // 更新父组件的值
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
		<div class="slider-container w-full h-1 bg-[--transparent10] rounded-full relative">
			<div class="slider-stops text-xs text-muted w-full relative rounded-full *:absolute [&_span]:-translate-x-1/2 last:[&_span]:-translate-x-full first:[&_span]:-translate-x-0" v-if="marks">
				<span
					:style="{ left: valueToPercent(parseFloat(val)) + '%' }"
					v-for="val in Object.keys(marks).sort((a, b) => parseFloat(a) - parseFloat(b))"
					class="w-1 h-1 rounded-full bg-[--transparent20]"
				></span>
			</div>
			<div
				class="slider-progress bg-green rounded-full absolute top-0 left-0 h-full"
				:style="{
					width: (valueToPercent(progressValue) > valueToPercent(0) ? valueToPercent(progressValue) - valueToPercent(0) : valueToPercent(0) - valueToPercent(progressValue)) + '%',
					left: Math.min(valueToPercent(0), valueToPercent(progressValue)) + '%'
				}"
			></div>
			<div
				class="slider-progress-stops bg-green rounded-full absolute top-0 w-3 h-3"
				:style="{
					left: valueToPercent(progressValue) + '%',
					transform: (valueToPercent(progressValue) <= 0 ? 'translateX(0)' : valueToPercent(progressValue) > 0 ? 'translateX(-50%)' : 'translateX(-100%)') + ' translateY(-30%)'
				}"
			></div>
			<div
				:style="{ left: valueToPercent(progressValue) + '%', transform: 'translateX(-50%) translateY(-130%)', opacity: isMouseDown || showTooltip ? '1' : '0' }"
				class="slider-tooltip absolute bg-green overflow-hidden w-max rounded-full top-0 transition-[opacity] duration-200"
			>
				<div class="w-full h-full px-2 py-[2px] text-white text-sm">{{ progressValue }}%</div>
			</div>
		</div>

		<div class="slider-text text-xs text-muted w-full relative h-4 py-1 *:absolute [&_span]:-translate-x-1/2 last:[&_span]:-translate-x-full first:[&_span]:-translate-x-0" v-if="marks">
			<span :style="{ left: valueToPercent(parseFloat(val)) + '%' }" v-for="val in Object.keys(marks).sort((a, b) => parseFloat(a) - parseFloat(b))">{{ marks[val as any] }}</span>
		</div>
	</div>
</template>
