<template>
	<div>
		<svg viewBox="0 0 200 100" class="w-full h-auto">
			<!-- 定义渐变 -->
			<defs>
				<linearGradient id="rainbowGradient" gradientUnits="userSpaceOnUse" x1="40" y1="100" x2="180" y2="100">
					<!-- <stop offset="0%" stop-color="red" /> -->
					<stop offset="0%" :stop-color="red" />
					<!-- 红 -->
					<stop offset="15%" :stop-color="orange" />
					<!-- 橙 -->
					<stop offset="70%" :stop-color="yellow" />
					<!-- 黄 -->
					<stop offset="100%" :stop-color="green" />
					<!-- 绿 -->
				</linearGradient>

                <linearGradient id="innerLine" gradientUnits="userSpaceOnUse" x1="40" y1="100" x2="180" y2="100">
					<stop offset="0%" :stop-color="red" stop-opacity="0.3"/>
					<stop offset="100%" :stop-color="color" stop-opacity="0.1"/>
				</linearGradient>

				<!-- 定义从圆心发散的径向渐变 -->
				<radialGradient id="grad1"  cx="50%" cy="50%" r="50%">
					<stop offset="0%" :stop-color="red" stop-opacity="1"/>
					<stop offset="100%" :stop-color="color" stop-opacity="0.5"/>
				</radialGradient>
                <radialGradient id="grad2"  cx="100%" cy="100%" r="100%">
					<stop offset="0%" :stop-color="red" stop-opacity="0"/>
					<stop offset="100%" :stop-color="color" stop-opacity="1"/>
				</radialGradient>

				<!-- 模糊滤镜 -->
				<!-- <filter id="blur" x="-50%" y="-50%" width="200%" height="200%">
					<feGaussianBlur in="SourceGraphic" stdDeviation="8" />
				</filter> -->

				<!-- 渐变 -->
				<radialGradient id="pulseGradient" cx="50%" cy="50%" r="50%">
					<stop offset="0%" :stop-color="color" stop-opacity="1" />
					<stop offset="100%" :stop-color="color" stop-opacity="0" />
				</radialGradient>
			</defs>

			<!-- 半圆渐变弧 -->
			<path :d="describeArc(100, 100, radius, -90, 90)" fill="none" stroke="url(#rainbowGradient)" stroke-width="10" />
            <path :d="describeArc(100, 100, radius-10, -90, 90)" fill="none" stroke="url(#innerLine)" stroke-width="1" />

			<!-- 扇形区域 -->
			<path :d="generateSectorPath(100, 100, radius, -90, value - 90)" fill="url(#grad2)" fill-opacity="0.2" />

			<!-- 背后柔光扩散圈 -->
			<circle :cx="pointerPos.x" :cy="pointerPos.y" r="30" fill="url(#grad1)" filter="url(#blur)" opacity="1">
				<animate attributeName="r" values="12;40;12" dur="3s" repeatCount="indefinite" />
				<animate attributeName="opacity" values="0.6;0.0;0.0" dur="3s" repeatCount="indefinite" />
			</circle>

			<!-- 中间呼吸灯 -->
			<circle :cx="pointerPos.x" :cy="pointerPos.y" r="12" fill="url(#grad1)" filter="url(#blur)">
				<animate attributeName="r" values="6;30" dur="3s" repeatCount="indefinite"  />
				<animate attributeName="opacity" values="1;0.5;0" dur="3s" repeatCount="indefinite" />
			</circle>

            <!-- 圆点指示当前值 -->
			<circle :cx="pointerPos.x" :cy="pointerPos.y" r="8" fill="rgba(0,0,0,0)" stroke="#000000" stroke-width="3" />
			<circle :cx="pointerPos.x" :cy="pointerPos.y" r="6" fill="rgba(0,0,0,0)" stroke="#ffffff" stroke-width="3" />
		</svg>
	</div>
</template>

<script setup lang="ts">
	import { computed } from 'vue'
	import { useRequestAnimation } from '~/composable/useRequestAnimation'

	const props = defineProps<{
		value: number // 0 ~ 100
		color: string
	}>()

	const emit = defineEmits(['update:color'])

	// 红
	const red = ref('#FF4500')
	const orange = ref('#FFA500')
	const yellow = ref('#EEB422')
	const green = ref('#32CD32')

	const radius = 80
	const cx = 100
	const cy = 100

	const moveVal = ref(0)

	// 计算对应角度（0~100 映射 180° ~ 0°）
	const angle = computed(() => 270 + (props.value / 180) * 180)
	const angleMove = computed(() => 270 + (moveVal.value / 180) * 180)

	const pointerPos = computed(() => polarToCartesian(cx, cy, radius, angle.value))
	const movePos = computed(() => polarToCartesian(cx, cy, radius, angleMove.value))

	function describeArc(x: number, y: number, r: number, start: number, end: number) {
		const startPoint = polarToCartesian(x, y, r, start)
		const endPoint = polarToCartesian(x, y, r, end)
		const largeArcFlag = end - start <= 180 ? 0 : 1
		return `M ${startPoint.x} ${startPoint.y} A ${r} ${r} 0 ${largeArcFlag} 1 ${endPoint.x} ${endPoint.y}`
	}

	function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
		const rad = ((angleDeg - 90) * Math.PI) / 180
		return {
			x: cx + r * Math.cos(rad),
			y: cy + r * Math.sin(rad)
		}
	}

	function generateSectorPath(cx: number, cy: number, r: number, startAngle: number, endAngle: number) {
		const startX = cx + r * Math.cos(startAngle)
		const startY = cy + r * Math.sin(startAngle)
		const endX = cx + r * Math.cos(endAngle)
		const endY = cy + r * Math.sin(endAngle)

		const startPoint = polarToCartesian(cx, cy, r, startAngle)
		const endPoint = polarToCartesian(cx, cy, r, endAngle)

		const largeArcFlag = endAngle - startAngle <= 180 ? 0 : 1

		// 构建路径字符串
		return `M ${cx} ${cy} 
              L ${startPoint.x} ${startPoint.y} 
              A ${r} ${r} 0 ${largeArcFlag} 1 ${endPoint.x} ${endPoint.y} 
              Z`
	}

	function interpolateColor(color1: string, color2: string, factor: number) {
		const c1 = parseInt(color1.slice(1), 16)
		const c2 = parseInt(color2.slice(1), 16)

		const r1 = (c1 >> 16) & 0xff
		const g1 = (c1 >> 8) & 0xff
		const b1 = c1 & 0xff

		const r2 = (c2 >> 16) & 0xff
		const g2 = (c2 >> 8) & 0xff
		const b2 = c2 & 0xff

		const r = Math.round(r1 + (r2 - r1) * factor)
		const g = Math.round(g1 + (g2 - g1) * factor)
		const b = Math.round(b1 + (b2 - b1) * factor)

		return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`
	}

	function getColorFromFourStops(p: number) {
		const stops = [
			{ offset: 0.0, color: red.value },
			{ offset: 0.15, color: orange.value },
			{ offset: 0.7, color: yellow.value },
			{ offset: 1.0, color: green.value }
		]

		for (let i = 0; i < stops.length - 1; i++) {
			const start = stops[i],
				end = stops[i + 1]
			if (p >= start.offset && p <= end.offset) {
				const localP = (p - start.offset) / (end.offset - start.offset)
				return interpolateColor(start.color, end.color, localP)
			}
		}

		return stops[stops.length - 1].color // 默认返回最后一个颜色
	}

	watch(
		() => props.value,
		val => {
			const color = getColorFromFourStops(val / 180) // 结果接近黄绿之间的颜色
			emit('update:color', color)
		}
	)

	// const animation = useRequestAnimation()

	onMounted(() => {
		// let from = 0
		// let to = 20
		// animation.start({
		// 	from: from,
		// 	to: to,
		// 	duration: 900,
		// 	loop: true,
		// 	onUpdate: (val: number) => {
		// 		moveVal.value = val
		// 	}
		// })
	})
	onBeforeUnmount(() => {
		// animation.stop()
	})
</script>
