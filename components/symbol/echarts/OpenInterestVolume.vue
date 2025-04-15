<!-- 合约持仓量及交易量 -->
<script setup lang="ts">
	import { onMounted, ref } from 'vue'
	import * as echarts from 'echarts'
	import { ComposFetch } from '@/fetch'
	import { Period } from '@/fetch/okx/okx.type.d'
	import moment from 'moment'
	const chart = ref(null)
	const period = ref('5m')
	const loading = ref(true)
	const error = ref('')
	const props = defineProps<{
		symbol: string | null
	}>()
	let echart: echarts.ECharts
	let xAxisData: string[] = []
	let seriesData: number[] = []
	let seriesData2: number[] = []
	// 在组件顶部声明 resizeObserver
	let resizeObserver: ResizeObserver | null = null
	const containerRef = ref(null)
	const width = ref<number>(0)
	const disabled = ref(false)
	const option = {
		tooltip: {
			trigger: 'axis',
			axisPointer: {
				type: 'cross',
				crossStyle: {
					color: '#999'
				},
				label: {
					formatter: function (params:any) {
                        console.log('moneyFormat(value)',params)
						return params.axisDimension=="x"?moment(parseFloat(params.value)).format('MM/DD HH:mm'):moneyFormat(params.value) // 这里可以自定义格式
					}
				}
			}
		},
		legend: {
			// data: ['交易量', '持仓量'],
			// data: ['BTC多空账户比'],
			icon: 'circle', // 可选值：'circle', 'rect', 'roundRect', 'triangle', 'diamond', 'pin', 'arrow', 'none'
			itemWidth: 6,
			itemHeight: 6,
			left: 0
		},
		grid: {
			containLabel: true,
			top: '10', // 图表容器的上边距
			bottom: '30', // 图表容器的下边距
			left: '0', // 图表容器的左边距
			right: '0' // 图表容器的右边距
		},
		xAxis: [
			{
				type: 'category',
				data: xAxisData,
				axisPointer: {
					type: 'shadow'
				},
				axisLabel: {
					show: true,
					formatter: function (value: string, index: number) {
						// 转成时间
						return moment(parseFloat(value)).format('MM/DD HH:mm')
					}
				}
			}
		],
		yAxis: [
			{
				type: 'value',
				boundaryGap: [0, '100%'],
				axisLabel: {
					show: true,
					formatter: function (value: string, index: number) {
						return moneyFormat(value)
					}
				}
			},
			{
				type: 'value',
				boundaryGap: [0, '100%'],
				axisLabel: {
					show: true,
					formatter: function (value: string, index: number) {
						return moneyFormat(value)
					}
				}
			}
		],
		series: [
			{
				name: '交易量',
				type: 'bar',
				smooth: true,
				tooltip: {
					valueFormatter: function (value: any) {
						return moneyFormat(value)
					}
				},
				data: seriesData
			},
			{
				name: '持仓量',
				type: 'line',
				smooth: true,
				yAxisIndex: 1,
				tooltip: {
					valueFormatter: function (value: any) {
						return moneyFormat(value)
					}
				},
				data: seriesData2
			}
		]
	}

	function createEchart() {
		echart && echart.dispose()
		echart = echarts.init(chart.value, useColorMode().value == 'dark' ? 'dark' : 'light')
		echart.setOption(option)
		echart && echart.resize()
	}

	function fetchData(p: Period) {
		if (disabled.value) return
		disabled.value = true
		period.value = p
		error.value = ''
		// loading.value = true;
		ComposFetch.tradingDataFetch
			.openInterestVolume('BTC', p)
			.then(res => {
				// console.log(res?.data);
				loading.value = false
				disabled.value = false
				if (res?.code == 0) {
					xAxisData = []
					seriesData = []
					seriesData2 = []
					option.xAxis[0].data = xAxisData
					option.series[0].data = seriesData
					option.series[1].data = seriesData2
					res.data.forEach(([ts, position, volume]: any) => {
						xAxisData.push(ts)
						seriesData.push(volume)
						seriesData2.push(position)
					})
					option.xAxis[0].data = xAxisData
					option.series[0].data = seriesData
					option.series[1].data = seriesData2
					createEchart()
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
		nextTick(() => {
			fetchData(period.value as Period)
		})
		if (containerRef.value) {
			resizeObserver = new ResizeObserver(entries => {
				for (let entry of entries) {
					// 获取父级的宽度和内边距paddingLeft
					const parentWidth = (parentElement.parentNode as HTMLElement).clientWidth
					const parentPaddingLeft = (parentElement.parentNode as HTMLElement).getBoundingClientRect().left - parentElement.getBoundingClientRect().left
					width.value = parentWidth - 2 * Math.abs(parentPaddingLeft)
					echart && echart.resize({ width: width.value })
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
	<div class="w-full h-full mt-2 border-b border-[--border-color] pb-3 mb-3 min-h-[350px] flex flex-col justify-between" ref="containerRef" :style="{ width: width > 0 ? width + 'px' : 'auto' }">
		<div class="flex items-center justify-between mb-2">
			<h3 class="text-sm mb-1 flex items-center">
				<b class="text-base">持仓量及成交量</b>
			</h3>
			<el-radio-group v-model="period" :disabled="disabled">
				<el-radio-button value="5m">5分钟</el-radio-button>
				<el-radio-button value="1H">1小时</el-radio-button>
				<el-radio-button value="1D">1天</el-radio-button>
			</el-radio-group>
		</div>

		<div class="container w-full h-full flex-1" v-show="!loading && !error">
			<div class="chart w-full h-[285px]" ref="chart"></div>
		</div>
		<el-skeleton :rows="7" animated v-if="loading && !error" />
		<el-result icon="error" title="错误提示" :sub-title="error" v-if="!loading && error">
			<template #extra>
				<el-button type="primary" @click.stop="fetchData(Period.M5)">点击刷新</el-button>
			</template>
		</el-result>
	</div>
</template>
<style lang="less" scoped></style>
