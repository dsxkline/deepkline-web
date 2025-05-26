<script lang="ts" setup>
	import { onMounted, ref } from 'vue'
	import * as echarts from 'echarts'
	import { ComposFetch } from '@/fetch'
	import { InstanceType, Period, type Instruments } from '@/fetch/okx/okx.type.d'
	import { useSymbolStore } from '~/store/symbol'
	import moment from 'moment'
	import { _borderWidth } from '#tailwind-config/theme'
import { useStore } from '~/store'
	const chart = ref(null)
	const period = ref('1H')
	const loading = ref(true)
	const error = ref('')
	const disabled = ref(false)
	const props = defineProps<{
		symbol: string
	}>()
	const symbolObj = computed<Instruments>(() => useSymbolStore().symbols[props.symbol])
	let echart: echarts.ECharts | null
	let xAxisData: string[] | null = []
	let seriesData: number[] | null = []
	// 在组件顶部声明 resizeObserver
	let resizeObserver: ResizeObserver | null = null
	const containerRef = ref(null)
	const width = ref<number>(0)
	const option = {
		legend: {
			icon: 'circle', // 可选值：'circle', 'rect', 'roundRect', 'triangle', 'diamond', 'pin', 'arrow', 'none'
			itemWidth: 6,
			itemHeight: 6,
			left: 0
		},
		tooltip: {
			trigger: 'axis',
			textStyle: {
				fontSize: 12
			},
			formatter: function (params: any[]) {
				// console.log('params',params);
				const item = params[0]
				const d = item['axisValue']
				const buyRatio = item.value
				const sellRatio = 100 - parseFloat(buyRatio)
				return `${d}</br>多仓人数 ${buyRatio}%</br>空仓人数 ${sellRatio}%`
			}
		},
		grid: {
			containLabel: true,
			top: '10', // 图表容器的上边距
			bottom: '10', // 图表容器的下边距
			left: '0', // 图表容器的左边距
			right: '5' // 图表容器的右边距
			// show: true,
			// borderColor: '#333',
			// borderWidth:1
		},
		// dataZoom: [
		// 	{
		// 		type: 'slider', // 拖动条
		// 	},
		// 	{
		// 		type: 'inside' // 鼠标滚轮
		// 	}
		// ],
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
			boundaryGap: [0, '100%'],
			max: 100,
			axisLabel: {
				formatter: function (value: string, index: number) {
					return value + '%'
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
				// symbol:"none",
				itemStyle:{
					color:'rgba(33, 150, 243, 1)'
				},
				areaStyle: {
					color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
						{
							offset: 0,
							color: 'rgba(33, 150, 243, 0.3)'
						},
						{
							offset: 1,
							color: 'rgba(33, 150, 243, 0)'
						}
					])
				},
				data: seriesData
			}
		]
	}

	function fetchData(p: Period, load = false) {
		if (disabled.value) return
		period.value = p
		disabled.value = true
		error.value = ''
		if (load) loading.value = true
		// 现货传币种，合约传id
		const symbol = props.symbol
		const request = ComposFetch.tradingDataFetch.longShortAccountRatioContractTopTrader
		request(symbol, p)
			.then(res => {
				// console.log(res?.data);
				loading.value = false
				disabled.value = false
				if (res?.code == 0) {
					xAxisData = []
					seriesData = []
					res.data.forEach(([ts, longShortAcctRatio]: any) => {
						if (p == Period.M5) xAxisData && xAxisData.push(moment(parseFloat(ts)).format('MM/DD HH:mm'))
						if (p == Period.H1) xAxisData && xAxisData.push(moment(parseFloat(ts)).format('MM/DD HH:mm'))
						if (p == Period.D1) xAxisData && xAxisData.push(moment(parseFloat(ts)).format('YYYY/MM/DD'))
						const buyRatio = ((parseFloat(longShortAcctRatio) / (1 + parseFloat(longShortAcctRatio))) * 100).toFixed(2)
						const sellRatio = 100 - parseFloat(buyRatio)

						seriesData && seriesData.push(parseFloat(parseFloat(buyRatio).toFixed(2)))
					})
					option.xAxis.data = xAxisData.reverse()
					option.series[0].data = seriesData.reverse()
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

	function createEchart() {
		echart && echart.dispose()
		echart = echarts.init(chart.value, useStore().theme == 'dark' ? 'dark' : 'light')
		echart.setOption(option)
		resetSize()
	}

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
		console.log(props.symbol, Period?.M5, process.server)
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
	<div class="w-full h-full border-b border-[--border-color] py-4 min-h-[350px] flex flex-col justify-between" ref="containerRef" :style="{ width: width > 0 ? width + 'px' : 'auto' }">
		<div class="flex items-center justify-between mb-2">
			<h3 class="text-sm flex items-center">
				<b class="text-base">精英多空持仓人数比</b>
			</h3>
			<el-radio-group v-model="period" class="" :disabled="disabled" size="small" click-sound>
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
