<script setup lang="ts">
	import { onMounted, ref } from 'vue'
	import * as echarts from 'echarts'
	import { ComposFetch } from '@/fetch'
	import { Period } from '@/fetch/okx/okx.type.d'
	import { useSymbolStore } from '~/store/symbol'
	import { useStore } from '~/store'
	import { useWillAppear, useWillDisappear } from '~/composable/usePush'
	import type { SymbolDto } from '~/fetch/dtos/symbol.dto'
	const chart = ref(null)
	const period = ref('1D')
	const loading = ref(true)
	const error = ref('')
	const props = defineProps<{
		symbol: string
	}>()
	const symbolObj = computed<SymbolDto>(() => useSymbolStore().symbols[props.symbol])
	let echart: echarts.ECharts | null
	let seriesData: number[] | null = []
	// 在组件顶部声明 resizeObserver
	let resizeObserver: ResizeObserver | null = null
	const containerRef = ref(null)
	const width = ref<number>(0)
	const height = ref<number>(0)
	const disabled = ref(false)
	const option = {
		legend: {
			icon: 'circle', // 可选值：'circle', 'rect', 'roundRect', 'triangle', 'diamond', 'pin', 'arrow', 'none'
			itemWidth: 6,
			itemHeight: 6,
			left: 0
		},
		grid: {
			containLabel: false,
			top: '0', // 图表容器的上边距
			bottom: '0', // 图表容器的下边距
			left: '0', // 图表容器的左边距
			right: '0' // 图表容器的右边距
		},
		xAxis: {
			type: 'category',
			boundaryGap: false
		},
		yAxis: {
			type: 'value'
		},
		series: [
			{
				name: '',
				type: 'line',
				smooth: true,
				showSymbol: false,
				sampling: 'lttb',
				itemStyle: {
					color: 'rgb(255, 70, 131)'
				},
				areaStyle: {
					color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
						{
							offset: 0,
							color: 'rgba(255, 70, 131,0.3)'
						},
						{
							offset: 1,
							color: 'rgba(255, 70, 131,0.0)'
						}
					])
				},
				data: []
			}
		]
	}

	function createEchart() {
		echart && echart.dispose()
		echart = echarts.init(chart.value, useStore().theme == 'dark' ? 'dark' : 'light')
		echart.setOption(option)
	}

	function updateEChart(seriesData: any, animation: boolean = false) {
		echart &&
			echart.setOption({
				series: [
					{
						data: seriesData
					}
				]
			})
		resetSize(animation)
	}

	function fetchData(p: Period, load = false) {
		if (disabled.value) return
		disabled.value = true
		period.value = p
		error.value = ''
		if (load) loading.value = true
		ComposFetch.tradingDataFetch
			.loanRatio(symbolObj.value?.baseCoin || symbolObj.value?.marginCoin, p)
			.then(res => {
				// console.log(res?.data);
				loading.value = false
				disabled.value = false
				if (res?.code == 0) {
					seriesData = []
					res.data.slice(0, 50).forEach(([ts, longShortAccountRatio]: any) => {
						seriesData && seriesData.push(longShortAccountRatio)
					})
					// option.series[0].data = seriesData.reverse()
					updateEChart(seriesData.reverse(), true)
					// console.log(xAxisData,seriesData);
				} else {
					error.value = res?.msg || '获取数据失败'
				}
			})
			.catch(() => {
				loading.value = false
				disabled.value = false
				error.value = '网络不给力'
			})
	}
	watch(
		() => period.value,
		newVal => {
			fetchData(newVal as Period)
		}
	)

	watch(
		() => props.symbol,
		val => {
			fetchData(period.value as Period, true)
		}
	)

	watch(
		() => useStore().theme,
		() => {
			createEchart()
			// updateEChart(option)
		}
	)

	function resetSize(animation: boolean = false) {
		// 获取父级的宽度和内边距paddingLeft
		if (containerRef.value) {
			const parentElement = containerRef.value as HTMLElement
			width.value = parentElement.offsetWidth
			height.value = parentElement.offsetHeight
			const animationOption: any = animation
				? {
						duration: 200,
						easing: 'bounceIn'
				  }
				: null
			echart && echart.resize({ width: width.value, height: height.value, animation: animationOption })
		}
	}

	onMounted(() => {
		createEchart()
		nextTick(() => {
			fetchData(period.value as Period)
		})
		if (containerRef.value) {
			resizeObserver = new ResizeObserver(entries => {
				for (let entry of entries) {
					resetSize(false)
				}
			})
			// 监听父级元素宽度变化
			const parentElement = containerRef.value as HTMLElement
			if (parentElement) {
				resizeObserver.observe(parentElement.parentNode as HTMLElement)
			}
		}
	})

	useWillAppear(() => {
		// createEchart()
		updateEChart(seriesData)
	})

	onBeforeUnmount(() => {
		chart.value = null
		echart && echart.dispose()
		echart = null
		if (resizeObserver) {
			resizeObserver.disconnect()
		}
		resizeObserver = null
		containerRef.value = null
		seriesData = null
	})
</script>
<template>
	<div class="flex flex-col justify-between" ref="containerRef">
		<div class="container w-full h-full" v-show="!loading && !error" :style="{ width: width > 0 ? width + 'px' : '100%', height: height > 0 ? height + 'px' : '100%' }">
			<div class="chart w-full h-full" ref="chart"></div>
		</div>
	</div>
</template>
<style lang="less" scoped></style>
