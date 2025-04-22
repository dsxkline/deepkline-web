<script setup lang="ts">
	import { useKlineStore } from '~/store/kline'
	import DsxKlineChart from './DsxKlineChart'
	import { ChartType, CandleType, ZoomLockType, CrossModel, type DsxWindow } from './DsxKlineChart.d'
	import { useSymbolStore } from '~/store/symbol'

	declare var window: DsxWindow
	const klineDom = ref(null)
	const error = ref('')
	const chart = ref<DsxKlineChart>()
	function reloadChart() {
		chart.value && chart.value.reload()
	}
	watch(
		() => useKlineStore().cycle,
		(newVal, oldVal) => {
			chart.value && chart.value.updateCycle(newVal)
		}
	)
	watch(
		() => useColorMode().preference,
		newVal => {
			chart.value && chart.value.updateTheme(newVal)
		}
	)
	watch(
		() => useKlineStore().main,
		newVal => {
			console.log('newVal useKlineStore().main=', newVal)
			chart.value && chart.value.selectMain(newVal)
		}
	)
	watch(
		() => useKlineStore().sides,
		newVal => {
			chart.value && chart.value.selectSides(newVal)
		}
	)

	watch(
		()=>useSymbolStore().symbols[useSymbolStore().activeSymbol],
		(val)=>{
			const symbolDetail = val
			const point = String(symbolDetail?.tickSz).split('.')[1]?.length
			chart.value?.updateDecimal(point)
			// chart.value && chart.value.create()
		}
	)

	watch(
		() => useSymbolStore().activeSymbol,
		newVal => {
			const symbolDetail = useSymbolStore().symbols[newVal]
			const point = String(symbolDetail?.tickSz).split('.')[1]?.length
			chart.value?.updateDecimal(point)
			chart.value && chart.value.tapSymbol(newVal)
		}
	)
	onMounted(() => {
		const symbol = useSymbolStore().activeSymbol
		const symbolDetail = useSymbolStore().symbols[symbol]
		chart.value = new DsxKlineChart(symbol, useKlineStore().cycle, useColorMode().preference, {
			element: klineDom.value || '',
			autoSize: true,
			chartType: ChartType.candle,
			// klineWidth: 1,
			candleType: CandleType.solid,
			zoomLockType: ZoomLockType.follow,
			crossModel: CrossModel.mouseOver,
			// transformers: true,
			// isShowKlineTipPannel: true,
			// sideHeight: 80,
			// paddingBottom: 20,
			// paddingMiddle: 0,
			// main: ["EMA"], // 主图指标
			sides: ['MACD','KDJ','RSI'], // 副图显示指标(两个副图，第一个显示MACD，第二个显示KDJ)
			isShowTips: true,
			allMin: false,
			decimalPoint:String(symbolDetail?.tickSz).split('.')[1]?.length,
		})
		nextTick(() => {
			chart.value && chart.value.create()
		})

		chart.value.onLoading = () => {
			error.value = ''
		}
		chart.value.onError = err => {
			error.value = '网络异常，请稍后再试'
		}

		
	})
</script>
<template>
	<div class="kline-chart-container w-full h-full">
		<el-result icon="error" title="错误提示" :sub-title="error" v-if="error">
			<template #extra>
				<el-button type="info" @click.stop="reloadChart">点击刷新</el-button>
			</template>
		</el-result>
		<div class="kline w-full h-full" ref="klineDom" v-show="!error"></div>
	</div>
</template>
