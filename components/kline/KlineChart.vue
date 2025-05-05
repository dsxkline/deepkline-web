<script setup lang="ts">
	import { useKlineStore } from '~/store/kline'
	import DsxKlineChart from './DsxKlineChart'
	import { ChartType, CandleType, ZoomLockType, CrossModel, type DsxWindow } from './DsxKlineChart.d'
	import { useSymbolStore } from '~/store/symbol'
	const props = defineProps<{
		symbol: string
	}>()
	const symbolObj = computed(() => useSymbolStore().symbols[props.symbol])
	declare var window: DsxWindow
	const klineDom = ref(null)
	const error = ref('')
	const chart = ref<DsxKlineChart>()
	function reloadChart() {
		chart.value && chart.value.reload()
	}
	watch(
		() => useKlineStore().cycle[props.symbol],
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
		() => useKlineStore().main[props.symbol],
		newVal => {
			console.log('newVal useKlineStore().main=', newVal)
			chart.value && chart.value.selectMain(newVal)
		},{
			deep:true
		}
	)
	watch(
		() => useKlineStore().sides[props.symbol],
		newVal => {
			console.log('newVal useKlineStore().sides=', newVal)
			chart.value && chart.value.selectSides(newVal)
		},{
			deep:true
		}
	)

	watch(
		()=>useSymbolStore().symbols[props.symbol],
		(val)=>{
			const symbolDetail = val
			const point = String(symbolDetail?.tickSz).split('.')[1]?.length
			chart.value?.updateDecimal(point)
			// chart.value && chart.value.create()
		}
	)

	watch(
		() => props.symbol,
		newVal => {
			const symbolDetail = useSymbolStore().symbols[newVal]
			const point = String(symbolDetail?.tickSz).split('.')[1]?.length
			chart.value?.updateDecimal(point)
			chart.value && chart.value.tapSymbol(newVal)
		}
	)
	onMounted(() => {
		const symbol = props.symbol
		const symbolDetail = useSymbolStore().symbols[symbol]
		chart.value = new DsxKlineChart(symbol, useKlineStore().cycle[symbol], useColorMode().preference, {
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
			main: ["MA"], // 主图指标
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
		<Error :content="error" v-if="error">
			<template #default>
				<el-button type="info" @click.stop="reloadChart">点击刷新</el-button>
			</template>
		</Error>
		<div class="kline w-full h-full" ref="klineDom" v-show="!error"></div>
	</div>
</template>
