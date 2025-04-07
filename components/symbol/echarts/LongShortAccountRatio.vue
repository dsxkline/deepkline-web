<script lang="ts" setup>
	import { onMounted, ref } from 'vue'
	import * as echarts from 'echarts'
	import { ComposFetch } from '@/fetch'
	import { InstanceType, Period, type Instruments } from '@/fetch/okx/okx.type.d'
	import { useSymbolStore } from '~/store/symbol'
	const chart = ref(null)
	const period = ref('5m')
	const loading = ref(true)
	const error = ref('')
	const disabled = ref(false)
	const props = defineProps<{
		symbol: string
	}>()
	const symbolObj = computed<Instruments>(() => useSymbolStore().symbols[props.symbol])
	let echart: echarts.ECharts
	let xAxisData: string[] = []
	let seriesData: number[] = []
	// 在组件顶部声明 resizeObserver
	let resizeObserver: ResizeObserver | null = null
	const containerRef = ref(null)
	const width = ref<number>(0)
	const option = {
		// title: {
		// 	text: 'BTC 多空持仓比',
		// 	textStyle: {
		// 		fontSize: 10,
		// 		color: "#999"
		// 	}
		// },
		legend: {
			// data: ['BTC多空账户比'],
			icon: 'circle', // 可选值：'circle', 'rect', 'roundRect', 'triangle', 'diamond', 'pin', 'arrow', 'none'
			itemWidth: 6,
			itemHeight: 6,
			left: 0,
			textStyle: {
				fontSize: 12
			}
		},
		tooltip: {
			trigger: 'axis'
		},
		grid: {
			containLabel: true,
			top: '30', // 图表容器的上边距
			bottom: '30', // 图表容器的下边距
			left: '0', // 图表容器的左边距
			right: '0' // 图表容器的右边距
		},
		xAxis: {
			type: 'category',
			boundaryGap: true,
			data: xAxisData
		},
		yAxis: {
			type: 'value',
			boundaryGap: [0, '100%'],
			splitLine: {
				lineStyle: {
					color: '#eee'
				}
			}
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
				data: seriesData
			}
		]
	}

	function fetchData(p: Period) {
		if (disabled.value) return
		period.value = p
		disabled.value = true
		error.value = ''
		loading.value = true
		// 现货传币种，合约传id
		const symbol = symbolObj.value?.instType == InstanceType.SPOT ? symbolObj.value?.baseCcy:props.symbol
		const request = symbolObj.value?.instType == InstanceType.SPOT ? ComposFetch.tradingDataFetch.longShortAccountRatio : ComposFetch.tradingDataFetch.longShortAccountRatioContract
		request(symbol, p)
			.then(res => {
				// console.log(res?.data);
				loading.value = false
				disabled.value = false
				if (res?.code == 0) {
					xAxisData = []
					seriesData = []
					option.xAxis.data = xAxisData
					option.series[0].data = seriesData
					echart.setOption(option)
					res.data.forEach(([ts, longShortAccountRatio]: any) => {
						xAxisData.push(ts)
						seriesData.push(longShortAccountRatio)
					})
					option.xAxis.data = xAxisData
					option.series[0].data = seriesData
					echart.setOption(option)
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
	onMounted(() => {
		console.log(props.symbol, Period?.M5, process.server)
		nextTick(() => {
			fetchData(period.value as Period)
			echart = echarts.init(chart.value, 'light')
			echart.setOption(option)
		})

		if (containerRef.value) {
			resizeObserver = new ResizeObserver(entries => {
				for (let entry of entries) {
					// 获取父级的宽度和内边距paddingLeft
					const parentWidth = (parentElement.parentNode?.parentNode as HTMLElement).clientWidth
					const parentPaddingLeft = (parentElement.parentNode as HTMLElement).getBoundingClientRect().left - parentElement.getBoundingClientRect().left
					width.value = parentWidth - 2 * Math.abs(parentPaddingLeft)
					echart && echart.resize()
				}
			})
			// 监听父级元素宽度变化
			const parentElement = containerRef.value as HTMLElement
			if (parentElement) {
				resizeObserver.observe(parentElement.parentNode?.parentNode as HTMLElement)
			}
		}
	})

	onDeactivated(() => {
		if (echart) {
			echart.dispose()
		}
		if (resizeObserver) {
			resizeObserver.disconnect()
		}
	})
</script>
<template>
	<div class="w-full h-full border-b border-[--border-color] py-4" ref="containerRef" :style="{ width: width > 0 ? width + 'px' : 'auto' }">
		<div class="flex items-center justify-between mb-2">
		<h3 class="text-sm mb-1 flex items-center">
			<b class="text-base">多空持仓人数比</b>
		</h3>
		<el-radio-group v-model="period" class="" :disabled="disabled">
			<el-radio-button value="5m">5分钟</el-radio-button>
			<el-radio-button value="1H">1小时</el-radio-button>
			<el-radio-button value="1D">1天</el-radio-button>
		</el-radio-group>
		</div>
		<div class="container" v-show="!loading && !error">
			<div class="chart w-full h-[200px]" ref="chart"></div>
		</div>
		<el-skeleton :rows="5" animated v-if="loading && !error" />
		<el-result icon="error" title="错误提示" :sub-title="error" v-if="!loading && error">
			<template #extra>
				<el-button type="primary" @click.stop="fetchData(Period.M5)">点击刷新</el-button>
			</template>
		</el-result>
	</div>
</template>
<style lang="less" scoped></style>
