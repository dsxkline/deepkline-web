<script lang="ts" setup>
	import { onMounted, ref } from 'vue'
	import * as echarts from 'echarts'
	import { ComposFetch } from '@/fetch'
	import { InstanceType, Period, type Instruments } from '@/fetch/okx/okx.type.d'
	import { useSymbolStore } from '~/store/symbol'
	import moment from 'moment'
import { _borderWidth } from '#tailwind-config/theme'
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
				const d = moment(parseFloat(item['axisValue'])).format('MM/DD HH:mm')
				return `${d}</br>${item.value}`
			}
		},
		grid: {
			containLabel: true,
			top: '10', // 图表容器的上边距
			bottom: '10', // 图表容器的下边距
			left: '0', // 图表容器的左边距
			right: '0', // 图表容器的右边距
			// show: true,
			// borderColor: '#333',
			// borderWidth:1
		},
		xAxis: {
			type: 'category',
			boundaryGap: true,
			data: xAxisData,
			axisLabel: {
				show: true,
				formatter: function (value: string, index: number) {
					// 转成时间
					return moment(parseFloat(value)).format('HH:mm')
				}
			}
		},
		yAxis: {
			type: 'value',
			boundaryGap: [0, '100%']
		},
		series: [
			{
				name: '',
				type: 'line',
				// smooth: true,
				showSymbol: false,
				// sampling: 'lttb',
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
		const symbol = symbolObj.value?.instType == InstanceType.SPOT ? symbolObj.value?.baseCcy : props.symbol
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
					res.data.forEach(([ts, longShortAccountRatio]: any) => {
						xAxisData.push(ts)
						seriesData.push(longShortAccountRatio)
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
		()=>props.symbol,
		val=>{
			fetchData(period.value as Period)
		}
	)

	function createEchart(){
		echart && echart.dispose()
		echart = echarts.init(chart.value,useColorMode().value == 'dark' ? 'dark' : 'light')
		echart.setOption(option)
		echart && echart.resize()
	}

	onMounted(() => {
		console.log(props.symbol, Period?.M5, process.server)
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
					echart && echart.resize({width: width.value})
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
	<div class="w-full h-full border-b border-[--border-color] py-4 min-h-[350px] flex flex-col justify-between" ref="containerRef" :style="{ width: width > 0 ? width + 'px' : 'auto' }">
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
