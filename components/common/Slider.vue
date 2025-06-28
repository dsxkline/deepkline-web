<script setup lang="ts">
	const props = defineProps<{
		modelValue: number
		step: number
		marks?: Record<number, string>
	}>()

	const emit = defineEmits<{
		(event: 'update:modelValue', value: number): void
	}>()

	let isMouseDown = ref(false) // 用于跟踪鼠标是否按下

	const mouseDown = (event: MouseEvent) => {
		event.preventDefault() // 阻止默认行为，避免选中文本
		const rect = (event.currentTarget as HTMLElement).getBoundingClientRect()
		let newValue = ((event.clientX - rect.left) / rect.width) * 100
		newValue = Math.max(0, Math.min(100, newValue)) // 限制在0-100之间
		if (props.step) {
			newValue = Math.round(newValue / props.step) * props.step // 按步长取整
		}
		emit('update:modelValue', newValue)
		isMouseDown.value = true
	}

	const mouseMove = (event: MouseEvent) => {
		if (!isMouseDown.value) return // 如果鼠标没有按下，则不处理移动事件
		const rect = (event.currentTarget as HTMLElement).getBoundingClientRect()
		let newValue = ((event.clientX - rect.left) / rect.width) * 100
		newValue = Math.max(0, Math.min(100, newValue)) // 限制在0-100之间
		if (props.step) {
			newValue = Math.round(newValue / props.step) * props.step // 按步长取整
		}
		emit('update:modelValue', newValue)
	}

	const mouseUp = (event: MouseEvent) => {
		isMouseDown.value = false // 鼠标松开时重置状态
	}

	const touchMove = (event: TouchEvent) => {
		isMouseDown.value = true // 鼠标松开时重置状态
		const touch = event.touches[0]
		const rect = (event.currentTarget as HTMLElement).getBoundingClientRect()
		let newValue = ((touch.clientX - rect.left) / rect.width) * 100
		newValue = Math.max(0, Math.min(100, newValue)) // 限制在0-100之间
		if (props.step) {
			newValue = Math.round(newValue / props.step) * props.step // 按步长取整
		}
		emit('update:modelValue', newValue)
	}
	const touchEnd = (event: TouchEvent) => {
		isMouseDown.value = false // 鼠标松开时重置状态
	}
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
				<span :style="{ left: val + '%' }" v-for="(label, val) in marks" class="w-1 h-1 rounded-full bg-[--transparent20]"></span>
			</div>
            <div
				class="slider-progress bg-green rounded-full absolute top-0 left-0 h-full"
				:style="{ width: modelValue + '%'}"
			></div>
			<div
				class="slider-progress-stops bg-green rounded-full absolute top-0 left-0 w-3 h-3"
				:style="{ left: modelValue + '%', transform: (modelValue <= 0 ? 'translateX(0)' : modelValue > 0 ? 'translateX(-50%)' : 'translateX(-100%)') + ' translateY(-30%)' }"
			></div>
			<div
				:style="{ left: modelValue + '%', transform: 'translateX(-50%) translateY(-150%)', opacity: isMouseDown ? '1' : '0' }"
				class="absolute bg-green overflow-hidden w-max rounded-full top-0 transition-[opacity] duration-200"
			>
				<div class="w-full h-full px-2 py-[2px] text-white">{{ modelValue }}%</div>
			</div>
		</div>

		<div class="slider-text text-xs text-muted w-full relative h-4 py-1 *:absolute [&_span]:-translate-x-1/2 last:[&_span]:-translate-x-full first:[&_span]:-translate-x-0" v-if="marks">
			<span :style="{ left: val + '%' }" v-for="(label, val) in marks">{{ label }}</span>
		</div>
	</div>
</template>
