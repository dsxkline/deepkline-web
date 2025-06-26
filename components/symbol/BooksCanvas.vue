<script setup lang="ts">
	import { onMounted, onBeforeUnmount, ref, watch } from 'vue'
	import { useRequestAnimation, type requestAnimationType } from '~/composable/useRequestAnimation'
	import type { BookEntry } from '~/fetch/okx/okx.type.d'

	const props = defineProps<{
		datas: BookEntry[]
		point: number
		pricePoint: number
		type: 'ask' | 'bid'
	}>()

	const canvasRef = ref<HTMLCanvasElement | null>(null)
	const containerRef = ref<HTMLDivElement | null>(null)

	const rowHeight = 12 + 8
	const titleHeight = 0
	const dpr = window.devicePixelRatio || 1

	let resizeObserver: ResizeObserver | null = null

	let lastRatio: Record<number, number> = {}

	function resizeAndDraw() {
		const canvas = canvasRef.value
		const container = containerRef.value
		if (!canvas || !container) return

		const { clientWidth: width, clientHeight: height } = container

		const rootStyles = getComputedStyle(document.documentElement)
		const color = props.type == 'bid' ? rootStyles.getPropertyValue('--color-red').trim() : rootStyles.getPropertyValue('--color-green').trim()

		// 物理分辨率适配 Retina
		canvas.width = width * dpr
		canvas.height = height * dpr
		canvas.style.width = width + 'px'
		canvas.style.height = height + 'px'

		const ctx = canvas.getContext('2d')
		if (!ctx) return

		ctx.scale(dpr, dpr) // 缩放绘图上下文
		ctx.clearRect(0, 0, width, height)

		// ctx.font = '10px Arial'
		ctx.textBaseline = 'middle'

		// const maxSize = Math.max(...props.datas.map(a => a.sz), 1)

		// 标题
		// ctx.fillStyle = '#000'
		// ctx.font = 'bold 13px Arial'
		// ctx.fillText('Price', 10, titleHeight / 2)
		// ctx.fillText('Size', width - 60, titleHeight / 2)

		// 数据行
		ctx.font = '12px Roboto'
		const visibleDatas = props.datas
		visibleDatas.forEach((data, i) => {
			const y = titleHeight + i * rowHeight
			const ratio = lastRatio[i] || 0
			const barWidth = ratio * width

			ctx.fillStyle = 'rgb(' + color + '/0.2)'
			ctx.fillRect(width - barWidth, y+1, barWidth, rowHeight-2)

			ctx.fillStyle = 'rgb(' + color + ')'
			const price = formatPrice(data.px, props.pricePoint)
			const amount = moneyFormat(formatPrice(data.sz, props.point), '', props.point)
			ctx.textAlign = 'left'
			ctx.fillText(price, 0, y + rowHeight / 2)
			ctx.textAlign = 'right'
			ctx.fillText(amount, width - 0, y + rowHeight / 2)
		})
	}
	let animations: Record<number,requestAnimationType> = {}
	function createAnimations() {
		props.datas.forEach((data, i) => {
			if(!animations[i]) animations[i] = useRequestAnimation()
		})
	}
    function clearAnimations(){
        Object.values(animations).forEach((animation,i) => {
            animation.stop()
            delete animations[i]
        });
        animations = {}
    }
	function animationUpdate() {
        createAnimations()
        const maxSize = Math.max(...props.datas.map(a => a.sz), 1)
       
		props.datas.forEach((data, i) => {
			const ratio = (data.sz / maxSize) * 2
            const lRatio = lastRatio[i]
            const animation = animations[i]
			animation.start({
				from: lRatio,
				to: ratio,
				duration: 200,
				onUpdate: value => {
                    lastRatio[i] = value
					resizeAndDraw()
				}
			})

			
		})
	}

	onMounted(() => {
		resizeAndDraw()
		
		resizeObserver = new ResizeObserver(resizeAndDraw)
		if (containerRef.value) {
			resizeObserver.observe(containerRef.value)
		}
	})

	onBeforeUnmount(() => {
		resizeObserver?.disconnect()
        clearAnimations()
	})

	watch(() => props.datas, animationUpdate, { deep: true })
</script>
<template>
	<div ref="containerRef" class="canvas-container w-full h-full">
		<canvas ref="canvasRef" />
	</div>
</template>
<style scoped>
	.canvas-container {
		width: 100%;
		height: 100%;
		position: relative;
	}
	canvas {
		display: block;
	}
</style>
