<!-- 杠杆多空比 -->
<script setup lang="ts">
	import { onMounted, ref } from 'vue'
	import * as echarts from 'echarts'
	import { ComposFetch } from '@/fetch'
	import { InstanceType, Period, type Instruments } from '@/fetch/okx/okx.type.d'
	import moment from 'moment'
	import { useSymbolStore } from '~/store/symbol'
import { useStore } from '~/store'
	const chart = ref(null)
	const period = ref('1H')
	const loading = ref(true)
	const error = ref('')
	const props = defineProps<{
		symbol: string
	}>()
	const symbolObj = computed<Instruments>(() => useSymbolStore().symbols[props.symbol])
	let echart: echarts.ECharts | null
	let xAxisData: string[] | null = []
	let seriesData: number[] | null = []
	let seriesData2: number[] | null = []
	// 在组件顶部声明 resizeObserver
	let resizeObserver: ResizeObserver | null = null
	const containerRef = ref(null)
	const width = ref<number>(0)
	const disabled = ref(false)
	const option = {
		legend: {
			icon: 'circle', // 可选值：'circle', 'rect', 'roundRect', 'triangle', 'diamond', 'pin', 'arrow', 'none'
			itemWidth: 6,
			itemHeight: 6,
			bottom: '0'
		},
		tooltip: {
			trigger: 'axis'
		},
		grid: {
			containLabel: true,
			top: '10', // 图表容器的上边距
			bottom: '40', // 图表容器的下边距
			left: '0', // 图表容器的左边距
			right: '0' // 图表容器的右边距
		},
		xAxis: {
			type: 'category',
			boundaryGap: false,
			data: xAxisData,
			axisLabel: {
				show: true,
				interval: function (index: number, value: string) {
					// 显示固定三个刻度
					const total = xAxisData?.length || 0 // 总共数据长度
					const showIndex = [0, Math.floor(total / 2), total - 1]
					return showIndex.includes(index)
				},
				rich: {
					l: {
						padding: [0, -70, 0, 0] // 偏移量可根据label文字长度计算
					},
					r: {
						padding: [0, 70, 0, 0] // 偏移量可根据label文字长度计算
					}
				},
				formatter: function (value: string, index: number) {
					if (index === 0) {
						return `{l|${value}}`
					}
					if (xAxisData && index === xAxisData.length - 1) {
						return `{r|${value}}`
					}
					return value
				}
			}
		},
		yAxis: {
			type: 'value',
			boundaryGap: [0, 0],
			axisLabel: {
				show: true,
				formatter: function (value: number) {
					return moneyFormat(value, '', 0)
				}
			}
		},
		series: [
			{
				name: '主动买入量',
				type: symbolObj.value?.instType == InstanceType.SPOT ? 'bar' : 'line',
				showSymbol: false,
				smooth: true,
				itemStyle: {
					color: 'rgb(45 189 133)'
				},
				emphasis: {
					lineStyle: { color: 'rgb(45 189 133)' },
					itemStyle: {
						color: 'rgb(45 189 133)' // ✅ 鼠标悬停时保持线颜色
					}
				},
				tooltip: {
					valueFormatter: function (value: any) {
						return moneyFormat(value)
					}
				},
				data: seriesData
			},
			{
				name: '主动卖出量',
				type: symbolObj.value?.instType == InstanceType.SPOT ? 'bar' : 'line',
				showSymbol: false,
				smooth: true,
				itemStyle: {
					color: 'rgb(245 70 92)'
				},
				emphasis: {
					lineStyle: { color: 'rgb(245 70 92)' },
					itemStyle: {
						color: 'rgb(245 70 92)' // ✅ 鼠标悬停时保持线颜色
					}
				},
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
		echart = echarts.init(chart.value, useStore().theme == 'dark' ? 'dark' : 'light')
		echart.setOption(option)
		resetSize()
	}

	function fetchData(p: Period, load = false) {
		if (disabled.value) return
		disabled.value = true
		period.value = p
		error.value = ''
		if (load) loading.value = true
		// 现货传币种，合约传id
		const symbol = symbolObj.value?.instType == InstanceType.SPOT ? symbolObj.value?.baseCcy : props.symbol
		const request = symbolObj.value?.instType == InstanceType.SPOT ? ComposFetch.tradingDataFetch.takerVolumne : ComposFetch.tradingDataFetch.takerVolumeContract
		request(symbol, symbolObj.value?.instType, p)
			.then(res => {
				// console.log(res?.data);
				loading.value = false
				disabled.value = false
				if (res?.code == 0) {
					xAxisData = []
					seriesData = []
					seriesData2 = []
					res.data.slice(0, 20).forEach(([ts, buyVol, sellVol]: any) => {
						if (p == Period.M5) xAxisData && xAxisData.push(moment(parseFloat(ts)).format('MM/DD HH:mm'))
						if (p == Period.H1) xAxisData && xAxisData.push(moment(parseFloat(ts)).format('MM/DD HH:mm'))
						if (p == Period.D1) xAxisData && xAxisData.push(moment(parseFloat(ts)).format('YYYY/MM/DD'))
						seriesData && seriesData.push(buyVol)
						seriesData2 && seriesData2.push(sellVol)
					})
					option.xAxis.data = xAxisData.reverse()
					option.series[0].data = seriesData.reverse()
					option.series[1].data = seriesData2.reverse()
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
		}
	)

	function resetSize() {
		// 获取父级的宽度和内边距paddingLeft
		if (containerRef.value) {
			const parentElement = containerRef.value as HTMLElement
			const parentWidth = (parentElement.parentNode as HTMLElement).clientWidth
			const parentPaddingLeft = (parentElement.parentNode as HTMLElement).getBoundingClientRect().left - parentElement.getBoundingClientRect().left
			width.value = parentWidth - 2 * Math.abs(parentPaddingLeft)
			echart && echart.resize({ width: width.value })
		}
	}

	onMounted(() => {
		nextTick(() => {
			fetchData(period.value as Period)
		})
		if (containerRef.value) {
			resizeObserver = new ResizeObserver(entries => {
				for (let entry of entries) {
					resetSize()
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
	onBeforeUnmount(() => {
		chart.value = null
		echart && echart.dispose()
		echart = null
		if (resizeObserver) {
			resizeObserver.disconnect()
		}
		resizeObserver = null
		containerRef.value = null
		xAxisData = null
		seriesData = null
	})
</script>
<template>
	<div class="w-full h-full mt-2 border-b border-[--border-color] py-4 min-h-[350px] flex flex-col justify-between" ref="containerRef" :style="{ width: width > 0 ? width + 'px' : 'auto' }">
		<div class="flex items-center justify-between mb-2">
			<h3 class="text-sm flex items-center">
				<b class="text-base">主动买入/卖出量</b>
			</h3>
			<el-radio-group v-model="period" :disabled="disabled" size="small" v-click-sound>
				<el-radio-button value="5m">5分钟</el-radio-button>
				<el-radio-button value="1H">1小时</el-radio-button>
				<el-radio-button value="1D">1天</el-radio-button>
			</el-radio-group>
		</div>

		<div class="container w-full h-full flex-1" v-show="!loading && !error">
			<div class="chart w-full h-[285px]" ref="chart"></div>
		</div>
		<el-skeleton :rows="7" animated v-if="loading && !error" />
		<Error :content="error" v-if="!loading && error" class="flex-1">
			<template #default>
				<el-button type="primary" @click.stop="fetchData(Period.M5, true)">点击刷新</el-button>
			</template>
		</Error>
	</div>
</template>
<style lang="less" scoped></style>
